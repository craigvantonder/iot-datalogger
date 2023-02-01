#ifndef _SLEEP_H
#define _SLEEP_H

#include <Arduino.h>
#include <driver/gpio.h>
#include "esp_sleep.h"

class Sleep {

  public:
    Sleep (const uint8_t wakeUpPin);
    void deep_sleep_start(const int64_t wakeUpSeconds);
    void set_timer_interupt(const int64_t wakeUpSeconds);
    void set_gpio_interupt(void);
    String get_wakeup_cause(void);

  protected:
    const uint8_t _wakeUpPin;
};

#endif // _SLEEP_H