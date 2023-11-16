#include "driver/gpio.h"
#include "sdkconfig.h"

#include <stdio.h>

#include "./ingestion-sdk-platform/espressif_esp32/ei_device_espressif_esp32.h"

#include "./ingestion-sdk-platform/espressif_esp32/ei_at_handlers.h"
#include "./edge-impulse-sdk/porting/ei_classifier_porting.h"

#include "ingestion-sdk-platform/sensors/ei_analogsensor.h"

#include <Arduino.h>

EiDeviceInfo *EiDevInfo = dynamic_cast<EiDeviceInfo *>(EiDeviceESP32::get_device());
static ATServer *at;

void ei_main_init(void)
{
    gpio_pad_select_gpio(GPIO_NUM_21);
    gpio_reset_pin(GPIO_NUM_21);

    gpio_pad_select_gpio(GPIO_NUM_22);
    gpio_reset_pin(GPIO_NUM_22);    
    
    gpio_set_direction(GPIO_NUM_21, GPIO_MODE_OUTPUT);
    gpio_set_direction(GPIO_NUM_22, GPIO_MODE_OUTPUT);    

    /* Initialize Edge Impulse sensors and commands */

    EiDeviceESP32* dev = static_cast<EiDeviceESP32*>(EiDeviceESP32::get_device());

    ei_printf(
        "\nHello from Edge Impulse Device SDK.\r\n"
        "Compiled on %s %s\r\n", __DATE__, __TIME__);

    if (ei_analog_sensor_init() == false) {
        ei_printf("ADC sensor initialization failed\r\n");
    }

    at = ei_at_init(dev);
    ei_printf("Type AT+HELP to see a list of commands.\r\n");
    at->print_prompt();

    dev->set_state(eiStateFinished);
}

void ei_main()
{
    /* handle command comming from uart */
    char data = Serial.read();

    while (data != 0xFF) {
        at->handle(data);
        data = Serial.read();
    }
}
