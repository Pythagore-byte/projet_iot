#ifndef SOIL_MOISTURE_SENSOR_H
#define SOIL_MOISTURE_SENSOR_H

#include <Arduino.h>

class SoilMoistureSensor {
public:
    SoilMoistureSensor(uint8_t pin, int minValue, int maxValue);
    void init();
    int getRawValue();
    int getHumidityLevel();

private:
    uint8_t _pin;
    int _minValue;
    int _maxValue;
};

#endif
