import paho.mqtt.client as mqtt
import json
import time
import sqlite3

# ===================================
# Récupération des données depuis TTN 
# ===================================

# Paramètres TTN (à adapter)
app_id = "terratrackeu"
device_id = "captor-controller"
access_key = "NNSXS.CBQW4DRZ36OCTHXFA4436UNZSO2RPIW4LPZ6L4A.JOGRGLXEMR3XXV53WZIWPQETC3HH6KUSD6TEU2JZBCYQ6CMOGG3A"
broker = "eu1.cloud.thethings.network"
port = 8883  # Port sécurisé MQTT

# -------------------------
# Connexion à la base SQLite
# -------------------------
def connect_db(db_path='db.db'):
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn, conn.cursor()

conn, cursor = connect_db()

# Mapping des capteurs selon le schéma de la base de données
DEVICE_MAPPING = {
    'temp2': 1,        # temperature
    'hum1': 2,         # humidity
    'temp1': 3,        # temperaturesol
    'hum2': 4,         # humidity10
    'hum3': 5,         # humidity20
    'hum4': 6,         # humidity30
    'lum': 7,          # luminosity
    'co2': 8,          # co2
    'pression': 10,    # pressure
    'batterie': 11     # battery
}

# Define acceptable ranges for each sensor type
SENSOR_VALIDATION = {
    'temp1': {'min': -10, 'max': 60, 'description': 'Soil temperature'},  # Soil temperature in °C
    'temp2': {'min': -10, 'max': 50, 'description': 'Air temperature'},   # Air temperature in °C
    'hum1': {'min': 0, 'max': 100, 'description': 'Air humidity'},        # Air humidity %
    'hum2': {'min': 0, 'max': 100, 'description': 'Soil humidity 10cm'},  # Soil humidity at 10cm %
    'hum3': {'min': 0, 'max': 100, 'description': 'Soil humidity 20cm'},  # Soil humidity at 20cm %
    'hum4': {'min': 0, 'max': 100, 'description': 'Soil humidity 30cm'},  # Soil humidity at 30cm %
    'lum': {'min': 0, 'max': 100000, 'description': 'Luminosity'},        # Luminosity in lux
    'co2': {'min': 0, 'max': 5000, 'description': 'CO2 level'},           # CO2 in ppm
    'pression': {'min': 900, 'max': 1100, 'description': 'Atmospheric pressure'}, # Pressure in hPa
    'batterie': {'min': 0, 'max': 100, 'description': 'Battery level'}    # Battery percentage
}

def validate_sensor_value(sensor_name, value):
    """
    Validates if a sensor value is within the acceptable range.
    Returns (is_valid, error_message)
    """
    if value is None:
        return False, "Value is missing"
    
    if sensor_name not in SENSOR_VALIDATION:
        return False, f"Unknown sensor type: {sensor_name}"
    
    validation = SENSOR_VALIDATION[sensor_name]
    if not isinstance(value, (int, float)):
        return False, f"Value must be numeric, got {type(value)}"
    
    if value < validation['min'] or value > validation['max']:
        return False, f"Value {value} out of range ({validation['min']}-{validation['max']}) for {validation['description']}"
    
    return True, None

def insert_uplink_in_db(batterie, pression, co2, lum, hum4, hum3, hum2, hum1, temp2, temp1):
    """Insère les champs du payload dans la table Measurements selon le mapping des capteurs."""
    # Création d'un dictionnaire pour faciliter le traitement
    values = {
        'batterie': batterie,
        'pression': pression,
        'co2': co2,
        'lum': lum,
        'hum4': hum4,
        'hum3': hum3,
        'hum2': hum2,
        'hum1': hum1,
        'temp2': temp2,
        'temp1': temp1
    }
    
    # Insertion de chaque valeur dans la table Measurements après validation
    for sensor_name, value in values.items():
        if value is not None and sensor_name in DEVICE_MAPPING:
            device_id = DEVICE_MAPPING[sensor_name]
            
            # Validate the sensor value
            is_valid, error_message = validate_sensor_value(sensor_name, value)
            
            if is_valid:
                # Insert valid value into measurements
                cursor.execute(
                    "INSERT INTO Measurements (device, value) VALUES (?, ?);",
                    (device_id, value)
                )
            else:
                # Check if an error for this device already exists
                cursor.execute(
                    "SELECT COUNT(*) FROM Errors WHERE device = ? AND error = ?;",
                    (device_id, error_message)
                )
                error_exists = cursor.fetchone()[0] > 0

                if not error_exists:
                    # Insert error for invalid value if it doesn't already exist
                    cursor.execute(
                        "INSERT INTO Errors (device, error) VALUES (?, ?);", 
                        (device_id, error_message)
                    )
    
    conn.commit()

# ---------------
# Callbacks MQTT
# ---------------
def on_connect(client, userdata, flags, reason_code, properties=None):
    """Callback déclenché lors de la connexion au broker."""
    if reason_code == 0:
        print("✅ Connecté à TTN MQTT Broker")
        topic = f"v3/{app_id}@ttn/devices/{device_id}/up"
        client.subscribe(topic)
        print(f"📡 Abonné au topic : {topic}")
    else:
        print(f"❌ Échec de connexion, code erreur : {reason_code}")

def on_message(client, userdata, message):
    """Callback déclenché lors de la réception d'un message MQTT."""
    try:
        # Récupération du JSON depuis TTN
        data = json.loads(message.payload.decode("utf-8"))
        uplink_msg = data.get("uplink_message", {})
        decoded = uplink_msg.get("decoded_payload", {})

        if not decoded:
            print("⚠️ Aucune 'decoded_payload' dans le message.")
            return

        # Extraction des champs (exactement les mêmes noms que dans decodeUplink)
        batterie  = decoded.get("batterie")
        pression  = decoded.get("pression")
        co2       = decoded.get("co2")
        lum       = decoded.get("lum")
        hum4      = decoded.get("hum4")
        hum3      = decoded.get("hum3")
        hum2      = decoded.get("hum2")
        hum1      = decoded.get("hum1")
        temp2     = decoded.get("temp2")
        temp1     = decoded.get("temp1")

        print("=== Uplink reçu (décodé par TTN) ===")
        print(f"batterie:  {batterie}")
        print(f"pression:  {pression}")
        print(f"co2:       {co2}")
        print(f"lum:       {lum}")
        print(f"hum4:      {hum4}")
        print(f"hum3:      {hum3}")
        print(f"hum2:      {hum2}")
        print(f"hum1:      {hum1}")
        print(f"temp2:     {temp2}")
        print(f"temp1:     {temp1}")
        print("====================================\n")

        # Insertion dans la base de données
        insert_uplink_in_db(
            batterie, pression, co2,
            lum, hum4, hum3, hum2, hum1,
            temp2, temp1
        )

    except json.JSONDecodeError:
        print("❌ Erreur JSON dans le message TTN.")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")

# ---------------
# Configuration MQTT
# ---------------
client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
client.username_pw_set(f"{app_id}@ttn", access_key)
client.tls_set()
client.on_connect = on_connect
client.on_message = on_message

# Connexion au broker
client.connect(broker, port)
client.loop_start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Fermeture du script...")

client.loop_stop()
client.disconnect()
conn.close()
