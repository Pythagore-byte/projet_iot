import sqlite3, random

def connect_db(db_path='db.db'):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn, conn.cursor()

def init_capteurs(c): 
    c.execute("INSERT INTO Device (id, type) VALUES (1, 'temperature');")
    c.execute("INSERT INTO Device (id, type) VALUES (2, 'humidity');")
    c.execute("INSERT INTO Device (id, type) VALUES (3, 'temperaturesol');")
    c.execute("INSERT INTO Device (id, type) VALUES (4, 'humidity10');")
    c.execute("INSERT INTO Device (id, type) VALUES (5, 'humidity20');")
    c.execute("INSERT INTO Device (id, type) VALUES (6, 'humidity30');")
    c.execute("INSERT INTO Device (id, type) VALUES (7, 'luminosity');")
    c.execute("INSERT INTO Device (id, type) VALUES (8, 'co2');")
    c.execute("INSERT INTO Device (id, type) VALUES (9, 'luminosity');")
    c.execute("INSERT INTO Device (id, type) VALUES (10, 'pressure');")
    c.execute("INSERT INTO Device (id, type) VALUES (11, 'battery');")

def add_dummy_mesurements_missing_capteurs(c, n):
    for _ in range(n):
        device_id = random.randint(7, 10)
        value = random.randint(0, 100)
        c.execute("INSERT INTO Measurements (device, value) VALUES (?,?);", (device_id, value))

def add_dummy_records(c, max_device_id, n):
    for _ in range(n):
        device_id = random.randint(1, max_device_id)
        value = random.randint(0, 100)
        c.execute("INSERT INTO Measurements (device, value) VALUES (?, ?);", (device_id, value))

def add_dummy_errors(c, n):
    for _ in range(n):
        device_id = random.randint(1, 11)
        error = "dummy error"
        c.execute("INSERT INTO Errors (device, error) VALUES (?, ?);", (device_id, error))

def create_tables(c):
    c.execute("""
        CREATE TABLE IF NOT EXISTS Device (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type VARCHAR(255) NOT NULL CHECK(type IN ('temperature', 'humidity', 'temperaturesol','humidity10', 'humidity20', 'humidity30', 'co2', 'pressure', 'luminosity', 'battery'))
        )
    """)
    
    c.execute("""
        CREATE TABLE IF NOT EXISTS Measurements (
            device INTEGER,
            value DECIMAL(10, 2),
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (device) REFERENCES Device(id) ON DELETE CASCADE
        )
    """)
    
    c.execute("""
        CREATE TABLE IF NOT EXISTS Errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device INTEGER,
            error VARCHAR(255) NOT NULL,
            handled BOOLEAN DEFAULT FALSE,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (device) REFERENCES Device(id) ON DELETE CASCADE
        )
    """)

def main():
    conn, c = connect_db()
    create_tables(c) 
    init_capteurs(c)
    add_dummy_records(c, 11, 200)
    add_dummy_errors(c, 100)
    conn.commit()
    conn.close()
    
    


if __name__ == "__main__":
    main()
    
    
    
    
    