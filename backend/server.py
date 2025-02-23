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
    rows = c.execute("SELECT id, device, error, handled FROM Errors").fetchall()
    disconnect_db(conn)
    return [{"id": row["id"], "device": row["device"], "error": row["error"], "handled": bool(row["handled"])} for row in rows]

@app.put("/errors/{error_id}/toggle")
async def toggle_error(error_id: int):
    c, conn = connect_db()
    c.execute("UPDATE Errors SET handled = NOT handled WHERE id = ?", (error_id,))
    row = c.execute("SELECT id, device, error, handled FROM Errors WHERE id = ?", (error_id,)).fetchone()
    disconnect_db(conn)
    if row:
        return {"id": row["id"], "device": row["device"], "error": row["error"], "handled": bool(row["handled"])}
    return {"error": "Error not found"}

@app.get("/temperatures-humidity")
async def get_temperatures_humidity():
    c, conn = connect_db()
    query = "SELECT device, value, recorded_at FROM Measurements WHERE device IN (1, 2)"
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    temperatures = []
    humidity = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        if row["device"] == 1:
            temperatures.append(measurement)
        elif row["device"] == 2:
            humidity.append(measurement)
    return {"temperature": temperatures, "humidity": humidity}

@app.get("/soil-humidity")
async def get_soil_humidity():
    c, conn = connect_db()
    query = "SELECT device, value, recorded_at FROM Measurements WHERE device IN (4,5,6)"
    rows = c.execute(query).fetchall()
    disconnect_db(conn)
    humidity10 = []
    humidity20 = []
    humidity30 = []
    for row in rows:
        measurement = {"value": row["value"], "recorded_at": row["recorded_at"]}
        if row["device"] == 4:
            humidity10.append(measurement)
        elif row["device"] == 5:
            humidity20.append(measurement)
        elif row["device"] == 6:
            humidity30.append(measurement)
    return {"humidity10": humidity10, "humidity20": humidity20, "humidity30": humidity30}