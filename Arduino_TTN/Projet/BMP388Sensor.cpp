#include "BMP388Sensor.hpp"

BMP388Sensor::BMP388Sensor(uint16_t altitude) : sensor(&Wire, sensor.eSDOGND) {
    altitudeBase = altitude;
}

bool BMP388Sensor::begin() {
    int rslt;
    while ((rslt = sensor.begin()) != ERR_OK) {
        if (rslt == ERR_DATA_BUS) {
            Serial.println("Erreur de bus I2C !");
        } else if (rslt == ERR_IC_VERSION) {
            Serial.println("Version du capteur incorrecte !");
        }
        delay(3000);
    }

    Serial.println("Capteur BMP388 initialisé avec succès !");

    while (!sensor.setSamplingMode(sensor.eUltraPrecision)) {
        Serial.println("Échec de la configuration du mode ultra précision, réessai...");
        delay(3000);
    }

    delay(100);
    
    if (sensor.calibratedAbsoluteDifference(altitudeBase)) {
        Serial.println("Calibration de l'altitude réussie !");
    }

    return true;
}

float BMP388Sensor::getPressure() {
    return sensor.readPressPa();
}

float BMP388Sensor::getSamplingPeriod() {
    return sensor.getSamplingPeriodUS();
}

float BMP388Sensor::getSamplingFrequency() {
    return 1000000.0 / sensor.getSamplingPeriodUS();
}
