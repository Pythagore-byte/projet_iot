#include <ArduinoLowPower.h>
#include "BatterySensor.hpp"
#include "SoilMoistureSensor.hpp"
#include "LightSensor.hpp"
#include "CO2Sensor.hpp"
#include "SoilTemperatureSensor.hpp"
#include "BMP388Sensor.hpp"
#include "DHT22Sensor.hpp"  // Ajout du DHT22

// Définition du bouton pour réveil
const int buttonPin = 2;  // Modifier selon la broche utilisée

// Définition du capteur DHT22 (broche 4, à modifier si besoin)
DHT22Sensor dht22(7);  

// Création des objets capteurs
BMP388Sensor bmp388;
SoilTemperatureSensor soilTempSensor(8);
CO2Sensor co2Sensor;
LightSensor lightSensor(0x23);
SoilMoistureSensor sensor1(A0, 800, 380);
SoilMoistureSensor sensor2(A1, 800, 380);
SoilMoistureSensor sensor3(A2, 800, 380);
BatterySensor battery(A3, 525, 750);

// Variable pour détecter un appui sur le bouton
volatile bool buttonPressed = false;

// Fonction d'interruption (réveil par bouton)
void wakeUp() {
    buttonPressed = true;
}

void setup() {
    Serial.begin(9600);

    // Configuration du bouton avec interruption
    pinMode(buttonPin, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(buttonPin), wakeUp, FALLING);

    // Initialisation des capteurs
    soilTempSensor.init();
    battery.init();
    sensor1.init();
    sensor2.init();
    sensor3.init();
    lightSensor.init();
    co2Sensor.init();
    bmp388.begin();
    dht22.begin();  // Initialisation du DHT22

    Serial.println("🌱 Système prêt !");
}

void loop() {
    Serial.println("🔵 Réveil du système, acquisition des données...");

    // Lecture des capteurs
    float pressure = bmp388.getPressure();
    float temperatureSoil = soilTempSensor.getTemperature();
    float temperatureAir = dht22.getTemperature();
    float humidityAir = dht22.getHumidity();
    float co2Value = co2Sensor.getCO2();
    float lux = lightSensor.getLux();
    int humi1 = sensor1.getHumidityLevel();
    int humi2 = sensor2.getHumidityLevel();
    int humi3 = sensor3.getHumidityLevel();
    int batteryLevel = battery.getBatteryLevel();

    // Affichage des données
    Serial.println("----------------------");
    Serial.print("🔵 Pression: "); Serial.print(pressure); Serial.println(" Pa");
    Serial.print("🌡 Température Air: "); Serial.print(temperatureAir); Serial.println(" °C");
    Serial.print("🌡 Température Sol: "); Serial.print(temperatureSoil); Serial.println(" °C");
    Serial.print("💧 Humidité Air: "); Serial.print(humidityAir); Serial.println(" %");
    Serial.print("💨 CO2: "); Serial.print(co2Value); Serial.println(" ppm");
    Serial.print("☀️ LUX: "); Serial.print(lux); Serial.println(" lx");
    Serial.print("💧 Humidité Sol 1: "); Serial.print(humi1); Serial.println("%");
    Serial.print("💧 Humidité Sol 2: "); Serial.print(humi2); Serial.println("%");
    Serial.print("💧 Humidité Sol 3: "); Serial.print(humi3); Serial.println("%");
    Serial.print("🔋 Batterie: "); Serial.print(batteryLevel); Serial.println("%");
    Serial.println("----------------------");

    // Attente pour affichage manuel
    if (buttonPressed) {
        Serial.println("📟 Bouton pressé, maintien en éveil.");
        buttonPressed = false;
        delay(20000);  // Maintien actif 20 secondes après appui sur bouton
    }

    Serial.println("😴 Mode sommeil...");
    //LowPower.sleep(600000);  // Mode sommeil pendant 10 minutes
}
