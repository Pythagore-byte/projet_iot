#include "BatterySensor.hpp"

const int BatterySensor::TABLE_SIZE = 11;
const float BatterySensor::voltageTable[] = {4.20, 4.10, 4.00, 3.90, 3.85, 3.80, 3.75, 3.70, 3.60, 3.50, 3.30};
const float BatterySensor::percentTable[] = {100,  90,   80,   70,   60,   50,   40,   30,   20,   10,   0};

BatterySensor::BatterySensor(uint8_t pin, float vRef, float ratioDiv)
    : _pin(pin), _vRef(vRef), _ratioDiv(ratioDiv) {}

void BatterySensor::init() {
    analogReadResolution(12);
}

float BatterySensor::getBatteryVoltage() {
    int analogValue = analogRead(_pin);
    float voltageMeasured = (analogValue / 4095.0) * _vRef;
    return voltageMeasured * _ratioDiv;
}

float BatterySensor::getBatteryPercentage() {
    float voltage = getBatteryVoltage();
    return voltageToPercentInterpolated(voltage);
}

float BatterySensor::voltageToPercentInterpolated(float voltage) {
    if (voltage >= voltageTable[0]) return 100.0;
    if (voltage <= voltageTable[TABLE_SIZE - 1]) return 0.0;

    for (int i = 0; i < TABLE_SIZE - 1; i++) {
        if (voltage <= voltageTable[i] && voltage >= voltageTable[i + 1]) {
            float v1 = voltageTable[i];
            float v2 = voltageTable[i + 1];
            float p1 = percentTable[i];
            float p2 = percentTable[i + 1];

            return p1 + (voltage - v1) * (p2 - p1) / (v2 - v1);
        }
    }
    return 0.0;
}
