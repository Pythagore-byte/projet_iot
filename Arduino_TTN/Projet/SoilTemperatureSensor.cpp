#include "SoilTemperatureSensor.hpp"

SoilTemperatureSensor::SoilTemperatureSensor(uint8_t pin) : _oneWire(pin), _sensors(&_oneWire) {}

void SoilTemperatureSensor::init() {
    _sensors.begin();
}

float SoilTemperatureSensor::getTemperature() {
    _sensors.requestTemperatures();  // Demander la température
    float tempC = _sensors.getTempCByIndex(0);  // Lire la température du premier capteur

    if (tempC != DEVICE_DISCONNECTED_C) {
        return tempC;
    } else {
        Serial.println("❌ Erreur : Impossible de lire la température");
        return -127.0;  // Valeur indiquant une erreur
    }
}
