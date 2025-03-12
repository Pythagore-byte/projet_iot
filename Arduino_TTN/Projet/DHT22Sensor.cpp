#include "DHT22Sensor.hpp"

DHT22Sensor::DHT22Sensor(uint8_t pin) : dht(pin, DHT22) {
    sensorPin = pin;
}

bool DHT22Sensor::begin() {
    dht.begin();
    Serial.println("Capteur DHT22 initialisé !");
    return true;
}

float DHT22Sensor::getTemperature() {
    float temp = dht.readTemperature();
    if (isnan(temp)) {
        Serial.println("Erreur de lecture de la température !");
        return -127.0;  // Valeur d'erreur
    }
    return temp;
}

float DHT22Sensor::getHumidity() {
    float hum = dht.readHumidity();
    if (isnan(hum)) {
        Serial.println("Erreur de lecture de l'humidité !");
        return -1.0;  // Valeur d'erreur
    }
    return hum;
}
