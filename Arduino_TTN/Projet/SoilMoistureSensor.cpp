#include "SoilMoistureSensor.hpp"

SoilMoistureSensor::SoilMoistureSensor(uint8_t pin, int minValue, int maxValue) {
    _pin = pin;
    _minValue = minValue;
    _maxValue = maxValue;
}

void SoilMoistureSensor::init() {
    pinMode(_pin, INPUT);
}

int SoilMoistureSensor::getRawValue() {
    return analogRead(_pin);
}

int SoilMoistureSensor::getHumidityLevel() {
    int value = getRawValue();
    return map(value, _minValue, _maxValue, 0, 100);
}
