#include <WiFi.h>
#include <PubSubClient.h>
#include <esp_task_wdt.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
// Add sensor library here
#include <DHT.h>

// Constants
const unsigned long WIFI_TIMEOUT = 15000;
const unsigned long MQTT_RETRY_INTERVAL = 3000;
const int WDT_TIMEOUT = 30;
const int CONFIG_PORTAL_TIMEOUT = 300000;

// WiFi and MQTT settings
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_user = "emqx";
const char* mqtt_password = "public";
const int MQTT_MAX_RETRIES = 3;

// Configuration Portal settings
const char* AP_SSID = "ESP32-Config";
const char* AP_PASS = "12345678";
const byte DNS_PORT = 53;

// Global objects
WiFiClient espClient;
PubSubClient mqttClient(espClient);
Preferences preferences;
WebServer server(80);
DNSServer dnsServer;
unsigned long configPortalStartTime = 0;
bool portalRunning = false;

#define DHTPIN 4          // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22     // DHT 22 (AM2302)
DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor
unsigned long lastDhtReadMillis = 0;
const unsigned long DHT_READ_INTERVAL_MS = 2000; // Read every 2 seconds (2000 ms)
const char* DHT_MQTT_TOPIC = "uiot/sensor/dht22"; // MQTT topic for DHT22 data

// HTML for the configuration page
const char CONFIG_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>ESP32 WiFi Setup</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      font-family: Arial, Helvetica, sans-serif; 
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
      text-align: center;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      color: #0066cc;
      margin-top: 0;
    }
    input, button {
      display: block;
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      background-color: #0066cc;
      color: white;
      border: none;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      background-color: #0055aa;
    }
    .status {
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Configure WiFi</h2>
    <form action="/save" method="POST">
      <input name="ssid" placeholder="WiFi SSID" required>
      <input name="pass" type="password" placeholder="WiFi Password">
      <button type="submit">Save & Restart</button>
    </form>
    <div class="status">
      Connect your device to a WiFi network
    </div>
  </div>
</body>
</html>
)rawliteral";

// Function declarations
bool connectToSavedWiFi();
void startConfigPortal();
bool setupMQTT();
bool reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void handleRoot();
void handleSave();

// Setup Function
void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n\n----- ESP32 WiFi-MQTT IoT Device -----");
    
    esp_task_wdt_init(WDT_TIMEOUT * 2, true);
    esp_task_wdt_add(NULL);
    
    preferences.begin("wifiCreds", false);
    
    if (!connectToSavedWiFi()) {
        startConfigPortal();
    } else {
        if (!setupMQTT()) {
            Serial.println("Initial MQTT setup failed, will retry in loop");
        }
    }
    
    // ADD SENSOR INITIALIZATION HERE
dht.begin();
Serial.println("DHT22 sensor initialized on pin 4.");
    
    esp_task_wdt_reset();
}

// Main Loop
void loop() {
    static unsigned long lastReading = 0;
    unsigned long now = millis();
    
    esp_task_wdt_reset();
    
    if (portalRunning) {
        dnsServer.processNextRequest();
        server.handleClient();
        
        if (millis() - configPortalStartTime > CONFIG_PORTAL_TIMEOUT) {
            Serial.println("⏱️ Configuration portal timeout reached");
            Serial.println("🔄 Restarting device...");
            ESP.restart();
        }
        return;
    }
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost, trying to reconnect...");
        if (!connectToSavedWiFi()) {
            startConfigPortal();
            return;
        }
    }
    
    if (!mqttClient.connected() && !reconnectMQTT()) {
        delay(MQTT_RETRY_INTERVAL);
        return;
    }
    
    mqttClient.loop();
    
    // ADD SENSOR READING AND PUBLISHING CODE HERE
if (millis() - lastDhtReadMillis >= DHT_READ_INTERVAL_MS) {
    lastDhtReadMillis = millis();

    // Read temperature (Celsius)
    float temperature = dht.readTemperature();
    // Read humidity
    float humidity = dht.readHumidity();

    // Check if any reads failed and exit early (to try again next cycle)
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT22 sensor!");
        return; // Skip publishing if data is not valid
    }

    // Construct JSON payload
    // Example: {"temperature":25.5,"humidity":60.2}
    String payload = "{\"temperature\":" + String(temperature, 2) + ",\"humidity\":" + String(humidity, 2) + "}";

    // Publish to MQTT
    if (mqttClient.publish(DHT_MQTT_TOPIC, payload.c_str())) {
        Serial.print("Published DHT22 data to ");
        Serial.print(DHT_MQTT_TOPIC);
        Serial.print(": ");
        Serial.println(payload);
    } else {
        Serial.print("Failed to publish DHT22 data to ");
        Serial.println(DHT_MQTT_TOPIC);
    }
}
    
    delay(10);
}

bool connectToSavedWiFi() {
    String ssid = preferences.getString("ssid", "");
    String pass = preferences.getString("pass", "");
    
    if (ssid.length() == 0) {
        Serial.println("ℹ️ No saved WiFi credentials found");
        return false;
    }
    
    Serial.print("📶 Connecting to saved WiFi: ");
    Serial.println(ssid);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());
    
    unsigned long startAttemptTime = millis();
    
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < WIFI_TIMEOUT) {
        Serial.print(".");
        delay(500);
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ Connected to WiFi!");
        Serial.print("📱 IP address: ");
        Serial.println(WiFi.localIP());
        return true;
    } else {
        Serial.println("\n❌ Failed to connect to saved WiFi");
        WiFi.disconnect();
        return false;
    }
}

void startConfigPortal() {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASS);
    delay(100);
    
    Serial.println("\n🔧 Configuration Portal Started");
    Serial.println("================================");
    Serial.print("📡 SSID: ");
    Serial.println(AP_SSID);
    Serial.print("🔑 Password: ");
    Serial.println(AP_PASS);
    Serial.print("🌐 IP Address: ");
    Serial.println(WiFi.softAPIP());
    Serial.println("================================\n");
    
    dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
    
    server.on("/", HTTP_GET, handleRoot);
    server.on("/save", HTTP_POST, handleSave);
    server.onNotFound(handleRoot);
    server.begin();
    
    Serial.println("✅ WebServer ready - Connect to configure WiFi");
    
    portalRunning = true;
    configPortalStartTime = millis();
}

bool setupMQTT() {
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
    return reconnectMQTT();
}

bool reconnectMQTT() {
    int retries = 0;
    while (!mqttClient.connected() && retries < MQTT_MAX_RETRIES) {
        Serial.println("🔌 Attempting MQTT connection...");
        String clientId = "ESP32Client-" + String(random(0xffff), HEX);
        
        if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
            Serial.println("✅ Connected to MQTT broker");
            mqttClient.subscribe("uiot/commands");
            return true;
        } else {
            Serial.print("❌ Failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" - Retrying in 3 seconds");
            retries++;
            delay(MQTT_RETRY_INTERVAL);
        }
    }
    return false;
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    
    Serial.print("📨 Message received [");
    Serial.print(topic);
    Serial.print("]: ");
    Serial.println(message);
    
    // ADD COMMAND HANDLING HERE
// No specific MQTT command handling required for DHT22 sensor based on current request.
// Add logic here if you need to, for example, trigger an immediate read.
/*
if (strcmp(topic, "uiot/commands/dht22") == 0) {
    if (strcmp(message, "READ_NOW") == 0) {
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();
        if (!isnan(temperature) && !isnan(humidity)) {
            String payload = "{\"temperature\":" + String(temperature, 2) + ",\"humidity\":" + String(humidity, 2) + "}";
            mqttClient.publish(DHT_MQTT_TOPIC, payload.c_str());
            Serial.println("Forced DHT22 read and published.");
        } else {
            Serial.println("Forced DHT22 read failed.");
        }
    }
}
*/
}

void handleRoot() {
    server.send(200, "text/html", CONFIG_HTML);
}

void handleSave() {
    String new_ssid = server.arg("ssid");
    String new_pass = server.arg("pass");
    
    new_ssid.trim();
    new_pass.trim();
    
    if (new_ssid.length() == 0) {
        server.send(400, "text/html", "<h3>⚠️ SSID cannot be empty! <a href='/'>Go back</a></h3>");
        return;
    }
    
    String old_ssid = preferences.getString("ssid", "");
    String old_pass = preferences.getString("pass", "");
    
    bool changed = (new_ssid != old_ssid) || (new_pass != old_pass);
    
    if (changed) {
        preferences.putString("ssid", new_ssid);
        preferences.putString("pass", new_pass);
        Serial.println("✅ WiFi credentials CHANGED");
        Serial.print("New SSID: ");
        Serial.println(new_ssid);
    } else {
        Serial.println("ℹ️ WiFi credentials NOT changed (same as before)");
    }
    
    server.send(200, "text/html", 
        "<html><body style='text-align:center;font-family:Arial;padding:50px;'>"
        "<h3>" + String(changed ? "✅ WiFi credentials saved!" : "ℹ️ Same credentials entered.") + "</h3>"
        "<p>Device will restart in a few seconds...</p>"
        "</body></html>");
    
    delay(3000);
    ESP.restart();
}