#ifndef LIGHT_SENSOR_H
#define LIGHT_SENSOR_H

#include <Arduino.h>
#include <Wire.h>

class LightSensor {
public:
    LightSensor(uint8_t i2cAddress);
    void init();
    float getLux();

private:
    uint8_t _address;
    uint8_t readReg(uint8_t reg, void* pBuf, size_t size);
};

#endif
