#include "DhtSensor.h"

DhtSensor::DhtSensor (int pin, char type) : dht(pin, type) {}

void DhtSensor::init() {
  dht.begin();
}

float DhtSensor::readHumidity() {
  _currentHumidity = dht.readHumidity();
  return _currentHumidity;
}

float DhtSensor::readTemperature() {
  _currentTemperature = dht.readTemperature();
  return _currentTemperature;
}

float DhtSensor::computeHeatIndex() {
  _currentHeatIndex = dht.computeHeatIndex(_currentTemperature, _currentHumidity, false);
  return _currentHeatIndex;
}