#include "LightSensor.hpp"

LightSensor::LightSensor(uint8_t i2cAddress) {
    _address = i2cAddress;
}

void LightSensor::init() {
    Wire.begin();
}

float LightSensor::getLux() {
    uint8_t buf[2] = {0};
    readReg(0x10, buf, 2);  // Lecture du registre 0x10

    uint16_t data = buf[0] << 8 | buf[1];
    return ((float)data) / 1.2;
}

uint8_t LightSensor::readReg(uint8_t reg, void* pBuf, size_t size) {
    if (pBuf == NULL) {
        Serial.println("pBuf ERROR!! : null pointer");
        return 0;
    }

    uint8_t* _pBuf = (uint8_t*)pBuf;
    Wire.beginTransmission(_address);
    Wire.write(&reg, 1);
    if (Wire.endTransmission() != 0) {
        return 0;
    }

    delay(20);
    Wire.requestFrom(_address, (uint8_t)size);
    for (uint16_t i = 0; i < size; i++) {
        _pBuf[i] = Wire.read();
    }

    return size;
}
