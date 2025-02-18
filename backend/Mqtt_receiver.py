import paho.mqtt.client as mqtt
import json

# Partie 1 : Récupération des données 

#On va changer les données pour les adapter
app_id = "my-application"
device_id = 'Device'
access_key="DKFDKFOEFL"
broker = "eu1.cloud.thethings.network"
port = 1883

#Callback quand le message est reçu 
def on_message(client, message):
    data = json.loads(message.payload)
    try:
        measures = data['uplink_message']['decoded_payload']['Measures']
        for measure in measures:
            device_id = measure.get('device_id')
            valeur = measure.get('valeur')
            

    except KeyError:
        print("Données de mesures non trouvées dans le message reçu")
    
    return measures 

#configuration du client MQTT pour TTN 
client = mqtt.Client(protocol=mqtt.MQTTv311)
client.username_pw_set(app_id, access_key)
client.on_message = on_message
client.connect(broker, port)

#s'abonner au topic de l'appareil TTN 
topic = f"v3/{app_id}@ttn/devices/{device_id}/up"
client.subscribe(topic)

#lancer l'écoute des messages de TTN 
client.loop_forever()