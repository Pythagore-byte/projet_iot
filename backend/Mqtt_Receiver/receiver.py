import paho.mqtt.client as mqtt
import json

# ===================================
# Récupération des données depuis TTN 
# ===================================

# Paramètres TTN
app_id = "my-application"
device_id = "Device"
access_key = "DKFDKFOEFL"
broker = "eu1.cloud.thethings.network"
port = 1883

# Callback quand un message est reçu
def on_message(client, userdata, message):
    try:
        data = json.loads(message.payload.decode("utf-8"))  # Décodage propre du JSON
        measures = data.get('uplink_message', {}).get('decoded_payload', {}).get('Measures', [])

        if not measures:
            print("⚠️ Aucune mesure trouvée dans le message reçu.")
            return

        print(f"📩 Message reçu : {measures}")  # Affichage pour debug

        # Stocker les données dans un buffer global (ex: liste en mémoire)
        global received_data
        received_data.append(measures)

    except json.JSONDecodeError:
        print("❌ Erreur : Impossible de décoder le message JSON.")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")

# Initialisation du client MQTT
client = mqtt.Client(protocol=mqtt.MQTTv311)
client.username_pw_set(app_id, access_key)
client.on_message = on_message
client.connect(broker, port)

# S'abonner au topic TTN
topic = f"v3/{app_id}@ttn/devices/{device_id}/up"
client.subscribe(topic)

# Liste pour stocker les données en mémoire temporaire
received_data = []

# Lancer l'écoute des messages MQTT
client.loop_start()
