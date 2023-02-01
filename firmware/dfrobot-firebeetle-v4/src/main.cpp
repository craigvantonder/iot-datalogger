#include <ArduinoJson.h>
#include "sntp.h"
#include "time.h"
#include <Config.h>
#include <Sleep.h>
#include <Network.h>
#include <Led.h>
#include <DhtSensor.h>
#include <SoilMoistureSensor.h>

RTC_DATA_ATTR volatile uint32_t chipId = 0;

// NTP
const char* ntpServer1 = NTP_SERVER_1;
const char* ntpServer2 = NTP_SERVER_2;
const long  gmtOffset_sec = 0;
const int   daylightOffset_sec = 0;

// Sleep
Sleep slp(PIN_BUTTON);
RTC_DATA_ATTR char readingInterval[4] = { 's', 'e', 'c', '\0' };
RTC_DATA_ATTR volatile bool userLed = false;
RTC_DATA_ATTR static int boot_count = 0;
RTC_DATA_ATTR static int64_t sleepTimeMs = 0;
int64_t timeToSleep;

// Wifi
Network net(WIFI_SSID, WIFI_PASSWORD, HTTP_ENDPOINT);
bool responseSuccess;
bool responseFailed;

// LED
Led redLed(PIN_LED_RED);
Led greenLed(PIN_LED_GREEN);
Led blueLed(PIN_LED_BLUE);

// DHT11
DhtSensor dht(DHT_SENSOR_PIN, DHT_SENSOR_TYPE);
volatile float temperature;
volatile float humidity;
volatile float heatIndex;

// Soil Moisture
SoilMoistureSensor soil(SM_SENSOR_ADC_CHANNEL, SM_AIR_VALUE, SM_WATER_VALUE);
volatile uint8_t soilMoisture;

void printHeapSpace(String msg) {
  Sprint(msg);
  Sprint(F(": "));
  Sprint(ESP.getFreeHeap());
  Sprintln(F(" bytes"));
  Sflush();
}

// Helper function to get the current epoch time
// in milliseconds: https://esp32.com/posting.php?mode=quote&f=13&p=22936
// https://docs.espressif.com/procts/esp-idf/en/latest/esp32/api-reference/system/system_time.html#get-current-time
int64_t getTime() {
	struct timeval tv;
  if (gettimeofday(&tv, NULL) != 0) {
    Sprintln(F("Failed to obtain time"));
    return 0;
  }
  return (tv.tv_sec * 1000LL + (tv.tv_usec / 1000LL));
}

// Decode the interval from string format representation
// to milliseconds, this is the user selection from the client UI
// e.g. sec (manual input), 5 (seconds)
int64_t decodeInterval(String interval, int16_t manualIntervalSeconds)
{
  int64_t coefficientMs;
  if (interval == "sec") {
    coefficientMs = manualIntervalSeconds * 1000;
  } else if (interval == "5m") {
    coefficientMs = 1000 * 60 * 5;
  } else if (interval == "15m") {
    coefficientMs = 1000 * 60 * 15;
  } else if (interval == "30m") {
    coefficientMs = 1000 * 60 * 30;
  } else if (interval == "1h") {
    coefficientMs = 1000 * 60 * 60;
  } else if (interval == "1d") {
    coefficientMs = 1000 * 60 * 60 * 24;
  } else {
    coefficientMs = 1;
  }
  return coefficientMs;
}

// Calculate the millisecond difference in time
// between a timestamp and a following interval period
// e.g. 1672123935921 (now), 30000 (5 minutes in milliseconds)
int64_t calcWaitTime(int64_t timeMs, int64_t coefficientMs)
{
  int64_t remainder = timeMs % coefficientMs;
  int64_t waitTimeMs = coefficientMs - remainder;
  return waitTimeMs;
}

void printLocalTime()
{
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Sprintln(F("No time available (yet)"));
    return;
  }
  // TODO: Improve the println macro to accommodate for multiple arguments?
  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
}

// Callback function (get's called when time adjusts via NTP)
void timeavailable(struct timeval *t)
{
  Sprintln(F("Got time adjustment from NTP!"));
  printLocalTime();
}

// Start SNTP
static void initialize_sntp(void)
{
  //sntp_set_sync_mode(SNTP_SYNC_MODE_IMMED);
  sntp_setoperatingmode(SNTP_OPMODE_POLL);
  // Enable NTP over DHCP
  //sntp_servermode_dhcp(1);
  sntp_setservername(0, ntpServer1);
  sntp_setservername(1, ntpServer2);
  sntp_set_time_sync_notification_cb(timeavailable);
  sntp_set_sync_mode(SNTP_SYNC_MODE_IMMED);
  sntp_init();
}

// Get the system time from SNTP
static void obtain_time(void)
{
  sntp_servermode_dhcp(1);      // accept NTP offers from DHCP server, if any

  initialize_sntp();

  // wait for time to be set
  time_t now = 0;
  struct tm timeinfo = { 0 };
  int retry = 0;
  const int retry_count = 15;
  while (sntp_get_sync_status() == SNTP_SYNC_STATUS_RESET && ++retry < retry_count) {
    Sprint(F("Waiting for system time to be set..."));
    Sprintln(retry);
    delay(1000);
  }
  time(&now);
  localtime_r(&now, &timeinfo);
}

// Handle the webserver request
void sendTelemetry(void) {
  // Read the DHT sensor
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  heatIndex = dht.computeHeatIndex();
  Sprintln(F("Raw dht sensor values:"));
  Sprint(F("Temperature: "));
  Sprintln(temperature);
  Sprint(F("Humidity: "));
  Sprintln(humidity);
  Sprint(F("Heat Index: "));
  Sprintln(heatIndex);
  Sflush();
  // Force minimum delay between sensor reads
  // NB: The sensor can burn out if it is read too in too quick of a succession
  if (sleepTimeMs < 2000) {
    delay(2000);
  }

  // Read the soil moisture sensor
  soilMoisture = soil.get_reading();
  Sprintln(F("Raw soil moisture sensor values:"));
  Sprint(F("Analog: "));
  Sprintln(soil._soilMoistureAnalog);
  Sprint(F("Voltage: "));
  Sprintln(soil._soilMoistureVoltage);
  Sflush();

  // Serialise the JSON request
  StaticJsonDocument<96> doc;
  doc["chipId"] = chipId;
  doc["timestamp"] = getTime();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["heatIndex"] = heatIndex;
  doc["soilMoisture"] = soilMoisture;
  // {
  //   "chipId": 6090984,
  //   "timestamp": 1672769474377,
  //   "temperature": 25,
  //   "humidity": 78,
  //   "heatIndex": 25.59196663,
  //   "soilMoisture": 73
  // }
  String req;
  serializeJson(doc, req);
  Sprint(F("Created the request payload: "));
  Sprintln(req);
  Sflush();

  // Send it to the server
  Sprintln(F("Attempting to send the payload to the web server..."));
  net.sendDeviceTelemetry(req);
}

// Handle the web server response
void processResponse(void) {
  Sprintln(net._httpResponse);
  Sflush();

  // Allocate the JSON document
  StaticJsonDocument<128> doc;

  // Deserialize the JSON document
  DeserializationError error = deserializeJson(doc, net._httpResponse);
  // Display the error if one exists
  if (error) {
    // From book page 71:
    // DeserializationError has a c_str() member function that returns a string
    // representation of the error. It also has an f_str() member that returns a Flash string,
    // saving some space on Harvard architectures like ESP8266
    Sprint(F("deserializeJson() failed with code "));
    Sprintln(error.f_str());
    Sflush();
    return;
  }

  // Update the hardware config
  if (doc["userLed"] != userLed) {
    userLed = doc["userLed"];
    // Enable the green LED
    if (!userLed) {
      blueLed.off();
    } else {
      blueLed.on();
    }
  }

  int manualReadingInterval = doc["manualReadingInterval"];
  // seconds to millisecond
  manualReadingInterval = manualReadingInterval * 1000;
  // set new interval
  if (manualReadingInterval != sleepTimeMs) {
    sleepTimeMs = manualReadingInterval;
  }

  if (strcmp(doc["readingInterval"], readingInterval) != 0) {
    strlcpy(readingInterval, doc["readingInterval"], 4);
  }
}

// ESP8266-Style Chip ID
// https://github.com/espressif/arduino-esp32/issues/3859#issuecomment-689171490
uint32_t getChipID() {
  uint32_t chipId = 0;
  for(int i=0; i<17; i=i+8) {
	  chipId |= ((ESP.getEfuseMac() >> (40 - i)) & 0xff) << i;
	}
  return chipId;
}

// Gets the configuration when the device first starts
void getConfig(void) {
  // Print mac address, it is useful for initial configuration
  // in the case where its needed in the routers whitelist of authorised wireless hardware
  String macAddress = net.getMacAddress();
  Sprint(F("Device MAC Address: "));
  Sprintln(macAddress);

  // Store the chip id initially
  chipId = getChipID();
  // Serialise the JSON request
  StaticJsonDocument<128> doc;
  doc["chipId"] = chipId;
  doc["chipModel"] = ESP.getChipModel();
  doc["chipRevision"] = ESP.getChipRevision();
  doc["chipCores"] = ESP.getChipCores();
  doc["macAddress"] = macAddress;
  // {
  //   "chipId": 6090984,
  //   "chipModel": "ESP32-D0WDQ5",
  //   "chipRevision": 1,
  //   "chipCores": 2,
  //   "macAddress": "4C:75:25:5C:F0:E8"
  // }
  String configRequest;
  serializeJson(doc, configRequest);
  Sprint(F("Created the device configuration request payload: "));
  Sprintln(configRequest);
  Sflush();

  // Send it to the server
  Sprintln(F("Attempting to fetch the device configuration..."));
  net.getDeviceConfig(configRequest);

  // Transmission completed, a response exists
  bool configResponseSuccess = net._httpResponse.length() > 0 && net._httpResponseCode == 200;
  if (configResponseSuccess) {
    Sprintln(F("Received the device configuration:"));
    processResponse();
    greenLed.quickFlash();
  }

  // Communication failed, flash error indicator
  bool configResponseFailed = net._httpResponseCode == -1;
  if (configResponseFailed) {
    Sprintln(F("Failed to fetch the device configuration, restarting the device..."));
    greenLed.off();
    redLed.quickFlash();
    redLed.off();
    delay(3000);
    ESP.restart();
  }
}

void setup() {
  // Initialise the serial connection (for debugging)
  Sbegin(115200);

  // Print the heap space
  ++boot_count;
  Sprint(F("Boot count: "));
  Sprintln(boot_count);
  Sflush();

  printHeapSpace("Woke up, heap space remaining");

  // Print the wakeup reason for ESP32
  if (boot_count > 1) {
    String wakeupReason = slp.get_wakeup_cause();
	  Sprintln(wakeupReason);
  }

  // Indicate that power is on
  redLed.on();
  // Enable the user LED depending on hardware config
  if (userLed) {
    blueLed.on();
  }
  // Connect to the wifi network
  net.init();
  // Initialise the sensors
  dht.init();
  soil.init();

  // Set the system time via NTP
  // https://github.com/espressif/esp-idf/blob/cfef24863f1acd4418227a727dbb6e356438a385/examples/protocols/sntp/main/sntp_example_main.c
  obtain_time();

  // Completed hardware initialisation
  Sprint(F("Initialised the hardware, obtained the network IP: "));
  Sprintln(net._localIp);
  Sflush();

  // Get the device config initially
  printHeapSpace("Might wait, heap space remaining");
  if (boot_count == 1) {
    getConfig();
    printHeapSpace("Got config, heap space remaining");
  }

  // Wait until the exact time of the interval / reading
  if (strcmp(readingInterval, "sec") != 0) {
    Sprintln(F("Entering wait period before reading..."));
    int64_t coefficient = decodeInterval(readingInterval, sleepTimeMs);
    int64_t currentTime = getTime();
    int64_t delayTimeMs = calcWaitTime(currentTime, coefficient);
    delay(delayTimeMs);
  }

  // Indicate that the network connection is active and that data transmission is commencing
  greenLed.on();

  // Print the heap space
  printHeapSpace("Starting logging, heap space remaining");

  // Submit the readings to the web server
  sendTelemetry();

  // Transmission completed, a response exists
  responseSuccess = net._httpResponse.length() > 0 && net._httpResponseCode == 200;
  if (responseSuccess) {
    Sprintln(F("Received the servers response:"));
    processResponse();
    greenLed.quickFlash();
  }

  // Communication failed, flash error indicator
  responseFailed = net._httpResponseCode == -1;
  if (responseFailed) {
    Sprintln(F("Failed to deliver the payload!"));
    greenLed.off();
    redLed.quickFlash();
  }

  // determine the time to wait until the next reading interval
  bool isReadingIntervalSec = strcmp(readingInterval, "sec") == 0;
  if (!isReadingIntervalSec) {
    // TODO: move to function in slp. ?
    // decodeInterval can go inside time to sleep, the logic ofit
    // can getTime logic inside timeTosleep aswell
    int64_t coefficientMs = decodeInterval(readingInterval, sleepTimeMs);
    int64_t timeMs = getTime();
    sleepTimeMs = calcWaitTime(timeMs, coefficientMs);
  }

  // Print the heap space
  printHeapSpace("Going to sleep now, heap space remaining");
  // Set timer and gpio interupts, enter deep sleep mode
  // Delay by a 10 secs, wake up early to give it time to wait for the next reading interval
  Sprint(F("Sleep time: "));
  Sprint(sleepTimeMs);
  Sprintln(F(" milliseconds"));
  if (isReadingIntervalSec) {
    timeToSleep = sleepTimeMs;
  } else {
    if (sleepTimeMs > 10000) timeToSleep = sleepTimeMs - 10000;
    else timeToSleep = 0;
    // could simply just restart?
    //else ESP.restart();
  }
  Sprint(F("Sleeping for: "));
  Sprint(timeToSleep);
  Sprintln(F(" milliseconds"));
  slp.deep_sleep_start(timeToSleep);
}

void loop() {

}