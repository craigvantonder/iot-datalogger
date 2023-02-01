#include "Sleep.h"

Sleep::Sleep (const uint8_t wakeUpPin) : _wakeUpPin(wakeUpPin) {}

void Sleep::deep_sleep_start(const int64_t wakeUpMilliseconds) {
  Sleep::set_timer_interupt(wakeUpMilliseconds);
  Sleep::set_gpio_interupt();
  esp_deep_sleep_start();
}

void Sleep::set_timer_interupt(const int64_t wakeUpMilliseconds) {
  esp_sleep_enable_timer_wakeup(wakeUpMilliseconds * 1000);
}

// https://github.com/espressif/arduino-esp32/issues/6656#issuecomment-1183197703
// Call to enter deep sleep mode with GPIO wakeup
void Sleep::set_gpio_interupt(void) {
  // GPIO pin must be set as input
  gpio_set_direction(gpio_num_t(_wakeUpPin), GPIO_MODE_INPUT);

  // hold disable, isolate and power domain config functions may be unnecessary
  gpio_deep_sleep_hold_dis();
  esp_sleep_config_gpio_isolate();
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_ON);

  // Configure wakeup on high
  esp_deep_sleep_enable_gpio_wakeup(BIT(_wakeUpPin), ESP_GPIO_WAKEUP_GPIO_HIGH);

  // Enter sleep mode
  esp_deep_sleep_start();
}

// Method to print the reason by which ESP32 has been awaken from sleep
String Sleep::get_wakeup_cause() {
  esp_sleep_wakeup_cause_t wakeup_reason;

  wakeup_reason = esp_sleep_get_wakeup_cause();

  String output = "";

  switch(wakeup_reason)
  {
    case ESP_OK : output = "Wakeup success"; break;
    case ESP_ERR_INVALID_STATE : output = "Trigger was not active"; break;
    default : output = "Wakeup was not caused by deep sleep: " + (int)wakeup_reason; break;
  }

  return output;
}