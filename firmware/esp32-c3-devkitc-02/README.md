Configuration
-------------

Amend the following before uploading the firmware to your device:

- Wifi SSID and password: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/esp32-c3-devkitc-02/lib/Config/Config.h#L4-L6

- IP address of the machine that is running the server software: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/esp32-c3-devkitc-02/lib/Config/Config.h#L8-L10

Soil Moisture Sensor Calibration
--------------------------------

The analog sensor requires calibration which can be achieved by providing the absolute wet and dry values, to calibrate the sensor:

- Ensure that the soil moisture sensor is completely dry
- Power the device and view the output of "Serial Monitor" in PlatformIO, note the voltage value that is displayed, this is your `AIR_VALUE`.
- Put the sensor in a glass that is 1/3 filled with water, note the voltage value is displayed, this is your `WATER_VALUE`.

Adjust the firmware configuration values as required: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/esp32-c3-devkitc-02/lib/Config/Config.h#L28

Gotchas
-------

You may or may not need to install the board support for PlatformIO as discussed here: https://github.com/platformio/platform-espressif32/pull/931

To do this, save the following file to the boards directory: https://github.com/platformio/platform-espressif32/blob/fe5c2e8f8a08b6341147675fa12f1a618758b9ba/boards/esp32-c3-devkitc-02.json

In Linux it can be found at:

    /home/<YOUR USERNAME>/.platformio/platforms/espressif32/boards/

In Windows it can be found at:

    C:\Users\<YOUR USERNAME>\.platformio\platforms\espressif32\boards

Breadboard Wiring
-----------------

![Breadboard Wiring Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/esp32-c3-devkitc-02/documentation/images/Breadboard_Wiring.png)

Expressif ESP32-C3-DevKitC-02
-----------------------------

- Product Page: https://www.espressif.com/en/dev-board/esp32-c3-devkitc-02-en
- Datasheet: https://www.espressif.com/sites/default/files/documentation/esp32-c3-wroom-02_datasheet_en.pdf
- Documentation: https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/hw-reference/esp32c3/user-guide-devkitc-02.html

![Expressif ESP32-C3-DevKitC-02 Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/esp32-c3-devkitc-02/documentation/images/expressif-esp32-c3-devkitc-02.png)

Waveshare DHT11 Module
----------------------

- Product page: https://www.waveshare.com/Temperature-Humidity-Sensor.htm
- Datasheet: https://www.waveshare.com/w/upload/c/c7/DHT11_datasheet.pdf
- Documentation: https://www.waveshare.com/wiki/DHT11_Temperature-Humidity_Sensor

![Waveshare DHT11 Module Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/esp32-c3-devkitc-02/documentation/images/waveshare-dht11-module.jpg)

DFRobot Capacitive Soil Moisture Sensor v1.0
--------------------------------------------

- Product page: https://www.dfrobot.com/product-1385.html
- Datasheet: https://dfimg.dfrobot.com/nobody/wiki/25ce0211fa0bf9fb5653d67dafcf2aba.pdf
- Documentation: https://wiki.dfrobot.com/Capacitive_Soil_Moisture_Sensor_SKU_SEN0193

![DFRobot Capacitive Soil Moisture Sensor Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/esp32-c3-devkitc-02/documentation/images/DFRobot_Capacitve_Soil_Moisture_v1.jpg)