DROP TABLE IF EXISTS Device;
DROP TABLE IF EXISTS Measurements;
DROP TABLE IF EXISTS Errors;

CREATE TABLE Device(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(255) NOT NULL CHECK(type IN ('temperature', 'humidity', 'humidity10', 'humidity20', 'humidity30', 'co2', 'pressure', 'luminosity'))
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
    handled BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);