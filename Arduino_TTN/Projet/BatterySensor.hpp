#ifndef BATTERY_SENSOR_H
#define BATTERY_SENSOR_H

#include <Arduino.h>

class BatterySensor {
public:
    BatterySensor(uint8_t pin, int minVal, int maxVal);
    void init();
    int getRawValue();
    int getBatteryLevel(); 

private:
    uint8_t _pin;
    int _minVal;
    int _maxVal;
};

#endif
