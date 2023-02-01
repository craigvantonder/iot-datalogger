#ifndef _SOIL_H
#define _SOIL_H

#include <Arduino.h>
#include <driver/adc.h>
#include "esp_adc_cal.h"

class SoilMoistureSensor {

  public:
    SoilMoistureSensor (const adc1_channel_t adcChannelT, const uint16_t airValue, const uint16_t waterValue);
    void init(void);
    uint8_t get_reading(void);
    uint16_t _soilMoistureAnalog;
    uint16_t _soilMoistureVoltage;
    uint8_t _soilMoisture;

  protected:
    const adc1_channel_t _adcChannelT;
    const uint16_t _airValue;
    const uint16_t _waterValue;
    esp_adc_cal_characteristics_t adc1_chars;
};

#endif // _SOIL_H