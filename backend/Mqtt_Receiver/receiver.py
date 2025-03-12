import paho.mqtt.client as mqtt
import json
import time

# ===================================
# Récupération des données depuis TTN 
# ===================================

# Paramètres TTN (à adapter)
app_id = "terratrackeu"
device_id = "captor-controller"
access_key = "NNSXS.CBQW4DRZ36OCTHXFA4436UNZSO2RPIW4LPZ6L4A.JOGRGLXEMR3XXV53WZIWPQETC3HH6KUSD6TEU2JZBCYQ6CMOGG3A"
broker = "eu1.cloud.thethings.network"
port = 8883  # Port sécurisé MQTT

# Pour stocker l'historique des uplinks
received_data = []

def on_message(client, userdata, message):
    try:
        # On parse le JSON renvoyé par TTN
        data = json.loads(message.payload.decode("utf-8"))
        uplink_msg = data.get("uplink_message", {})

        # Ici, TTN a déjà décodé la payload => "decoded_payload"
        decoded = uplink_msg.get("decoded_payload", {})
        if not decoded:
            print("⚠️ Aucune 'decoded_payload' dans le message.")
            return

        # Affichage direct des données
        print("=== Uplink reçu (décodé par TTN) ===")
        for key, val in decoded.items():
            print(f"{key}: {val}")
        print("====================================\n")

        # On stocke aussi dans une liste Python
        received_data.append(decoded)

    except json.JSONDecodeError:
        print("❌ Erreur JSON dans le message TTN.")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")

def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("✅ Connecté à TTN MQTT Broker")
        topic = f"v3/{app_id}@ttn/devices/{device_id}/up"
        client.subscribe(topic)
        print(f"📡 Abonné au topic : {topic}")
    else:
        print(f"❌ Échec de connexion, code erreur : {reason_code}")

# Initialisation du client MQTT (v2 pour la Callback API)
client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(f"{app_id}@ttn", access_key)  # Authentification
client.tls_set()  # Active TLS
client.on_connect = on_connect
client.on_message = on_message

# Connexion au broker
client.connect(broker, port)

# Lancement de la boucle MQTT (asynchrone)
client.loop_start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Fermeture du script...")

client.loop_stop()
client.disconnect()
