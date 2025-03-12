#ifndef DHT22SENSOR_H
#define DHT22SENSOR_H

#include <Arduino.h>
#include <DHT.h>

class DHT22Sensor {
public:
    DHT22Sensor(uint8_t pin);
    bool begin();
    float getTemperature();  // Lire la température en °C
    float getHumidity();     // Lire l'humidité en %

private:
    DHT dht;
    uint8_t sensorPin;
};

#endif
