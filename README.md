# projet_iot

## Project Overview

This repository contains an IoT project involving sensor data collection, backend processing, and a frontend dashboard. It encompasses Arduino firmware for sensor interfacing, a Python-based backend for data management and MQTT communication, a KiCad design for custom hardware, and a TypeScript/Next.js frontend for data visualization and user interaction.

## Key Features & Benefits

- **Multi-Sensor Integration:** Supports various sensors including temperature, humidity, soil moisture, CO2, and light.
- **LoRaWAN Connectivity:** Utilizes LoRaWAN for long-range, low-power data transmission.
- **Data Processing & Storage:** Employs a Python backend with SQLite database for data ingestion, processing, and storage.
- **Real-time Data Visualization:** Provides a user-friendly dashboard built with Next.js to monitor sensor data in real-time.
- **Custom Hardware Design:** Includes KiCad files for building custom PCB hardware.
- **Containerized Deployment:** Docker support for backend and frontend simplifies deployment and ensures consistency.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

- **Arduino IDE:** For flashing the Arduino firmware.
- **Python 3.11:** For running the backend server and related scripts.
- **Node.js and npm:** For building and running the frontend application.
- **Docker and Docker Compose:** For containerized deployment.
- **KiCad:** For viewing and editing the hardware design files.

**Specific Python Dependencies (Backend):**

- `fastapi`
- `uvicorn`
- `paho-mqtt`
- `sqlite3`
- `python-dotenv`

Install them using:

```bash
pip install -r backend/requirements.txt
```

**Specific Node.js Dependencies (Frontend):**

Refer to `frontend/package.json` for a complete list.  Install them using:

```bash
cd frontend
npm install
```

## Installation & Setup Instructions

Follow these steps to set up and run the project:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Pythagore-byte/projet_iot.git
   cd projet_iot
   ```

2. **Arduino Firmware (Arduino_TTN):**

   - Open `Arduino_TTN/Arduino_TTN.ino` in the Arduino IDE.
   - Configure the necessary libraries and board settings for your specific hardware.
   - Modify the LoRaWAN credentials and sensor configurations as needed.
   - Upload the firmware to your Arduino device.

3. **Backend Setup:**

   - Navigate to the `backend` directory:

     ```bash
     cd backend
     ```

   -  Set up environment variables if needed (e.g., for production). Consider using `.env` file and `python-dotenv`.

   -  Initialize the database (if not already present):
      - Development Database:
        ```bash
        python dev_db_generator.py
        ```
      - Production Database:
        ```bash
        python prod_db_generator.py
        ```
      - Or use the provided `db.db` file.

   - Run the backend server:

     ```bash
     python server.py
     ```

     Alternatively, for Docker deployment, see step 5.

4. **Frontend Setup:**

   - Navigate to the `frontend` directory:

     ```bash
     cd ../frontend
     ```

   - Install the dependencies:

     ```bash
     npm install
     ```

   - Configure API endpoint in `frontend/lib/api.ts` to point to your backend server.

   - Run the development server:

     ```bash
     npm run dev
     ```

     This will start the frontend application, typically on `http://localhost:3000`.

5. **Docker Compose Deployment:**

   - From the project root directory, run:

     ```bash
     docker-compose up --build
     ```

   - This will build and start both the backend and frontend containers. Access the frontend through the port defined in the `docker-compose.yml` file (usually `http://localhost:3000`).

6. **KiCad Files (KICAD_FILES):**

   - Open the `.kicad_pcb` and `.kicad_sch` files in KiCad to view and modify the hardware design.

## Usage Examples & API Documentation

### Backend API (Example):

The backend provides a REST API for accessing sensor data.  Example endpoints:

- `GET /data`: Returns all sensor data.
- `GET /data/{device_id}`: Returns data for a specific device ID.

Refer to `backend/server.py` for detailed API route definitions.

### Frontend Usage:

The frontend provides a user interface for visualizing sensor data. Navigate to the appropriate page in your browser to see the collected data and related analysis. The routes `/soil-data`, `/temperature-humidity` and `/plant-suitability` will show the corresponding information.

## Configuration Options

### Backend Configuration:

- **Database Path:** The path to the SQLite database can be configured in `backend/server.py`.
- **MQTT Configuration:** The MQTT broker address, port, app ID, device ID and access key can be configured in `backend/mqtt_adder.py`.
- **Port:** The backend server port can be configured via the `--port` flag when starting the server (e.g., `uvicorn server:app --host 0.0.0.0 --port 8000`).

### Frontend Configuration:

- **API Endpoint:** The backend API endpoint URL should be defined in `frontend/lib/api.ts`.
- **Environment Variables:** Use environment variables in `next.config.js` to configure aspects of frontend deployment.

## Contributing Guidelines

We welcome contributions to this project! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Implement your changes.
4. Submit a pull request with a clear description of your changes.
5. Ensure code follows style conventions and has proper documentation.

## License Information

This project has no specific license specified. All rights are reserved by the owner.

## Acknowledgments

- This project utilizes open-source libraries and tools. We thank the developers and maintainers of these resources.