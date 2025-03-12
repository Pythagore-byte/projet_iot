#ifndef SOIL_TEMPERATURE_SENSOR_H
#define SOIL_TEMPERATURE_SENSOR_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

class SoilTemperatureSensor {
public:
    SoilTemperatureSensor(uint8_t pin);
    void init();
    float getTemperature();

private:
    OneWire _oneWire;
    DallasTemperature _sensors;
};

#endif
