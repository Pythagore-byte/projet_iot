DROP TABLE IF EXISTS Type;
DROP TABLE IF EXISTS Device;
DROP TABLE IF EXISTS Measurements;
DROP TABLE IF EXISTS Errors;

CREATE TABLE Type(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(255) NOT NULL, 
    unit  VARCHAR(255) NOT NULL
);

CREATE TABLE Device(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type REFERENCES Type(id) ON DELETE CASCADE 
);

CREATE TABLE Measurements(
    device REFERENCES Device(id) ON DELETE CASCADE, 
    value DECIMAL(10, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Errors(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device REFERENCES Device(id) ON DELETE CASCADE,
    error VARCHAR(255) NOT NULL,
    handled BOOLEAN DEFAULT FALSE
);

-- INIT 
INSERT INTO Type (id, type, unit) VALUES (1, 'Temperature', '°C');
INSERT INTO Type (id, type, unit) VALUES (2, 'Humidity', '%');
INSERT INTO Type (id, type, unit) VALUES (3, 'Luminosity', 'Lux');
INSERT INTO Type (id, type, unit) VALUES (4, 'Humidity10', '%');
INSERT INTO Type (id, type, unit) VALUES (5, 'Humidity20', '%');
INSERT INTO Type (id, type, unit) VALUES (6, 'Humidity30', '%');

INSERT INTO Device (id, type) VALUES (1, 1);
INSERT INTO Device (id, type) VALUES (2, 1);
INSERT INTO Device (id, type) VALUES (3, 3);
INSERT INTO Device (id, type) VALUES (4, 2);
INSERT INTO Device (id, type) VALUES (5, 2);
INSERT INTO Device (id, type) VALUES (6, 3);

INSERT INTO Errors (device, error) VALUES (1, 'Error 1');
INSERT INTO Errors (device, error) VALUES (2, 'Error 2');
INSERT INTO Errors (device, error) VALUES (3, 'Error 3');
INSERT INTO Errors (device, error) VALUES (3, 'Error 4');
INSERT INTO Errors (device, error) VALUES (3, 'Error 5');
INSERT INTO Errors (device, error) VALUES (6, 'Error 6');