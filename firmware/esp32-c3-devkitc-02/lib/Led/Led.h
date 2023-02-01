#ifndef _LED_H
#define _LED_H

#include <Arduino.h>

class Led {

  public:
    Led (int ledPin);
    void initPin();
    void on();
    void off();
    bool isOn();
    bool isOff();
    void startFlashing();
    void stopFlashing();
    bool isFlashing();
    void quickFlash();

  protected:
    int _ledPin;
    bool _on = false;
    bool _flashing = false;
};

#endif // _LED_H
