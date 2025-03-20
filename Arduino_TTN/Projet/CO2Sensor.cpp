#include "CO2Sensor.hpp"

CO2Sensor::CO2Sensor(uint8_t i2cAddress) {
    _address = i2cAddress;
}

void CO2Sensor::init() {
    Serial.println("🔄 Réinitialisation du bus I2C...");
    Wire.end();  // Arrêter le bus I2C
    delay(100);
    Wire.begin();  // Redémarrer le bus I2C
    delay(100);

    Serial.println("🔄 Initialisation du capteur CO2...");
    _sensor.begin(Wire, _address);
    _sensor.softReset();
    delay(2000);  // Laisse le temps au capteur de redémarrer

    int16_t error = _sensor.readFirmwareVersion(_major, _minor);
    if (error != NO_ERROR) {
        Serial.println("❌ Erreur de lecture de la version du firmware du SCD30");
    } else {
        Serial.print("✅ SCD30 Firmware Version: ");
        Serial.print(_major);
        Serial.print(".");
        Serial.println(_minor);
    }

    _sensor.startPeriodicMeasurement(0);
    _sensor.setMeasurementInterval(2);
    Serial.println("📊 SCD30 prêt, en attente des premières mesures...");
}

void CO2Sensor::restartSensor() {
    Serial.println("🔄 Redémarrage manuel du SCD30...");
    Wire.end();  // Arrêter complètement l'I2C
    delay(100);
    Wire.begin();  // Redémarrer l'I2C
    delay(100);
    _sensor.begin(Wire, _address);
    delay(2000);
}

float CO2Sensor::getCO2() {
    uint16_t isReady = 0;
    int16_t error = _sensor.getDataReady(isReady);

    if (isReady) {
        float co2 = 0.0, temperature = 0.0, humidity = 0.0;
        delay(1500);
        error = _sensor.blockingReadMeasurementData(co2, temperature, humidity);

        if (error != NO_ERROR) {
            Serial.println("❌ Erreur lors de la lecture des données du SCD30");
            return -1;  // Valeur d'erreur
        }

        return co2;
    } else {
        Serial.println("⏳ Pas encore de données prêtes, attente...");
        return -1;  // Valeur d'erreur
    }
}
