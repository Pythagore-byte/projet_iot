#ifndef LORAWAN_HPP
#define LORAWAN_HPP

#include <Arduino.h>
#include <MKRWAN.h>

// Déclaration du modem LoRa
extern LoRaModem modem;

// Paramètres TTN (à adapter)
extern String devEUI;
extern String appEUI;
extern String appKey;

// Fonction de configuration LoRaWAN
void configureLoRaWAN();

// Fonction d'envoi de données
bool sendDataViaLoRa(uint8_t *data, size_t len);

#endif
