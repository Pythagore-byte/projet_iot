import sqlite3, random

# Connect to database
conn = sqlite3.connect('db.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Add randomally generated records for all the available devices
def add_records(max_device_id, n):
    for _ in range(n):
        device_id = random.randint(1, max_device_id)
        value = random.randint(0, 100)
        c.execute("INSERT INTO Measurements (device, value) VALUES (?, ?);", (device_id, value))

add_records(3, 100)

conn.commit()
conn.close()