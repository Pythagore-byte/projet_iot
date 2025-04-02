#include "LoRaWan.hpp"

// Initialisation du modem LoRa
LoRaModem modem;

// Paramètres TTN
String devEUI = "A8610A32332C9203";
String appEUI = "1234567890000000";
String appKey = "87C35A509FF383F53757E019092655E0";

// Définition de la région LoRa (Europe : EU868)
_lora_band region = EU868;

// -----------------------------------------------------------
// Configuration du modem LoRa et connexion OTAA
// -----------------------------------------------------------
void configureLoRaWAN() {
    Serial.println("=== Initialisation du modem LoRa ===");

    if (!modem.begin(region)) {
        Serial.println("Erreur: impossible d'initialiser le modem !");
        while (1);
    }

    Serial.println("=== Connexion OTAA en cours... ===");
    if (!modem.joinOTAA(appEUI, appKey, devEUI)) {
        Serial.println("Erreur: OTAA échouée !");
        while (1);
    }

    Serial.println("=== Connecté à TTN via OTAA ! ===");
}

// -----------------------------------------------------------
// Envoi de données LoRaWAN
// -----------------------------------------------------------
bool sendDataViaLoRa(uint8_t *data, size_t len) {
    modem.beginPacket();
    modem.write(data, len);
    int success = modem.endPacket(true);

    if (success > 0) {
        Serial.println("✅ Données LoRa envoyées avec succès !");
        return true;
    } else {
        Serial.println("❌ Échec de l'envoi LoRa !");
        return false;
    }
}
