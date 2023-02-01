#ifndef _CONFIG_H
#define _CONFIG_H

// WiFi access details
#define WIFI_SSID "YOUR SSID"
#define WIFI_PASSWORD "YOUR WIFI PASSWORD"

// HTTP endpoint that receives the hardware communication
// The network adapater IP of your local development machine
#define HTTP_ENDPOINT "http://192.168.1.2:8081/api"

// Configuration for NTP syncronisation
#define NTP_SERVER_1 "pool.ntp.org";
#define NTP_SERVER_2 "time.nist.gov";

// Button configuration
#define PIN_BUTTON D3

// LED configuration
#define PIN_LED_RED D6
#define PIN_LED_GREEN D4
#define PIN_LED_BLUE D2

// DHT configuration
#define DHT_SENSOR_PIN D5
#define DHT_SENSOR_TYPE DHT11

// Soil moisutre configuration
#define SM_SENSOR_ADC_CHANNEL ADC1_CHANNEL_6 // A2 / GPIO34
#define SM_AIR_VALUE 2680 //voltage
#define SM_WATER_VALUE 1480

// Enable logging for development
#define Sbegin(a) (Serial.begin(a))
#define Sprint(a) (Serial.print(a))
#define Sprintln(a) (Serial.println(a))
#define Sflush() (Serial.flush())
// Or disable logging to reduce ram usage
// #define Sbegin(a)
// #define Sprint(a)
// #define Sprintln(a)
// #define Sflush()

#endif // _CONFIG_H