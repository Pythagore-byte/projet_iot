import sqlite3, random

def connect_db(db_path='db.db'):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn, conn.cursor()

def init_capteurs(c): 
    c.execute("INSERT INTO Device (id, type) VALUES (1, 'temperature');")
    c.execute("INSERT INTO Device (id, type) VALUES (2, 'humidity');")
    c.execute("INSERT INTO Device (id, type) VALUES (3, 'humidity10');")
    c.execute("INSERT INTO Device (id, type) VALUES (4, 'humidity20');")
    c.execute("INSERT INTO Device (id, type) VALUES (5, 'humidity30');")
    c.execute("INSERT INTO Device (id, type) VALUES (6, 'luminosity');")

def add_records(c, max_device_id, n):
    for _ in range(n):
        device_id = random.randint(1, max_device_id)
        value = random.randint(0, 100)
        c.execute("INSERT INTO Measurements (device, value) VALUES (?, ?);", (device_id, value))

def add_dummy_errors(c, n):
    for _ in range(n):
        device_id = random.randint(1, 6)
        error = "dummy error"
        c.execute("INSERT INTO Errors (device, error) VALUES (?, ?);", (device_id, error))

def add_dummy_mesurements(c, n, max_device_id):
    for _ in range(n):
        device_id = random.randint(1, max_device_id)
        value = random.randint(0, 100)
        c.execute("INSERT INTO Measurements (device, value) VALUES (?, ?);", (device_id, value))

def main():
    conn, c = connect_db()
    add_dummy_mesurements(c, 100, 6)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()