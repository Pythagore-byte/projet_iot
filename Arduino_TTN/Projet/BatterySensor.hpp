#ifndef BATTERY_SENSOR_HPP
#define BATTERY_SENSOR_HPP

#include <Arduino.h>

class BatterySensor {
public:
    BatterySensor(uint8_t pin, float vRef = 3.3, float ratioDiv = 2.0);
    void init();
    float getBatteryVoltage();
    float getBatteryPercentage();

private:
    uint8_t _pin;
    float _vRef;
    float _ratioDiv;

    float voltageToPercentInterpolated(float voltage);

    static const int TABLE_SIZE;
    static const float voltageTable[];
    static const float percentTable[];
};

#endif
