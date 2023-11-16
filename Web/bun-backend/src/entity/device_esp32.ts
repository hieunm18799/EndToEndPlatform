// https://github.com/espressif/arduino-esp32/blob/master/boards.txt

import { Device } from "./interface/device";

export enum ESP32_BOARD_NAME {
    ESP32_CAM = 'AI Thinker ESP32-CAM',
    ESP_EYE = 'ESP32 Wrover Module',
}

enum CPUFreq {
    '240MHz (WiFi/BT)' = 'CPUFreq=240', 
    '160MHz (WiFi/BT)' = 'CPUFreq=160',            
    '80MHz (WiFi/BT)' = 'CPUFreq=80',
    '40MHz (40MHz XTAL)' = 'CPUFreq=40',
    '26MHz (26MHz XTAL)' = 'CPUFreq=26',
    '20MHz (40MHz XTAL)' = 'CPUFreq=20', 
    '13MHz (26MHz XTAL)' = 'CPUFreq=13',  
    '10MHz (40MHz XTAL)' = 'CPUFreq=10',
}

enum FlashFreq {
    '80MHz' = 'FlashFreq=80',
    '40MHz' = 'FlashFreq=40',
}   

enum FlashMode {
    'QIO' = 'FlashMode=qio',
    'DIO' = 'FlashMode=dio', 
    'QOUT' = 'FlashMode=qout',
    'DOUT' = 'FlashMode=dout',
}

enum PartitionScheme {
    'Huge APP (3MB No OTA/1MB SPIFFS)' = 'PartitionScheme=huge_app',
    'Minimal SPIFFS (1.9MB APP with OTA/190KB SPIFFS)' = 'PartitionScheme=min_spiffs',
    'Regular 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)' = 'PartitionScheme=default',
    'Regular 4MB with ffat (1.2MB APP/1.5MB FATFS)' = 'PartitionScheme=defaultffat',
    'Minimal (1.3MB APP/700KB SPIFFS)' = 'PartitionScheme=minimal',
    'No OTA (2MB APP/2MB SPIFFS)' = 'PartitionScheme=no_ota',
    'No OTA (1MB APP/3MB SPIFFS)' = 'PartitionScheme=noota_3g',
    'No OTA (2MB APP/2MB FATFS)' = 'PartitionScheme=noota_ffat',
    'No OTA (1MB APP/3MB FATFS)' = 'PartitionScheme=noota_3gffat',
}

enum DebugLevel {
    'None' = 'DebugLevel=none',
    'Error' = 'DebugLevel=error',
    'Warn' = 'DebugLevel=warn',
    'Info' = 'DebugLevel=info',
    'Debug' = 'DebugLevel=debug',
    'Verbose' = 'DebugLevel=verbose'
}
enum EraseFlash {
    'Disabled' = 'EraseFlash=none',
    'Enabled' = 'EraseFlash=all',
}  

export class Device_ESP32 implements Device {
    name: string;
    platformUrl: string;
    config: {
        cpuFreq: CPUFreq,
        flashFreq: FlashFreq,
        flashMode: FlashMode,
        parti: PartitionScheme,
        debugLevel: DebugLevel,
        eraseFlash: EraseFlash,
    };    

    constructor({name, config = {cpuFreq: CPUFreq['240MHz (WiFi/BT)'], flashFreq: FlashFreq['80MHz'], flashMode: FlashMode['QIO'], parti: PartitionScheme['Huge APP (3MB No OTA/1MB SPIFFS)'], debugLevel: DebugLevel['None'],  eraseFlash: EraseFlash['Disabled']}}
    : {name: ESP32_BOARD_NAME, config?: {
        cpuFreq: CPUFreq,
        flashFreq: FlashFreq,
        flashMode: FlashMode,
        parti: PartitionScheme,
        debugLevel: DebugLevel,
        eraseFlash: EraseFlash,} }){
        this.name = name;
        this.platformUrl = 'https://espressif.github.io/arduino-esp32/package_esp32_index.json';
        this.config = config;

    }
}
