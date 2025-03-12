#ifndef BMP388SENSOR_H
#define BMP388SENSOR_H

#include <Arduino.h>
#include <DFRobot_BMP3XX.h>

class BMP388Sensor {
public:
    BMP388Sensor(uint16_t altitude = 540);  // Altitude par défaut : 540m
    bool begin();
    float getPressure();  // Lire la pression en Pa
    float getSamplingPeriod();
    float getSamplingFrequency();

private:
    DFRobot_BMP388_I2C sensor;
    uint16_t altitudeBase;
};

#endif
