Configuration
-------------

Amend the following before uploading the firmware to your device:

- Wifi SSID and password: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/dfrobot-firebeetle-v4/lib/Config/Config.h#L4-L6

- IP address of the machine that is running the server software: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/dfrobot-firebeetle-v4/lib/Config/Config.h#L8-L10

Soil Moisture Sensor Calibration
--------------------------------

The analog sensor requires calibration which can be achieved by providing the absolute wet and dry values, to calibrate the sensor:

- Ensure that the soil moisture sensor is completely dry
- Power the device and view the output of "Serial Monitor" in PlatformIO, note the voltage value that is displayed, this is your `AIR_VALUE`.
- Put the sensor in a glass that is 1/3 filled with water, note the voltage value is displayed, this is your `WATER_VALUE`.

Adjust the firmware configuration values as required: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/dfrobot-firebeetle-v4/lib/Config/Config.h#L28-L31

Gotchas
-------

You may or may not need the latest driver installed for the CH340G USB to serial module within the development board, see here: https://www.wch.cn/download/CH341SER_ZIP.html

Breadboard Wiring
-----------------

![Breadboard Wiring Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/dfrobot-firebeetle-v4/documentation/images/Breadboard_Wiring.png)

DFRobot Firebeetle v4.0
-----------------------

- Product Page: https://www.dfrobot.com/product-1590.html
- Datasheet: https://raw.githubusercontent.com/DFRobot/Wiki/master/DFR0478/%5BDFR0478%5DFireBeetle%20Board-ESP32(V4.0)%E7%94%9F%E4%BA%A7%E6%A3%80%E6%9F%A5%E5%9B%BE.PDF
- Documentation: https://wiki.dfrobot.com/FireBeetle_ESP32_IOT_Microcontroller(V3.0)__Supports_Wi-Fi_&_Bluetooth__SKU__DFR0478
- PlatformIO Board Support: https://docs.platformio.org/en/latest/boards/espressif32/firebeetle32.html

![DFRobot Firebeetle v4.0 Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/dfrobot-firebeetle-v4/documentation/images/dfrobot-firebeetle-v4.jpg)

Waveshare DHT11 Module
----------------------

- Product page: https://www.waveshare.com/Temperature-Humidity-Sensor.htm
- Datasheet: https://www.waveshare.com/w/upload/c/c7/DHT11_datasheet.pdf
- Documentation: https://www.waveshare.com/wiki/DHT11_Temperature-Humidity_Sensor

![Waveshare DHT11 Module Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/dfrobot-firebeetle-v4/documentation/images/waveshare-dht11-module.jpg)

DFRobot Capacitive Soil Moisture Sensor v1.0
--------------------------------------------

- Product page: https://www.dfrobot.com/product-1385.html
- Datasheet: https://dfimg.dfrobot.com/nobody/wiki/25ce0211fa0bf9fb5653d67dafcf2aba.pdf
- Documentation: https://wiki.dfrobot.com/Capacitive_Soil_Moisture_Sensor_SKU_SEN0193

![DFRobot Capacitive Soil Moisture Sensor Image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/dfrobot-firebeetle-v4/documentation/images/DFRobot_Capacitve_Soil_Moisture_v1.jpg)