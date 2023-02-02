IoT Datalogger
--------------

This repository contains various software implementations of a basic data logging system for [Arduino](https://www.arduino.cc/) and [Espressif](https://www.espressif.com/en/) embedded hardware.

The motivation behind this repository is an exploration into the world of DIY electronics, the end goal being to create a functional prototype on a custom PCB.

The data logging system consists of four key aspects:

- Firmware, this program is flashed onto the micro-controller so as to control its general operation and communicate with the server software.
- Server software, this program exposes various API endpoints which handle hardware registration, configuration and telemetry.
- Websocket relay, this program exposes a websocket server to relay hardware communications to the client software.
- Client software, this program is the source code for a web based interface for hardware reporting and configuration.

The supported hardware development boards are listed below:

- [Espressif ESP32-C3-DevKitC-02 Entry-Level Development Board](https://github.com/craigvantonder/iot-datalogger/tree/main/firmware/esp32-c3-devkitc-02)
- [DFRobot Firebeetle IoT Microcontroller v4.0](https://github.com/craigvantonder/iot-datalogger/tree/main/firmware/dfrobot-firebeetle-v4)

Development Setup
-----------------

[VSCodium](https://vscodium.com/) is a community-driven, freely-licensed binary distribution of Microsoft’s editor VS Code. It was used for programming the hardware and software within this repository. It can be downloaded from the releases page: https://github.com/VSCodium/vscodium/releases/

VSCodium uses [open-vsx](https://open-vsx.org/) as a market place for extensions, it does not include two extensions which are used so you will need to install them manually using the released .vsix files. Once downloaded and within the extensions section of VSCodium, click the ellipsis at the top right of the extensions interface and choose "Install from VSIX".

[PlatformIO](https://platformio.org/) is a professional collaborative platform for embedded development. It could be considered as an alterntive to [Arduino IDE](https://github.com/arduino/arduino-ide) or [Espressif IDF](https://github.com/espressif/esp-idf). It is used for the development of the firmware. You will find the download links under the resources section of the Visual Studio market place: https://marketplace.visualstudio.com/items?itemName=platformio.platformio-ide#id__0

[Microsoft C++ Tools for VSCode](https://github.com/microsoft/vscode-cpptools) adds language support for C/C++ to VSCodium. It is used for the development of the firmware. It can be downloaded from the releases page: https://github.com/microsoft/vscode-cpptools/releases/

[Node.js®](https://nodejs.org/en/) is an open-source, cross-platform JavaScript runtime environment. It is used for the development and operation of the server, client and relay software. It can be downloaded from the download page: https://nodejs.org/en/download/

General Operation
-----------------

NB: It is important to follow the sequence of the following steps so as to avoid unexpected behavior.

Read through the operating instructions for the [websocket relay](https://github.com/craigvantonder/iot-datalogger/tree/main/websocket-relay#operating-instructions).

Read through the operating instructions for the [server software](https://github.com/craigvantonder/iot-datalogger/tree/main/web-server#operating-instructions).

Read through the operating instructions for the [client software](https://github.com/craigvantonder/iot-datalogger/tree/main/web-client#operating-instructions).

At this point the server software is waiting for traffic on port 8081, the traffic is expected to arrive via your local network interface such as an ethernet or wireless network adapter.

See the [Gotchas](https://github.com/craigvantonder/iot-datalogger#gotchas) section below for notes on firewall and router configuration.

Create the breadboard build by following wiring example, see here as a reference:

![Breadboard wiring image](https://github.com/craigvantonder/iot-datalogger/blob/main/firmware/esp32-c3-devkitc-02/documentation/images/Breadboard_Wiring.png)

In VSCodium within the PlatformIO Home extension on the left, under the quick access panel select "Projects & Configuration" then select "Add existing project":

![PlatformIO projects image](https://github.com/craigvantonder/iot-datalogger/blob/main/platformio-projects.png)

Navigate to the [firmware folder](https://github.com/craigvantonder/iot-datalogger/tree/main/firmware) and select your development board as the source of the project in PlatformIO, it may take quite some time to download the required dependencies.

At this stage the project has been added but it may or may not be reflected in the projects window of PlatformIO. This behavior seems to be a bug and can be resolved by navigating away from "Projects & Configuration" to any other navigation option such as "Libraries" and then back to "Projects & Configuration" where you will now see the new project listed. Click on "Open" to add the environment configuration to your workspace. You are now ready to work with the project source files.

You must amend the firmware configuration by adding your access details for the wireless network that the device will be connecting to along with the IP address of your local development machine within this network, see here as a reference: https://github.com/craigvantonder/iot-datalogger/blob/7febe3c778f54a89adc3a5c40063c5d4875a626a/firmware/esp32-c3-devkitc-02/lib/Config/Config.h#L4-L10

You can now flash the firmware to your development board using PlatformIO:

![PlatformIO upload image](https://github.com/craigvantonder/iot-datalogger/blob/main/platformio-upload.png)

At this point the device will attempt to register its configuration and send its first telemetry message.

Viewing the serial monitor output in PlatformIO should result in:

![PlatformIO serial monitor image](https://github.com/craigvantonder/iot-datalogger/blob/main/platformio-serial-monitor.png)

See http://localhost:8082/ for hardware reporting:

![Telemetry page image](https://github.com/craigvantonder/iot-datalogger/blob/main/web-client/example_telemetry.png)

And http://localhost:8082/config for hardware configuration options:

![Config page image](https://github.com/craigvantonder/iot-datalogger/blob/main/web-client/example_config.png)

To obtain accurate readings from the soil moisture sensor, follow the "Soil Moisture Sensor Calibration" section of the appropriate firmware readme file, see here as a reference: https://github.com/craigvantonder/iot-datalogger/tree/main/firmware/esp32-c3-devkitc-02#soil-moisture-sensor-calibration.

Gotchas
-------

- Port 8081 should be allowed for incoming traffic on the local network. Depending on your environment this may require adjustments to your operating system firewall settings or router configuration. The device communicates with the web server using port 8081 so the machine that is hosting the web server needs to have this open for the device communication.
- Some routers require specific configuration for "port forwarding" which would enable this type of communication to take place. Typically you would define port 8081 as being routed through to your local development machines IP address.
- It is common that routers are configured with a whitelisting of hardware mac addresses which are allowed to access a WiFi network. You can obtain the mac address of the hardware via the serial monitor output when the device boots for the first time.

Important Note
--------------

Whilst it is possible to use the application in a production / live environment it is not recommended to do so. The reasoning here is that the repository was created as a basic learning material and as such it does not cover the varying cases involved within providing a secure production solution.

Nice to have
------------

- Improve the println macro in the firmware configuration to accommodate for multiple arguments
- Add firmware support for TCP and TLS server endpoints, create TCP and TLS server examples
- Initialise the pins on boot, deinitialise the pins on sleep
- Utilise the flash memory as storage, send batches of data, retry on failure
- Better error handling, collection of and reporting on errors throughout
- Refactor the general structure of the firmware code, documentation
- Dynamic hardware setups depending on port input configuration, support additional sensors

Thanks
------

[@stevenoliver](https://github.com/stevenoliver) - UI Enhancements, debugging and support for Windows as a development environment.
[@onexios](https://github.com/onexios) - Troubleshooting esp32-c3-devkitc-02 setup and configuration.

License
-------

MIT License Copyright © 2023 Craig van Tonder