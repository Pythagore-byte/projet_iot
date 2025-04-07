#include <ArduinoLowPower.h>
#include "BatterySensor.hpp"
#include "SoilMoistureSensor.hpp"
#include "LightSensor.hpp"
#include "CO2Sensor.hpp"
#include "SoilTemperatureSensor.hpp"
//#include "BMP388Sensor.hpp"
#include <DFRobot_BMP3XX.h>
#include "DHT22Sensor.hpp"  // Ajout du DHT22
#include "LoRaWan.hpp"

// Définition du bouton pour réveil
// const int buttonPin = 5;  // Modifier selon la broche utilisée
#define CALIBRATE_ABSOLUTE_DIFFERENCE

// Définition du capteur DHT22 (broche 4, à modifier si besoin)
DHT22Sensor dht22(2); // Prototype 7

// Création des objets capteurs
//BMP388Sensor bmp388;
DFRobot_BMP388_I2C sensor(&Wire, sensor.eSDOGND);
SoilTemperatureSensor soilTempSensor(5); // prototype 8
CO2Sensor co2Sensor;
LightSensor lightSensor(0x23);
SoilMoistureSensor sensor1(A1, 3800, 9); // 20cm
SoilMoistureSensor sensor2(A2, 3800, 14); //10cm
SoilMoistureSensor sensor3(A3, 3800, 6); // 30cm
BatterySensor battery(A0, 3.3, 2.0);


// Variable pour détecter un appui sur le bouton
volatile bool buttonPressed = false;

// Fonction d'interruption (réveil par bouton)
void wakeUp() {
    buttonPressed = true;
}

void setup() {
    Serial.begin(9600);

    pinMode(14, OUTPUT);  // Définit la broche en sortie D13 pour prototype
    digitalWrite(14, HIGH);  // Allume la sortie

    // Configuration LoRaWAN
    configureLoRaWAN();

    // Configuration du bouton avec interruption
    // pinMode(buttonPin, INPUT_PULLUP);
    // attachInterrupt(digitalPinToInterrupt(buttonPin), wakeUp, FALLING);

    int rslt;
    while( ERR_OK != (rslt = sensor.begin()) ){
      if(ERR_DATA_BUS == rslt){
        Serial.println("Data bus error!!!");
      }else if(ERR_IC_VERSION == rslt){
        Serial.println("Chip versions do not match!!!");
      }
      delay(3000);
    }
    Serial.println("Begin ok!");

    while( !sensor.setSamplingMode(sensor.eUltraPrecision) ){
        Serial.println("Set samping mode fail, retrying....");
        delay(3000);
      }
    
    delay(100);
    #ifdef CALIBRATE_ABSOLUTE_DIFFERENCE

    if( sensor.calibratedAbsoluteDifference(50.0) ){
        Serial.println("Absolute difference base value set successfully!");
      }
    #endif

    float sampingPeriodus = sensor.getSamplingPeriodUS();
    float sampingFrequencyHz = 1000000 / sampingPeriodus;      
    delay(1000);

    // Initialisation des capteurs
    soilTempSensor.init();
    battery.init();
    sensor1.init();
    sensor2.init();
    sensor3.init();
    lightSensor.init();
    co2Sensor.init();
    //bmp388.begin();
    dht22.begin();  // Initialisation du DHT22

    Serial.println("🌱 Système prêt !");
}

void loop() {


    // Pate régulateur 
    digitalWrite(14, HIGH);  // Allume la sortie
    delay(1000);

    // Packet LoRa
    uint8_t packet[20] = {0};
    
    Serial.println("🔵 Réveil du système, acquisition des données...");

    // Lecture des capteurs

      co2Sensor.restartSensor();  // Forcer un redémarrage complet du SCD30

    uint16_t co2 = co2Sensor.getCO2();
    if (co2 < 0) {
        Serial.println("❌ Capteur CO2 toujours inactif après redémarrage !");
    } else {
        Serial.print("💨 CO2: ");
        Serial.print(co2);
        Serial.println(" ppm");
    }

    // 🔄 Vérifier si les valeurs sont correctes après la mise en veille
    //uint16_t pression = bmp388.getPressure();
    //if (pression < 80000 || pression > 110000) {  // Pression anormale
    //    Serial.println("⚠️ Valeur anormale, reset du capteur...");
    //    bmp388.resetSensor();
    //    delay(1000);
    //    pression = bmp388.getPressure();
    //}
    float temperature = sensor.readTempC();
    float pression = sensor.readPressPa(); // Pression en Pa
    float altitude = sensor.readAltitudeM();
    Serial.print("Pression : ");
    Serial.print(pression); Serial.println(" Pa");
    Serial.print("Altitude : ");
    Serial.print(altitude); Serial.println(" m");
    Serial.print("Température : ");
    Serial.print(temperature); Serial.println(" °C");
    delay(1000);
    
    int16_t temp2 = soilTempSensor.getTemperature() *10; // sol
    int16_t temp1 = dht22.getTemperature() *10;   // air
    uint16_t  hum4 = dht22.getHumidity() *10; // air
    //uint16_t  co2 = co2Sensor.getCO2();   
    uint32_t  lum = lightSensor.getLux();
    uint16_t  hum3 = sensor1.getHumidityLevel() *10;  // sol 20cm
    int value = sensor1.getRawValue();
    Serial.println(value);
    uint16_t  hum2 = sensor2.getHumidityLevel() *10; // sol 10cm
    value = sensor1.getRawValue();
    Serial.println(value);
    uint16_t  hum1 = sensor3.getHumidityLevel() *10; // sol 30cm
    value = sensor1.getRawValue();
    Serial.println(value);
    uint8_t  batterie = battery.getBatteryPercentage();
    //uint16_t  pression = bmp388.getPressure();


  

    // Affichage des données
    Serial.println("----------------------");
    Serial.print("🔵 Pression: "); Serial.print(pression); Serial.println(" Pa");
    Serial.print("🌡 Température Air: "); Serial.print(temp1); Serial.println(" °C");
    Serial.print("🌡 Température Sol: "); Serial.print(temp2); Serial.println(" °C");
    Serial.print("💧 Humidité Air: "); Serial.print(hum4); Serial.println(" %");
    Serial.print("💨 CO2: "); Serial.print(co2); Serial.println(" ppm");
    Serial.print("☀️ LUX: "); Serial.print(lum); Serial.println(" lx");
    Serial.print("💧 Humidité Sol 10cm: "); Serial.print(hum3); Serial.println("%");
    Serial.print("💧 Humidité Sol 20cm: "); Serial.print(hum2); Serial.println("%");
    Serial.print("💧 Humidité Sol 30cm: "); Serial.print(hum1); Serial.println("%");
    Serial.print("🔋 Batterie: "); Serial.print(batterie); Serial.println("%"); 
    Serial.println("----------------------");

    //convertir pression qui est un float en uint16_t sachant que j'ai deja récupérer pression avant dans le code
    uint16_t pression1 = pression/10; // Conversion de float à uint16_t


    // Encodage des données
    packet[0] = temp1 & 0xFF;
    packet[1] = (temp1 >> 8) & 0xFF;
    packet[2] = temp2 & 0xFF;
    packet[3] = (temp2 >> 8) & 0xFF;
    packet[4] = hum1 & 0xFF;
    packet[5] = (hum1 >> 8) & 0xFF;
    packet[6] = hum2 & 0xFF;
    packet[7] = (hum2 >> 8) & 0xFF;
    packet[8] = hum3 & 0xFF;
    packet[9] = (hum3 >> 8) & 0xFF;
    packet[10] = hum4 & 0xFF;
    packet[11] = (hum4 >> 8) & 0xFF;
    packet[12] = lum & 0xFF;
    packet[13] = (lum >> 8) & 0xFF;
    packet[14] = (lum >> 16) & 0xFF;
    packet[15] = co2 & 0xFF;
    packet[16] = (co2 >> 8) & 0xFF;
    packet[17] = pression1 & 0xFF;
    packet[18] = (pression1 >> 8) & 0xFF;
    packet[19] = batterie & 0x7F;
    
        // Envoi des données
        bool ok = sendDataViaLoRa(packet, sizeof(packet));
    
        if (!ok) {
            Serial.println("⚠️ Tentative de reconnexion...");
            configureLoRaWAN();
        }

    // Attente pour affichage manuel
    //if (buttonPressed) {
    //    Serial.println("📟 Bouton pressé, maintien en éveil.");
    //    buttonPressed = false;
    //    delay(20000);  // Maintien actif 20 secondes après appui sur bouton
    //}

    Serial.println("😴 Mode sommeil...");
    digitalWrite(14, LOW);   // Éteint la sortie
    //delay(20000);
    //LowPower.deepSleep(10000);
    LowPower.deepSleep(600000);  // Mode sommeil pendant 10 minutes
}
