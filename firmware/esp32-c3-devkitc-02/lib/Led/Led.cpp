#include "Led.h"

Led::Led (int ledPin) : _ledPin(ledPin) {
  this->Led::initPin();
  this->Led::off();
}

void Led::initPin() {
  //pinMode(_ledPin, OUTPUT);
  gpio_set_direction(gpio_num_t(_ledPin), GPIO_MODE_OUTPUT);
}

void Led::on() {
  digitalWrite(_ledPin, HIGH);
  _on = true;
}

void Led::off() {
  digitalWrite(_ledPin, LOW);
  _on = false;
}

bool Led::isOn() {
  return _on;
}

bool Led::isOff() {
  return !_on;
}

void Led::startFlashing() {
  _flashing = true;
}

void Led::stopFlashing() {
  _flashing = false;
  this->Led::off();
}

bool Led::isFlashing() {
  return _flashing;
}

void Led::quickFlash() {
  for (int i = 0; i < 10; i++) {
    if (this->Led::isOn()) {
      this->Led::off();
    } else {
      this->Led::on();
    }
    delay(100);
  }
}