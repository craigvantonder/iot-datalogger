#ifndef _NETWORK_H
#define _NETWORK_H

#include <HTTPClient.h>

class Network {

  public:
    Network (const char* ssid, const char* password, const char* endpoint);
    void init();
    void sendDeviceTelemetry(String data);
    void getDeviceConfig(String data);
    String getMacAddress(void);
    String _localIp = "";
    int _httpResponseCode;
    String _httpResponse = "";


  protected:
    const char* _ssid;
    const char* _password;
    const char* _endpoint;
};

#endif // _NETWORK_H