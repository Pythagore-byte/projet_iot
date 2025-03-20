#ifndef CO2_SENSOR_H
#define CO2_SENSOR_H

#include <Arduino.h>
#include <Wire.h>
#include <SensirionI2cScd30.h>

class CO2Sensor {
public:
    CO2Sensor(uint8_t i2cAddress = SCD30_I2C_ADDR_61);
    void init();
    float getCO2();
    void restartSensor();  // Ajout de la fonction de redémarrage manuel

private:
    SensirionI2cScd30 _sensor;
    uint8_t _address;
    uint8_t _major;
    uint8_t _minor;
    static const int INIT_DELAY_MS = 2000;
};

#endif
