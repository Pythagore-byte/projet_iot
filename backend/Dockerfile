# Use a lightweight Python image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy backend files
COPY server.py mqtt_adder.py db.db requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the FastAPI port
EXPOSE 8000

# Run both the FastAPI server and MQTT script
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port 8000 & python mqtt_adder.py"]
