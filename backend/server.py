from fastapi import FastAPI
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)
def connect_db():
    conn = sqlite3.connect('db.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    return c, conn

def disconnect_db(conn):
    conn.commit()
    conn.close()

@app.get("/errors")
async def get_errors():
    c, conn = connect_db()
    rows = c.execute("SELECT id, device, error, handled, recorded_at FROM Errors").fetchall()
    disconnect_db(conn)
    return [{"id": row["id"], "device": row["device"], "error": row["error"], "handled": bool(row["handled"]), "recorded_at": row["recorded_at"]} for row in rows]

@app.put("/errors/{error_id}/toggle")
async def toggle_error(error_id: int):
    c, conn = connect_db()
    c.execute("UPDATE Errors SET handled = NOT handled WHERE id = ?", (error_id,))
    row = c.execute("SELECT id, device, error, handled, recorded_at FROM Errors WHERE id = ?", (error_id,)).fetchone()
    disconnect_db(conn)
    if row:
        return {"id": row["id"], "device": row["device"], "error": row["error"], "handled": bool(row["handled"]), "recorded_at": row["recorded_at"]}
    return {"error": "Error not found"}

@app.get("/temperatures-humidity")
async def get_temperatures_humidity():
    c, conn = connect_db()
    query = """
        SELECT m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE d.type IN ('temperature', 'humidity')
    """
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    temperatures = []
    humidity = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        if row["type"] == "temperature":
            temperatures.append(measurement)
        elif row["type"] == "humidity":
            humidity.append(measurement)
    return {"temperature": temperatures, "humidity": humidity}

@app.get("/soil-humidity")
async def get_soil_humidity():
    c, conn = connect_db()
    query = """
        SELECT m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE d.type IN ('humidity10', 'humidity20', 'humidity30')
    """
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    humidity10 = []
    humidity20 = []
    humidity30 = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        if row["type"] == "humidity10":
            humidity10.append(measurement)
        elif row["type"] == "humidity20":
            humidity20.append(measurement)
        elif row["type"] == "humidity30":
            humidity30.append(measurement)
    return {"humidity10": humidity10, "humidity20": humidity20, "humidity30": humidity30}

@app.get("/luminosity")
async def get_luminosity():
    c, conn = connect_db()
    query = """
        SELECT m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE d.type = 'luminosity'
    """
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    luminosity = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        luminosity.append(measurement)
    return {"luminosity": luminosity}

@app.get("/co2")
async def get_co2():
    c, conn = connect_db()
    query = """
        SELECT m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE d.type = 'co2'
    """
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    co2 = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        co2.append(measurement)
    return {"co2": co2}

@app.get("/pressure")
async def get_pressure():
    c, conn = connect_db()
    query = """
        SELECT m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE d.type = 'pressure'
    """
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    pressure = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        pressure.append(measurement)
    return {"pressure": pressure}

@app.get("/battery")
async def get_battery():
    c, conn = connect_db()
    query = """
        SELECT m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE d.type = 'battery'
    """
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    battery = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        battery.append(measurement)
    return {"battery": battery}

@app.get("/check-abnormal-measurements")
async def check_abnormal_measurements():
    c, conn = connect_db()
    
    # Define thresholds for different measurement types
    thresholds = {
        'temperature': 5.0,  # ±5°C
        'humidity': 10.0,    # ±10%
        'humidity10': 5.0,   # ±5%
        'humidity20': 5.0,   # ±5%
        'humidity30': 5.0,   # ±5%
        'co2': 100.0,        # ±100ppm
        'luminosity': 10000.0, # ±10,000 lux (day)
        'pressure': 5.0,     # ±5hPa
        'battery': 5.0       # ±5%
    }
    
    # Special case for luminosity at night (lower threshold)
    night_luminosity_threshold = 500.0  # ±500 lux (night)
    
    # Get measurements from the last 24 hours
    query = """
        SELECT m.device, m.value, m.recorded_at, d.type 
        FROM Measurements m 
        JOIN Device d ON m.device = d.id 
        WHERE m.recorded_at >= datetime('now', '-1 day')
        ORDER BY d.type, m.recorded_at
    """
    rows = c.execute(query).fetchall()
    
    # Group measurements by device type
    measurements_by_type = {}
    for row in rows:
        device_type = row["type"]
        if device_type not in measurements_by_type:
            measurements_by_type[device_type] = []
        
        measurements_by_type[device_type].append({
            "device": row["device"],
            "value": row["value"],
            "recorded_at": row["recorded_at"]
        })
    
    # Check for abnormal changes
    abnormal_changes = []
    for device_type, measurements in measurements_by_type.items():
        if device_type not in thresholds or len(measurements) < 2:
            continue
        
        threshold = thresholds[device_type]
        
        for i in range(1, len(measurements)):
            prev_measurement = measurements[i-1]
            curr_measurement = measurements[i]
            
            # Special case for luminosity (day/night)
            if device_type == 'luminosity':
                # If current value is low (night), use night threshold
                if curr_measurement["value"] < 1000:
                    threshold = night_luminosity_threshold
                else:
                    threshold = thresholds[device_type]
            
            # Calculate absolute difference
            diff = abs(curr_measurement["value"] - prev_measurement["value"])
            
            # Check if difference exceeds threshold
            if diff > threshold:
                error_message = f"Abnormal change detected: {prev_measurement['value']} to {curr_measurement['value']} (diff: {diff}, threshold: {threshold})"
                
                # Check if this error already exists
                existing_error = c.execute(
                    "SELECT id FROM Errors WHERE device = ? AND error = ? AND recorded_at >= datetime('now', '-1 day')",
                    (curr_measurement["device"], error_message)
                ).fetchone()
                
                if not existing_error:
                    # Insert new error
                    c.execute(
                        "INSERT INTO Errors (device, error) VALUES (?, ?)",
                        (curr_measurement["device"], error_message)
                    )
                    
                    abnormal_changes.append({
                        "device": curr_measurement["device"],
                        "device_type": device_type,
                        "previous_value": prev_measurement["value"],
                        "current_value": curr_measurement["value"],
                        "difference": diff,
                        "threshold": threshold,
                        "recorded_at": curr_measurement["recorded_at"]
                    })
    
    disconnect_db(conn)
    return {"abnormal_changes": abnormal_changes}