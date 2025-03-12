#include <MKRWAN.h>

LoRaModem modem;  // Modem LoRa intégré au MKR WAN

// --- Paramètres TTN ---
// (À adapter avec tes vraies clés)
String devEUI = "70B3D57ED006E461";
String appEUI = "A8610A3435305F10";
String appKey = "BFF35E8B21DC13050FBBED93FCCD6BDA";

// --- Configuration de la région LoRa (EU868 pour l'Europe) ---
_lora_band region = EU868;

// -------------------------------------------------------------------------
// Configure le modem LoRa et tente la connexion OTAA à TTN
// -------------------------------------------------------------------------
void configureLoRaWAN() {
  Serial.println("=== Initialisation du modem LoRa ===");

  // Initialisation du modem
  if (!modem.begin(region)) {
    Serial.println("Erreur: impossible d'initialiser le modem !");
    while (1) {
      // Bloque le programme ici si échec.
      // (en production, on pourrait faire un reset ou un retry)
    }
  }

  Serial.println("=== Connexion OTAA en cours... ===");
  // OTAA join
  if (!modem.joinOTAA(appEUI, appKey, devEUI)) {
    Serial.println("Erreur: OTAA échouée !");
    while (1) {
      // Bloque si échec de join
    }
  }

  Serial.println("=== Connecté à TTN via OTAA ! ===");
}

// -------------------------------------------------------------------------
// Envoie un tableau de données sur le réseau LoRaWAN
// (renvoie vrai si succès, faux sinon)
// -------------------------------------------------------------------------
bool sendDataViaLoRa(uint8_t *data, size_t len) {
  // Prépare l'envoi
  modem.beginPacket();
  modem.write(data, len);

  // On utilise true pour un message confirmé
  int success = modem.endPacket(true);

  if (success > 0) {
    Serial.println("✅ Données LoRa envoyées avec succès !");
    return true;
  } else {
    Serial.println("❌ Échec de l'envoi LoRa !");
    return false;
  }
}

// -------------------------------------------------------------------------
// Setup : appelé une seule fois
// -------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // Attendre l'initialisation de la liaison Série
  }

  // Initialisation et connexion LoRaWAN
  configureLoRaWAN();
}

// -------------------------------------------------------------------------
// Loop : appelé en boucle
// -------------------------------------------------------------------------
void loop() {
  // --- Simulation des valeurs de capteurs ---
  int16_t temp1      = 215;    // 21,5°C -> stocké en "dixièmes de °C"
  int16_t temp2      = -30;    // -3,0°C
  uint16_t hum1      = 512;    // 51,2 %
  uint16_t hum2      = 487;    // 48,7 %
  uint16_t hum3      = 523;    // 52,3 %
  uint16_t hum4      = 450;    // 45,0 %
  uint32_t lum       = 35000;  // 35 000 lux
  uint16_t co2       = 4562;   // ppm
  uint16_t pression  = 1013;   // hPa
  uint8_t batterie   = 98;     // %

  // --- Création du tableau binaire (20 octets) ---
  uint8_t packet[20] = {0};

  // --- Encodage simple (2 octets pour chaque int16, etc.) ---
  // 1) temp1
  packet[0] = temp1 & 0xFF;
  packet[1] = (temp1 >> 8) & 0xFF;

  // 2) temp2
  packet[2] = temp2 & 0xFF;
  packet[3] = (temp2 >> 8) & 0xFF;

  // 3) hum1
  packet[4] = hum1 & 0xFF;
  packet[5] = (hum1 >> 8) & 0xFF;

  // 4) hum2
  packet[6] = hum2 & 0xFF;
  packet[7] = (hum2 >> 8) & 0xFF;

  // 5) hum3
  packet[8] = hum3 & 0xFF;
  packet[9] = (hum3 >> 8) & 0xFF;

  // 6) hum4
  packet[10] = hum4 & 0xFF;
  packet[11] = (hum4 >> 8) & 0xFF;

  // 7) lum (3 octets potentiels, mais on va en utiliser 3 max)
  packet[12] =  lum        & 0xFF;
  packet[13] = (lum >> 8)  & 0xFF;
  packet[14] = (lum >> 16) & 0xFF;

  // 8) co2
  packet[15] = co2 & 0xFF;
  packet[16] = (co2 >> 8) & 0xFF;

  // 9) pression
  packet[17] = pression & 0xFF;
  packet[18] = (pression >> 8) & 0xFF;

  // 10) batterie (un seul octet, max 127 ici)
  packet[19] = batterie & 0x7F; 

  // --- Tentative d'envoi ---
  bool ok = sendDataViaLoRa(packet, sizeof(packet));

  // Si l'envoi a échoué, on suppose qu'on a perdu la connexion → on retente le join
  if (!ok) {
    Serial.println("⚠️ Tentative de reconnexion...");
    configureLoRaWAN();
  }

  // Attendre 60 s avant la prochaine mesure
  delay(60000);
}
