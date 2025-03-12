#include "BatterySensor.hpp"

BatterySensor::BatterySensor(uint8_t pin, int minVal, int maxVal) {
    _pin = pin;
    _minVal = minVal;
    _maxVal = maxVal;
}

void BatterySensor::init() {
    pinMode(_pin, INPUT);
}

int BatterySensor::getRawValue() {
    return analogRead(_pin);
}

int BatterySensor::getBatteryLevel() {
    int value = getRawValue();
    return map(value, _minVal, _maxVal, 0, 100);
}
