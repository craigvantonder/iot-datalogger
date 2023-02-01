#ifndef _DHT_H
#define _DHT_H

#include <DHT.h>

class DhtSensor {

  public:
    DhtSensor (int pin, char type);
    void init();
    float readHumidity();
    float readTemperature();
    float computeHeatIndex();

  protected:
    DHT dht;
    float _currentHumidity;
    float _currentTemperature;
    float _currentHeatIndex;
};

#endif // _DHT_H
