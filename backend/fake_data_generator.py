import sqlite3, random

def connect_db(db_path='db.db'):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn, conn.cursor()

def insert_initial_data(c):
    # Insert into Type
    c.execute("INSERT INTO Type (id, type, unit) VALUES (1, 'Temperature', '°C');")
    c.execute("INSERT INTO Type (id, type, unit) VALUES (2, 'Humidity', '%');")
    c.execute("INSERT INTO Type (id, type, unit) VALUES (3, 'Luminosity', 'Lux');")
    # Insert into Device
    c.execute("INSERT INTO Device (id, type) VALUES (1, 1);")
    c.execute("INSERT INTO Device (id, type) VALUES (2, 1);")
    c.execute("INSERT INTO Device (id, type) VALUES (3, 3);")
    c.execute("INSERT INTO Device (id, type) VALUES (4, 2);")
    c.execute("INSERT INTO Device (id, type) VALUES (5, 2);")
    c.execute("INSERT INTO Device (id, type) VALUES (6, 3);")
    # Insert into Errors
    c.execute("INSERT INTO Errors (device, error) VALUES (1, 'Error 1');")
    c.execute("INSERT INTO Errors (device, error) VALUES (2, 'Error 2');")
    c.execute("INSERT INTO Errors (device, error) VALUES (3, 'Error 3');")
    c.execute("INSERT INTO Errors (device, error) VALUES (3, 'Error 4');")
    c.execute("INSERT INTO Errors (device, error) VALUES (3, 'Error 5');")
    c.execute("INSERT INTO Errors (device, error) VALUES (6, 'Error 6');")

def add_records(c, max_device_id, n):
    for _ in range(n):
        device_id = random.randint(1, max_device_id)
        value = random.randint(0, 100)
        c.execute("INSERT INTO Measurements (device, value) VALUES (?, ?);", (device_id, value))

def main():
    conn, c = connect_db()
    # insert_initial_data(c)
    add_records(c, 6, 100)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()