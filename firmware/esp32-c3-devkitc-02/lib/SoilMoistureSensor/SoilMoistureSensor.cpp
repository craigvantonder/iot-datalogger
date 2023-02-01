#include "SoilMoistureSensor.h"

SoilMoistureSensor::SoilMoistureSensor (const adc1_channel_t adcChannelT, const uint16_t airValue, const uint16_t waterValue) : _adcChannelT(adcChannelT), _airValue(airValue), _waterValue(waterValue) {}

void SoilMoistureSensor::init(void) {
  // TODO: Convert analog pint to channel / gpio?

  //set the resolution to 12 bits (0-4096)
  esp_adc_cal_characterize(ADC_UNIT_1, ADC_ATTEN_DB_11, ADC_WIDTH_BIT_12, 1100, &adc1_chars);
  adc1_config_width(ADC_WIDTH_BIT_12);
  adc1_config_channel_atten(_adcChannelT, ADC_ATTEN_DB_11);
}

uint8_t SoilMoistureSensor::get_reading(void) {
  // Read the sensor
  _soilMoistureAnalog = adc1_get_raw(_adcChannelT);
  // Calibrate the reading
  _soilMoistureVoltage = esp_adc_cal_raw_to_voltage(_soilMoistureAnalog, &adc1_chars);
  // As it's not yet smooth, further calibration to fix min and max values
  if (_soilMoistureVoltage > _airValue) _soilMoistureVoltage = _airValue;
  if (_soilMoistureVoltage < _waterValue) _soilMoistureVoltage = _waterValue;
  // Convert it to a scale of 0-100%
  _soilMoisture = map(_soilMoistureVoltage, _airValue, _waterValue, 0, 100);
  return _soilMoisture;
}