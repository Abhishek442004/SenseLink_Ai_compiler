// const express = require('express');
// const cors = require('cors');
// const fs = require('fs').promises;
// const path = require('path');
// const { exec } = require('child_process');
// const { promisify } = require('util');

// const execAsync = promisify(exec);
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// // Directories
// const TEMP_DIR = path.join(__dirname, 'temp');
// const OUTPUT_DIR = path.join(__dirname, 'output');

// // Board configurations for PlatformIO
// const BOARDS = {
//   'esp32dev': { id: 'esp32dev', name: 'ESP32 Dev Module' },
//   'esp32-wrover-kit': { id: 'esp32-wrover-kit', name: 'ESP32 Wrover Module' },
//   'esp32-s2-saola-1': { id: 'esp32-s2-saola-1', name: 'ESP32-S2 Saola' },
//   'esp32-s3-devkitc-1': { id: 'esp32-s3-devkitc-1', name: 'ESP32-S3 DevKit' },
//   'esp32-c3-devkitm-1': { id: 'esp32-c3-devkitm-1', name: 'ESP32-C3 DevKit' },
//   'esp32-c6-devkitc-1': { id: 'esp32-c6-devkitc-1', name: 'ESP32-C6 DevKit' },
//   'nodemcu-32s': { id: 'nodemcu-32s', name: 'NodeMCU-32S' },
//   'lolin32': { id: 'lolin32', name: 'Wemos Lolin32' }
// };

// // Initialize directories
// async function initDirectories() {
//   try {
//     await fs.mkdir(TEMP_DIR, { recursive: true });
//     await fs.mkdir(OUTPUT_DIR, { recursive: true });
//     console.log('Directories initialized');
//   } catch (error) {
//     console.error('Error creating directories:', error);
//   }
// }

// // Create platformio.ini content
// function createPlatformIOConfig(board) {
//   return `[env:${board}]
// platform = espressif32
// board = ${board}
// framework = arduino
// monitor_speed = 115200
// `;
// }

// // Compile code using PlatformIO
// async function compilePlatformIO(projectPath, board) {
//   try {
//     // Change to project directory and run PlatformIO compile
//     const command = `cd "${projectPath}" && pio run`;
    
//     console.log(`Executing: ${command}`);
//     const { stdout, stderr } = await execAsync(command, {
//       maxBuffer: 1024 * 1024 * 10, // 10MB buffer
//       timeout: 300000 // 5 minute timeout
//     });

//     console.log('PlatformIO stdout:', stdout);
//     if (stderr) console.log('PlatformIO stderr:', stderr);

//     // Find the .bin file in .pio/build directory
//     const buildDir = path.join(projectPath, '.pio', 'build', board);
//     const files = await fs.readdir(buildDir);
//     const binFile = files.find(f => f.endsWith('.bin'));

//     if (!binFile) {
//       throw new Error('No .bin file generated');
//     }

//     return path.join(buildDir, binFile);
//   } catch (error) {
//     console.error('PlatformIO compilation error:', error);
//     throw error;
//   }
// }

// // Compile endpoint
// app.post('/compile', async (req, res) => {
//   const { code, filename, board = 'esp32dev' } = req.body;

//   if (!code || !filename) {
//     return res.status(400).json({ error: 'Code and filename are required' });
//   }

//   if (!BOARDS[board]) {
//     return res.status(400).json({ error: 'Invalid board selected' });
//   }

//   const timestamp = Date.now();
//   const projectName = `${filename}_${timestamp}`;
//   const projectPath = path.join(TEMP_DIR, projectName);
//   const srcPath = path.join(projectPath, 'src');

//   try {
//     console.log(`Compiling ${filename} for board ${board}...`);

//     // Create project structure
//     await fs.mkdir(projectPath, { recursive: true });
//     await fs.mkdir(srcPath, { recursive: true });

//     // Write platformio.ini
//     const platformIOConfig = createPlatformIOConfig(board);
//     await fs.writeFile(path.join(projectPath, 'platformio.ini'), platformIOConfig);

//     // Write the main.cpp file (PlatformIO uses .cpp extension)
//     await fs.writeFile(path.join(srcPath, 'main.cpp'), code);

//     // Compile using PlatformIO
//     const binPath = await compilePlatformIO(projectPath, board);

//     // Copy to output directory with a clean name
//     const outputFilename = `${filename}.bin`;
//     const outputPath = path.join(OUTPUT_DIR, outputFilename);
//     await fs.copyFile(binPath, outputPath);

//     console.log(`✅ Compilation successful: ${outputFilename}`);

//     res.json({
//       success: true,
//       message: 'Compilation successful',
//       binFile: outputFilename,
//       boardName: BOARDS[board].name
//     });

//     // Cleanup temp directory after a delay
//     setTimeout(async () => {
//       try {
//         await fs.rm(projectPath, { recursive: true, force: true });
//         console.log(`Cleaned up temp directory: ${projectName}`);
//       } catch (err) {
//         console.error('Error cleaning up:', err);
//       }
//     }, 5000);

//   } catch (error) {
//     console.error('Compilation error:', error);
    
//     // Cleanup on error
//     try {
//       await fs.rm(projectPath, { recursive: true, force: true });
//     } catch (cleanupError) {
//       console.error('Error during cleanup:', cleanupError);
//     }

//     res.status(500).json({
//       error: 'Compilation failed',
//       details: error.message,
//       stderr: error.stderr || ''
//     });
//   }
// });

// // Download endpoint
// app.get('/download/:filename', async (req, res) => {
//   const { filename } = req.params;
//   const filepath = path.join(OUTPUT_DIR, filename);

//   try {
//     await fs.access(filepath);
//     res.download(filepath);
//   } catch (error) {
//     res.status(404).json({ error: 'File not found' });
//   }
// });

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ok',
//     boards: Object.keys(BOARDS).map(key => BOARDS[key].name)
//   });
// });

// // Start server
// app.listen(PORT, async () => {
//   await initDirectories();
//   console.log(`ESP32 Compiler Backend running on http://localhost:${PORT}`);
//   console.log('Boards available:', Object.values(BOARDS).map(b => b.name).join(', '));
//   console.log('\n⚠️  Make sure PlatformIO is installed: pip install platformio');
// });































//this code is only for the manual entering the code and compiling it 



// const express = require('express');
// const cors = require('cors');
// const fs = require('fs').promises;
// const path = require('path');
// const { exec } = require('child_process');
// const { promisify } = require('util');

// const execAsync = promisify(exec);
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// // Directories
// const TEMP_DIR = path.join(__dirname, 'temp');
// const OUTPUT_DIR = path.join(__dirname, 'output');

// // Board configurations for PlatformIO
// const BOARDS = {
//   'esp32dev': { id: 'esp32dev', name: 'ESP32 Dev Module' },
//   'esp32-wrover-kit': { id: 'esp32-wrover-kit', name: 'ESP32 Wrover Module' },
//   'esp32-s2-saola-1': { id: 'esp32-s2-saola-1', name: 'ESP32-S2 Saola' },
//   'esp32-s3-devkitc-1': { id: 'esp32-s3-devkitc-1', name: 'ESP32-S3 DevKit' },
//   'esp32-c3-devkitm-1': { id: 'esp32-c3-devkitm-1', name: 'ESP32-C3 DevKit' },
//   'esp32-c6-devkitc-1': { id: 'esp32-c6-devkitc-1', name: 'ESP32-C6 DevKit' },
//   'nodemcu-32s': { id: 'nodemcu-32s', name: 'NodeMCU-32S' },
//   'lolin32': { id: 'lolin32', name: 'Wemos Lolin32' }
// };

// // Initialize directories
// async function initDirectories() {
//   try {
//     await fs.mkdir(TEMP_DIR, { recursive: true });
//     await fs.mkdir(OUTPUT_DIR, { recursive: true });
//     console.log('Directories initialized');
//   } catch (error) {
//     console.error('Error creating directories:', error);
//   }
// }

// // Create platformio.ini content
// function createPlatformIOConfig(board) {
//   return `[env:${board}]
// platform = espressif32
// board = ${board}
// framework = arduino
// monitor_speed = 115200
// board_build.flash_mode = dio
// board_build.partitions = default.csv
// `;
// }

// // Merge binary files into a single flashable binary
// async function mergeBinaries(projectPath, board) {
//   try {
//     const buildDir = path.join(projectPath, '.pio', 'build', board);
    
//     // Find all the necessary binary files
//     const firmwareBin = path.join(buildDir, 'firmware.bin');
//     const bootloaderBin = path.join(buildDir, 'bootloader.bin');
//     const partitionsBin = path.join(buildDir, 'partitions.bin');
    
//     // Check if firmware exists
//     await fs.access(firmwareBin);
    
//     // Use esptool.py to merge all binaries
//     // Typical flash addresses for ESP32:
//     // Bootloader: 0x1000
//     // Partitions: 0x8000
//     // boot_app0: 0xe000
//     // Firmware: 0x10000
    
//     const mergedBin = path.join(buildDir, 'merged-firmware.bin');
    
//     // Use PlatformIO's merge functionality with esptool
//     const mergeCommand = `cd "${projectPath}" && pio run --target buildfs && esptool.py --chip esp32 merge_bin -o "${mergedBin}" --flash_mode dio --flash_freq 40m --flash_size 4MB 0x1000 "${bootloaderBin}" 0x8000 "${partitionsBin}" 0xe000 "${buildDir}/boot_app0.bin" 0x10000 "${firmwareBin}"`;
    
//     try {
//       const { stdout, stderr } = await execAsync(mergeCommand, {
//         maxBuffer: 1024 * 1024 * 10,
//         timeout: 60000
//       });
//       console.log('Merge output:', stdout);
//       if (stderr) console.log('Merge stderr:', stderr);
//     } catch (mergeError) {
//       // If esptool merge fails, try alternative method using pio run --target
//       console.log('Direct merge failed, using alternative method...');
      
//       // Alternative: Use PlatformIO's built-in merge
//       const altCommand = `cd "${projectPath}" && pio run --target upload --upload-port /dev/null 2>&1 | grep -o "esptool.py.*" || echo ""`;
      
//       // Actually, let's use a more reliable method - manually merge the files
//       await manualMergeBinaries(buildDir, mergedBin, board);
//     }
    
//     // Verify merged binary exists
//     await fs.access(mergedBin);
//     return mergedBin;
    
//   } catch (error) {
//     console.error('Error merging binaries:', error);
//     throw new Error(`Failed to merge binaries: ${error.message}`);
//   }
// }

// // Manual binary merging function
// async function manualMergeBinaries(buildDir, outputPath, board) {
//   try {
//     // Flash memory layout for ESP32
//     const BOOTLOADER_OFFSET = 0x1000;
//     const PARTITION_OFFSET = 0x8000;
//     const BOOT_APP0_OFFSET = 0xe000;
//     const FIRMWARE_OFFSET = 0x10000;
    
//     // Total size for merged binary (4MB for most ESP32 boards)
//     const FLASH_SIZE = 4 * 1024 * 1024;
    
//     // Create a buffer filled with 0xFF (erased flash state)
//     const mergedBuffer = Buffer.alloc(FLASH_SIZE, 0xFF);
    
//     // Read all binary files
//     const bootloaderBin = path.join(buildDir, 'bootloader.bin');
//     const partitionsBin = path.join(buildDir, 'partitions.bin');
//     const bootApp0Bin = path.join(buildDir, 'boot_app0.bin');
//     const firmwareBin = path.join(buildDir, 'firmware.bin');
    
//     // Write bootloader
//     try {
//       const bootloader = await fs.readFile(bootloaderBin);
//       bootloader.copy(mergedBuffer, BOOTLOADER_OFFSET);
//       console.log(`✓ Bootloader copied (${bootloader.length} bytes at 0x${BOOTLOADER_OFFSET.toString(16)})`);
//     } catch (e) {
//       console.log('⚠ Bootloader not found, skipping...');
//     }
    
//     // Write partition table
//     try {
//       const partitions = await fs.readFile(partitionsBin);
//       partitions.copy(mergedBuffer, PARTITION_OFFSET);
//       console.log(`✓ Partitions copied (${partitions.length} bytes at 0x${PARTITION_OFFSET.toString(16)})`);
//     } catch (e) {
//       console.log('⚠ Partitions not found, skipping...');
//     }
    
//     // Write boot_app0
//     try {
//       const bootApp0 = await fs.readFile(bootApp0Bin);
//       bootApp0.copy(mergedBuffer, BOOT_APP0_OFFSET);
//       console.log(`✓ boot_app0 copied (${bootApp0.length} bytes at 0x${BOOT_APP0_OFFSET.toString(16)})`);
//     } catch (e) {
//       console.log('⚠ boot_app0 not found, skipping...');
//     }
    
//     // Write firmware
//     const firmware = await fs.readFile(firmwareBin);
//     firmware.copy(mergedBuffer, FIRMWARE_OFFSET);
//     console.log(`✓ Firmware copied (${firmware.length} bytes at 0x${FIRMWARE_OFFSET.toString(16)})`);
    
//     // Calculate actual size (trim trailing 0xFF bytes)
//     let actualSize = FLASH_SIZE;
//     for (let i = FLASH_SIZE - 1; i >= 0; i--) {
//       if (mergedBuffer[i] !== 0xFF) {
//         actualSize = i + 1;
//         break;
//       }
//     }
    
//     // Write merged binary (truncated to actual size to save space)
//     await fs.writeFile(outputPath, mergedBuffer.slice(0, actualSize));
//     console.log(`✓ Merged binary created: ${actualSize} bytes`);
    
//   } catch (error) {
//     console.error('Manual merge error:', error);
//     throw error;
//   }
// }

// // Compile code using PlatformIO
// async function compilePlatformIO(projectPath, board) {
//   try {
//     // Change to project directory and run PlatformIO compile
//     const command = `cd "${projectPath}" && pio run`;
    
//     console.log(`Executing: ${command}`);
//     const { stdout, stderr } = await execAsync(command, {
//       maxBuffer: 1024 * 1024 * 10, // 10MB buffer
//       timeout: 300000 // 5 minute timeout
//     });

//     console.log('PlatformIO stdout:', stdout);
//     if (stderr) console.log('PlatformIO stderr:', stderr);

//     // Merge all binaries
//     const mergedBinPath = await mergeBinaries(projectPath, board);
    
//     return mergedBinPath;
//   } catch (error) {
//     console.error('PlatformIO compilation error:', error);
//     throw error;
//   }
// }

// // Compile endpoint
// app.post('/compile', async (req, res) => {
//   const { code, filename, board = 'esp32dev' } = req.body;

//   if (!code || !filename) {
//     return res.status(400).json({ error: 'Code and filename are required' });
//   }

//   if (!BOARDS[board]) {
//     return res.status(400).json({ error: 'Invalid board selected' });
//   }

//   const timestamp = Date.now();
//   const projectName = `${filename}_${timestamp}`;
//   const projectPath = path.join(TEMP_DIR, projectName);
//   const srcPath = path.join(projectPath, 'src');

//   try {
//     console.log(`Compiling ${filename} for board ${board}...`);

//     // Create project structure
//     await fs.mkdir(projectPath, { recursive: true });
//     await fs.mkdir(srcPath, { recursive: true });

//     // Write platformio.ini
//     const platformIOConfig = createPlatformIOConfig(board);
//     await fs.writeFile(path.join(projectPath, 'platformio.ini'), platformIOConfig);

//     // Write the main.cpp file (PlatformIO uses .cpp extension)
//     await fs.writeFile(path.join(srcPath, 'main.cpp'), code);

//     // Compile using PlatformIO (now returns merged binary)
//     const mergedBinPath = await compilePlatformIO(projectPath, board);

//     // Copy to output directory with a clean name
//     const outputFilename = `${filename}_merged.bin`;
//     const outputPath = path.join(OUTPUT_DIR, outputFilename);
//     await fs.copyFile(mergedBinPath, outputPath);

//     // Get file size
//     const stats = await fs.stat(outputPath);
//     const fileSizeKB = (stats.size / 1024).toFixed(2);

//     console.log(`✅ Compilation successful: ${outputFilename} (${fileSizeKB} KB)`);

//     res.json({
//       success: true,
//       message: 'Compilation successful - Merged binary ready',
//       binFile: outputFilename,
//       boardName: BOARDS[board].name,
//       fileSize: `${fileSizeKB} KB`,
//       info: 'This binary includes bootloader, partitions, boot_app0, and firmware - ready to flash at 0x0000'
//     });

//     // Cleanup temp directory after a delay
//     setTimeout(async () => {
//       try {
//         await fs.rm(projectPath, { recursive: true, force: true });
//         console.log(`Cleaned up temp directory: ${projectName}`);
//       } catch (err) {
//         console.error('Error cleaning up:', err);
//       }
//     }, 5000);

//   } catch (error) {
//     console.error('Compilation error:', error);
    
//     // Cleanup on error
//     try {
//       await fs.rm(projectPath, { recursive: true, force: true });
//     } catch (cleanupError) {
//       console.error('Error during cleanup:', cleanupError);
//     }

//     res.status(500).json({
//       error: 'Compilation failed',
//       details: error.message,
//       stderr: error.stderr || ''
//     });
//   }
// });

// // Download endpoint
// app.get('/download/:filename', async (req, res) => {
//   const { filename } = req.params;
//   const filepath = path.join(OUTPUT_DIR, filename);

//   try {
//     await fs.access(filepath);
//     res.download(filepath);
//   } catch (error) {
//     res.status(404).json({ error: 'File not found' });
//   }
// });

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ok',
//     boards: Object.keys(BOARDS).map(key => BOARDS[key].name)
//   });
// });

// // Start server
// app.listen(PORT, async () => {
//   await initDirectories();
//   console.log(`ESP32 Compiler Backend running on http://localhost:${PORT}`);
//   console.log('Boards available:', Object.values(BOARDS).map(b => b.name).join(', '));
//   console.log('\n⚠️  Make sure PlatformIO is installed: pip install platformio');
//   console.log('⚠️  Make sure esptool is installed: pip install esptool');
// });

























const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const execAsync = promisify(exec);
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyB3KsN4N3ircjXQt5AY1v-piTHFoKPQEVg'; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Directories
const TEMP_DIR = path.join(__dirname, 'temp');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Board configurations for PlatformIO
const BOARDS = {
  'esp32dev': { id: 'esp32dev', name: 'ESP32 Dev Module' },
  'esp32-wrover-kit': { id: 'esp32-wrover-kit', name: 'ESP32 Wrover Module' },
  'esp32-s2-saola-1': { id: 'esp32-s2-saola-1', name: 'ESP32-S2 Saola' },
  'esp32-s3-devkitc-1': { id: 'esp32-s3-devkitc-1', name: 'ESP32-S3 DevKit' },
  'esp32-c3-devkitm-1': { id: 'esp32-c3-devkitm-1', name: 'ESP32-C3 DevKit' },
  'esp32-c6-devkitc-1': { id: 'esp32-c6-devkitc-1', name: 'ESP32-C6 DevKit' },
  'nodemcu-32s': { id: 'nodemcu-32s', name: 'NodeMCU-32S' },
  'lolin32': { id: 'lolin32', name: 'Wemos Lolin32' }
};

// Skeleton code template
const SKELETON_CODE = `#include <WiFi.h>
#include <PubSubClient.h>
#include <esp_task_wdt.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
// Add sensor library here
{{SENSOR_LIBRARIES}}

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

{{SENSOR_GLOBALS}}

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
    
    Serial.println("\\n\\n----- ESP32 WiFi-MQTT IoT Device -----");
    
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
{{SENSOR_INIT}}
    
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
{{SENSOR_LOOP}}
    
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
        Serial.println("\\n✅ Connected to WiFi!");
        Serial.print("📱 IP address: ");
        Serial.println(WiFi.localIP());
        return true;
    } else {
        Serial.println("\\n❌ Failed to connect to saved WiFi");
        WiFi.disconnect();
        return false;
    }
}

void startConfigPortal() {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASS);
    delay(100);
    
    Serial.println("\\n🔧 Configuration Portal Started");
    Serial.println("================================");
    Serial.print("📡 SSID: ");
    Serial.println(AP_SSID);
    Serial.print("🔑 Password: ");
    Serial.println(AP_PASS);
    Serial.print("🌐 IP Address: ");
    Serial.println(WiFi.softAPIP());
    Serial.println("================================\\n");
    
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
{{MQTT_CALLBACK}}
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
}`;

// Initialize directories
async function initDirectories() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log('Directories initialized');
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Generate code using Gemini AI
async function generateSensorCode(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert ESP32 Arduino programmer. Generate ONLY the sensor-specific code based on the user's requirements.

USER REQUEST: ${userPrompt}

INSTRUCTIONS:
1. Analyze the sensor type, pin configuration, and desired functionality
2. Generate code in EXACTLY 4 sections with these markers:
   - LIBRARIES: All #include statements for sensor libraries (one per line)
   - GLOBALS: Global variables, sensor objects, constants
   - INIT: Sensor initialization code for setup()
   - LOOP: Sensor reading and MQTT publishing code for loop()
   - CALLBACK: MQTT command handling code (if needed)

3. Use these exact section markers:
   // SECTION: LIBRARIES
   // SECTION: GLOBALS
   // SECTION: INIT
   // SECTION: LOOP
   // SECTION: CALLBACK

4. For MQTT publishing, use: mqttClient.publish("topic", message)
5. Include error handling and Serial.println() for debugging
6. Keep code efficient and production-ready
7. DO NOT include any WiFi, MQTT setup, or skeleton code
8. DO NOT include any #include statements that are already in the skeleton (WiFi.h, PubSubClient.h, WebServer.h, Preferences.h, DNSServer.h, esp_task_wdt.h)

EXAMPLE FORMAT:

// SECTION: LIBRARIES
#include <DHT.h>

// SECTION: GLOBALS
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
unsigned long lastDHTRead = 0;
const unsigned long DHT_INTERVAL = 2000;

// SECTION: INIT
dht.begin();
Serial.println("DHT22 sensor initialized on pin 4");

// SECTION: LOOP
if (millis() - lastDHTRead >= DHT_INTERVAL) {
    lastDHTRead = millis();
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    if (!isnan(temp) && !isnan(humidity)) {
        String payload = "{\\"temp\\":" + String(temp) + ",\\"humidity\\":" + String(humidity) + "}";
        mqttClient.publish("uiot/sensor/dht22", payload.c_str());
        Serial.println("Published: " + payload);
    }
}

// SECTION: CALLBACK
if (strcmp(topic, "uiot/commands") == 0) {
    if (message == "READ") {
        float temp = dht.readTemperature();
        mqttClient.publish("uiot/sensor/dht22", String(temp).c_str());
    }
}

Now generate the code for: ${userPrompt}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedCode = response.text();

    console.log('Generated code from Gemini:', generatedCode);
    return generatedCode;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI code generation failed: ${error.message}`);
  }
}

// Parse generated code sections
function parseGeneratedCode(generatedCode) {
  const sections = {
    libraries: '',
    globals: '',
    init: '',
    loop: '',
    callback: ''
  };

  const librariesMatch = generatedCode.match(/\/\/ SECTION: LIBRARIES\s*([\s\S]*?)(?=\/\/ SECTION:|$)/);
  const globalsMatch = generatedCode.match(/\/\/ SECTION: GLOBALS\s*([\s\S]*?)(?=\/\/ SECTION:|$)/);
  const initMatch = generatedCode.match(/\/\/ SECTION: INIT\s*([\s\S]*?)(?=\/\/ SECTION:|$)/);
  const loopMatch = generatedCode.match(/\/\/ SECTION: LOOP\s*([\s\S]*?)(?=\/\/ SECTION:|$)/);
  const callbackMatch = generatedCode.match(/\/\/ SECTION: CALLBACK\s*([\s\S]*?)(?=\/\/ SECTION:|$)/);

  if (librariesMatch) sections.libraries = librariesMatch[1].trim();
  if (globalsMatch) sections.globals = globalsMatch[1].trim();
  if (initMatch) sections.init = initMatch[1].trim();
  if (loopMatch) sections.loop = loopMatch[1].trim();
  if (callbackMatch) sections.callback = callbackMatch[1].trim();

  return sections;
}

// Merge generated code with skeleton
function mergeCodeWithSkeleton(sections) {
  let mergedCode = SKELETON_CODE;

  mergedCode = mergedCode.replace('{{SENSOR_LIBRARIES}}', sections.libraries);
  mergedCode = mergedCode.replace('{{SENSOR_GLOBALS}}', sections.globals);
  mergedCode = mergedCode.replace('{{SENSOR_INIT}}', sections.init);
  mergedCode = mergedCode.replace('{{SENSOR_LOOP}}', sections.loop);
  mergedCode = mergedCode.replace('{{MQTT_CALLBACK}}', sections.callback);

  return mergedCode;
}

// Extract libraries from code
function extractLibraries(code) {
  const libraries = [];
  const includePattern = /#include\s*[<"]([^>"]+)[>"]/g;
  let match;

  while ((match = includePattern.exec(code)) !== null) {
    const libName = match[1];
    // Skip standard libraries
    if (!['WiFi.h', 'WebServer.h', 'Preferences.h', 'DNSServer.h', 'esp_task_wdt.h'].includes(libName)) {
      libraries.push(libName);
    }
  }

  return libraries;
}

// Map library names to PlatformIO library IDs
function mapLibraryToPlatformIO(libName) {
  const libraryMap = {
    'DHT.h': 'adafruit/DHT sensor library',
    'Adafruit_Sensor.h': 'adafruit/Adafruit Unified Sensor',
    'Wire.h': '', // Built-in
    'SPI.h': '', // Built-in
    'Adafruit_BMP280.h': 'adafruit/Adafruit BMP280 Library',
    'Adafruit_BME280.h': 'adafruit/Adafruit BME280 Library',
    'OneWire.h': 'paulstoffregen/OneWire',
    'DallasTemperature.h': 'milesburton/DallasTemperature',
    'Adafruit_GFX.h': 'adafruit/Adafruit GFX Library',
    'Adafruit_SSD1306.h': 'adafruit/Adafruit SSD1306',
    'ArduinoJson.h': 'bblanchon/ArduinoJson',
    'MPU6050.h': 'electroniccats/MPU6050',
    'Adafruit_MPU6050.h': 'adafruit/Adafruit MPU6050',
    'Adafruit_NeoPixel.h': 'adafruit/Adafruit NeoPixel',
    'Servo.h': 'arduino-libraries/Servo',
    'MFRC522.h': 'miguelbalboa/MFRC522',
    'PubSubClient.h': 'knolleary/PubSubClient',
    'PZEM004Tv30.h': 'mandulaj/PZEM-004T-v30',
    'LiquidCrystal_I2C.h': 'marcoschwartz/LiquidCrystal_I2C'
  };

  return libraryMap[libName] || '';
}

// Create platformio.ini with detected libraries
function createPlatformIOConfig(board, libraries) {
  let config = `[env:${board}]
platform = espressif32
board = ${board}
framework = arduino
monitor_speed = 115200
board_build.flash_mode = dio
board_build.partitions = default.csv
`;

  if (libraries.length > 0) {
    const platformIOLibs = libraries
      .map(lib => mapLibraryToPlatformIO(lib))
      .filter(lib => lib !== '');
    
    if (platformIOLibs.length > 0) {
      config += `lib_deps = \n`;
      platformIOLibs.forEach(lib => {
        config += `    ${lib}\n`;
      });
    }
  }

  return config;
}

// Validate generated code
function validateCode(code) {
  const errors = [];
  
  // Check for required structure
  if (!code.includes('void setup()')) {
    errors.push('Missing setup() function');
  }
  if (!code.includes('void loop()')) {
    errors.push('Missing loop() function');
  }
  
  // Check for dangerous functions
  const dangerousFunctions = ['system(', 'exec(', 'popen(', 'eval('];
  dangerousFunctions.forEach(func => {
    if (code.includes(func)) {
      errors.push(`Dangerous function detected: ${func}`);
    }
  });
  
  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces in code');
  }
  
  return { valid: errors.length === 0, errors };
}

// Manual binary merging function
async function manualMergeBinaries(buildDir, outputPath) {
  try {
    const BOOTLOADER_OFFSET = 0x1000;
    const PARTITION_OFFSET = 0x8000;
    const BOOT_APP0_OFFSET = 0xe000;
    const FIRMWARE_OFFSET = 0x10000;
    const FLASH_SIZE = 4 * 1024 * 1024;
    
    const mergedBuffer = Buffer.alloc(FLASH_SIZE, 0xFF);
    
    const bootloaderBin = path.join(buildDir, 'bootloader.bin');
    const partitionsBin = path.join(buildDir, 'partitions.bin');
    const bootApp0Bin = path.join(buildDir, 'boot_app0.bin');
    const firmwareBin = path.join(buildDir, 'firmware.bin');
    
    try {
      const bootloader = await fs.readFile(bootloaderBin);
      bootloader.copy(mergedBuffer, BOOTLOADER_OFFSET);
      console.log(`✓ Bootloader copied (${bootloader.length} bytes)`);
    } catch (e) {
      console.log('⚠ Bootloader not found');
    }
    
    try {
      const partitions = await fs.readFile(partitionsBin);
      partitions.copy(mergedBuffer, PARTITION_OFFSET);
      console.log(`✓ Partitions copied (${partitions.length} bytes)`);
    } catch (e) {
      console.log('⚠ Partitions not found');
    }
    
    try {
      const bootApp0 = await fs.readFile(bootApp0Bin);
      bootApp0.copy(mergedBuffer, BOOT_APP0_OFFSET);
      console.log(`✓ boot_app0 copied (${bootApp0.length} bytes)`);
    } catch (e) {
      console.log('⚠ boot_app0 not found');
    }
    
    const firmware = await fs.readFile(firmwareBin);
    firmware.copy(mergedBuffer, FIRMWARE_OFFSET);
    console.log(`✓ Firmware copied (${firmware.length} bytes)`);
    
    let actualSize = FLASH_SIZE;
    for (let i = FLASH_SIZE - 1; i >= 0; i--) {
      if (mergedBuffer[i] !== 0xFF) {
        actualSize = i + 1;
        break;
      }
    }
    
    await fs.writeFile(outputPath, mergedBuffer.slice(0, actualSize));
    console.log(`✓ Merged binary created: ${actualSize} bytes`);
    
  } catch (error) {
    console.error('Manual merge error:', error);
    throw error;
  }
}

// Merge binaries
async function mergeBinaries(projectPath, board) {
  try {
    const buildDir = path.join(projectPath, '.pio', 'build', board);
    const mergedBin = path.join(buildDir, 'merged-firmware.bin');
    
    await manualMergeBinaries(buildDir, mergedBin);
    await fs.access(mergedBin);
    
    return mergedBin;
  } catch (error) {
    console.error('Error merging binaries:', error);
    throw error;
  }
}

// Compile code using PlatformIO
async function compilePlatformIO(projectPath, board) {
  try {
    const command = `cd "${projectPath}" && pio run`;
    
    console.log(`Executing: ${command}`);
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10,
      timeout: 300000
    });

    console.log('PlatformIO stdout:', stdout);
    if (stderr) console.log('PlatformIO stderr:', stderr);

    const mergedBinPath = await mergeBinaries(projectPath, board);
    return mergedBinPath;
  } catch (error) {
    console.error('PlatformIO compilation error:', error);
    throw error;
  }
}

// AI-powered compile endpoint
app.post('/ai-compile', async (req, res) => {
  const { prompt, board = 'esp32dev' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!BOARDS[board]) {
    return res.status(400).json({ error: 'Invalid board selected' });
  }

  const timestamp = Date.now();
  const projectName = `ai_project_${timestamp}`;
  const projectPath = path.join(TEMP_DIR, projectName);
  const srcPath = path.join(projectPath, 'src');

  try {
    console.log(`\n🤖 AI Code Generation for: ${prompt}`);

    // Step 1: Generate code using Gemini
    const generatedCode = await generateSensorCode(prompt);
    
    // Step 2: Parse sections
    const sections = parseGeneratedCode(generatedCode);
    
    // Step 3: Merge with skeleton
    const finalCode = mergeCodeWithSkeleton(sections);
    
    // Step 4: Validate code
    const validation = validateCode(finalCode);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Generated code validation failed',
        details: validation.errors
      });
    }
    
    // Step 5: Extract libraries
    const libraries = extractLibraries(finalCode);
    console.log('Detected libraries:', libraries);
    
    // Step 6: Create project structure
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(srcPath, { recursive: true });

    // Step 7: Write platformio.ini with libraries
    const platformIOConfig = createPlatformIOConfig(board, libraries);
    await fs.writeFile(path.join(projectPath, 'platformio.ini'), platformIOConfig);

    // Step 8: Write the merged code
    await fs.writeFile(path.join(srcPath, 'main.cpp'), finalCode);

    // Step 9: Compile
    console.log('🔨 Compiling code...');
    const mergedBinPath = await compilePlatformIO(projectPath, board);

    // Step 10: Copy to output
    const outputFilename = `iot_device_${timestamp}.bin`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    await fs.copyFile(mergedBinPath, outputPath);

    const stats = await fs.stat(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ Compilation successful: ${outputFilename} (${fileSizeKB} KB)`);

    res.json({
      success: true,
      message: 'AI-generated code compiled successfully',
      binFile: outputFilename,
      boardName: BOARDS[board].name,
      fileSize: `${fileSizeKB} KB`,
      libraries: libraries,
      generatedCode: finalCode
    });

    // Cleanup
    setTimeout(async () => {
      try {
        await fs.rm(projectPath, { recursive: true, force: true });
        console.log(`Cleaned up: ${projectName}`);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }, 5000);

  } catch (error) {
    console.error('AI Compilation error:', error);
    
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.status(500).json({
      error: 'AI compilation failed',
      details: error.message,
      stderr: error.stderr || ''
    });
  }
});

// Original compile endpoint (still available)
app.post('/compile', async (req, res) => {
  const { code, filename, board = 'esp32dev' } = req.body;

  if (!code || !filename) {
    return res.status(400).json({ error: 'Code and filename are required' });
  }

  if (!BOARDS[board]) {
    return res.status(400).json({ error: 'Invalid board selected' });
  }

  const timestamp = Date.now();
  const projectName = `${filename}_${timestamp}`;
  const projectPath = path.join(TEMP_DIR, projectName);
  const srcPath = path.join(projectPath, 'src');

  try {
    console.log(`Compiling ${filename} for board ${board}...`);

    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(srcPath, { recursive: true });

    const platformIOConfig = createPlatformIOConfig(board, []);
    await fs.writeFile(path.join(projectPath, 'platformio.ini'), platformIOConfig);
    await fs.writeFile(path.join(srcPath, 'main.cpp'), code);

    const mergedBinPath = await compilePlatformIO(projectPath, board);

    const outputFilename = `${filename}_merged.bin`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    await fs.copyFile(mergedBinPath, outputPath);

    const stats = await fs.stat(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ Compilation successful: ${outputFilename} (${fileSizeKB} KB)`);

    res.json({
      success: true,
      message: 'Compilation successful',
      binFile: outputFilename,
      boardName: BOARDS[board].name,
      fileSize: `${fileSizeKB} KB`
    });

    setTimeout(async () => {
      try {
        await fs.rm(projectPath, { recursive: true, force: true });
        console.log(`Cleaned up: ${projectName}`);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }, 5000);

  } catch (error) {
    console.error('Compilation error:', error);
    
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.status(500).json({
      error: 'Compilation failed',
      details: error.message,
      stderr: error.stderr || ''
    });
  }
});

// Download endpoint
app.get('/download/:filename', async (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(OUTPUT_DIR, filename);

  try {
    await fs.access(filepath);
    res.download(filepath);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get available boards
app.get('/boards', (req, res) => {
  res.json({
    boards: Object.keys(BOARDS).map(key => ({
      id: BOARDS[key].id,
      name: BOARDS[key].name
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    boards: Object.keys(BOARDS).map(key => BOARDS[key].name),
    aiEnabled: GEMINI_API_KEY !== 'AIzaSyB3KsN4N3ircjXQt5AY1v-piTHFoKPQEVg'
  });
});

// Start server
app.listen(PORT, async () => {
  await initDirectories();
  console.log(`\n🚀 ESP32 AI Compiler Backend running on http://localhost:${PORT}`);
  console.log('📋 Available boards:', Object.values(BOARDS).map(b => b.name).join(', '));
  console.log('\n⚠️  Requirements:');
  console.log('   - PlatformIO: pip install platformio');
  console.log('   - Gemini SDK: npm install @google/generative-ai');
  console.log(`   - AI Status: ${GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? '✅ Enabled' : '❌ API Key Required'}\n`);
});