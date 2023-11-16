#include "src/setup.h"
// #include <ArduinoSTL.h>

/* Public functions -------------------------------------------------------- */
void setup() {

    Serial.begin(115200);

    // wait for serial port to connect. Needed for native USB
    while(!Serial);

    // init all sensors and device itself
    ei_main_init();
}

void loop() {
    ei_main();
}