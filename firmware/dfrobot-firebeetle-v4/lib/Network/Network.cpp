#include "Network.h"

Network::Network(const char* ssid, const char* password, const char* endpoint) : _ssid(ssid), _password(password), _endpoint(endpoint) {}

void Network::init() {
  WiFi.begin(_ssid, _password);
  // TODO: timeout after some period of time trying to connect?
  while(WiFi.status() != WL_CONNECTED) {
    // TODO: flash / tick the red led to indicate that a connection is waiting
    // This can help to diagnose in the case where the device cannot make a connection
    // as it is blocked by router configuration / os firewall
    delay(500);
  }
  _localIp = WiFi.localIP().toString();
}

void Network::sendDeviceTelemetry(String data) {
  // Check WiFi connection status
  if(WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    // Your Domain name with URL path or IP address with path
    http.begin(client, String(_endpoint) + "/telemetry");
    // If you need Node-RED/server authentication, insert user and password below
    //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

    // Specify content-type header
    //http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    // Data to send with HTTP POST
    //String httpRequestData = "api_key=tPmAT5Ab3j7F9&sensor=BME280&value1=24.25&value2=49.54&value3=1005.14";
    // Send HTTP POST request
    //_httpResponseCode = http.POST(httpRequestData);

    // Set the response code initially
    _httpResponseCode = 0;
    // If you need an HTTP request with a content type: application/json, use the following:
    http.addHeader("Accept", "application/json");
    http.addHeader("Content-Type", "application/json");
    _httpResponseCode = http.PUT(data);
    if (_httpResponseCode > 0) {
      _httpResponse = http.getString();
    }

    // If you need an HTTP request with a content type: text/plain
    //http.addHeader("Content-Type", "text/plain");
    //_httpResponseCode = http.POST("Hello, World!");

    // Sprint(F("HTTP Response code: "));
    // Sprintln(_httpResponseCode);

    // if (_httpResponseCode > 0) {
    //   //Get the response to the request
    //   Sprintln(F("Got response: "));
    //   Sprintln(_httpResponseCode);   //Print return code
    //   Sprintln(_httpResponse);           //Print request answer
    // } else {
    //   Sprint(F("Error on sending POST: "));
    //   Sprintln(_httpResponseCode);
    // }

    // Free resources
    http.end();

    // Disconnect WiFi as it's no longer needed
    // WiFi.disconnect(true);
    // WiFi.mode(WIFI_OFF);
  }
  // Wifi is not connected
  else {
    _httpResponseCode = -1;
  }
}

void Network::getDeviceConfig(String data) {
  // Check WiFi connection status
  if(WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    // Your Domain name with URL path or IP address with path
    http.begin(client, String(_endpoint) + "/device/registration");

    // If you need Node-RED/server authentication, insert user and password below
    //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

    // Specify content-type header
    //http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    // Data to send with HTTP POST
    //String httpRequestData = "api_key=tPmAT5Ab3j7F9&sensor=BME280&value1=24.25&value2=49.54&value3=1005.14";
    // Send HTTP POST request
    //_httpResponseCode = http.POST(httpRequestData);

    // Set the response code initially
    _httpResponseCode = 0;
    // If you need an HTTP request with a content type: application/json, use the following:
    http.addHeader("Accept", "application/json");
    http.addHeader("Content-Type", "application/json");
    _httpResponseCode = http.POST(data);
    if (_httpResponseCode > 0) {
      _httpResponse = http.getString();
    }

    // If you need an HTTP request with a content type: text/plain
    //http.addHeader("Content-Type", "text/plain");
    //_httpResponseCode = http.POST("Hello, World!");

    // Sprint(F("HTTP Response code: "));
    // Sprintln(_httpResponseCode);

    // if (_httpResponseCode > 0) {
    //   //Get the response to the request
    //   Sprintln(F("Got response: "));
    //   Sprintln(_httpResponseCode);   //Print return code
    //   Sprintln(_httpResponse);           //Print request answer
    // } else {
    //   Sprint(F("Error on sending POST: "));
    //   Sprintln(_httpResponseCode);
    // }

    // Free resources
    http.end();

    // Disconnect WiFi as it's no longer needed
    // WiFi.disconnect(true);
    // WiFi.mode(WIFI_OFF);
  }
  // Wifi is not connected
  else {
    _httpResponseCode = -1;
  }
}

// https://forum.arduino.cc/t/convert-mac-address-to-string/644713/2
String mac2String(byte ar[]) {
  String s;
  for (byte i = 0; i < 6; ++i)
  {
    char buf[3];
    sprintf(buf, "%02X", ar[i]); // J-M-L: slight modification, added the 0 in the format for padding
    s += buf;
    if (i < 5) s += ':';
  }
  return s;
}
// https://github.com/espressif/arduino-esp32/issues/3859
String Network::getMacAddress() {
  uint64_t espChipID = ESP.getEfuseMac();
  String macAddress = mac2String((byte*) &espChipID);
  return macAddress;
}
