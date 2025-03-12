"use client";

import { Widget } from "@/components/widget";
import {
  Thermometer,
  Sun,
  Droplet,
  Leaf,
  AlertTriangle,
  Battery,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getWeatherData, getBatteryData } from "@/lib/api";

// Define interfaces for our data
interface Measurement {
  value: number;
  recorded_at: string;
}

interface ErrorCount {
  total: number;
  active: number;
}

export default function Home() {
  // State for all our dashboard data
  const [tempHumidity, setTempHumidity] = useState<{
    temperature: number;
    humidity: number;
  } | null>(null);
  const [soilData, setSoilData] = useState<{
    humidity10: number;
    humidity20: number;
    humidity30: number;
    soilTemp: number;
  } | null>(null);
  const [plantData, setPlantData] = useState<{
    co2: number;
    luminosity: number;
    pressure: number;
  } | null>(null);
  const [errorCount, setErrorCount] = useState<ErrorCount>({
    total: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({ temperature: 0, precipitation: 0 });
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch temperature & humidity data
        const tempHumidityRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/temperatures-humidity`
        );
        if (tempHumidityRes.data) {
          const tempData = tempHumidityRes.data.temperature;
          const humidityData = tempHumidityRes.data.humidity;

          setTempHumidity({
            temperature: tempData[tempData.length - 1]?.value ?? 0,
            humidity: humidityData[humidityData.length - 1]?.value ?? 0,
          });
        }

        // Fetch soil data
        const soilHumidityRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/soil-humidity`
        );
        const soilTempRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/temperaturesol`
        );

        if (soilHumidityRes.data && soilTempRes.data) {
          const humidity10 = soilHumidityRes.data.humidity10;
          const humidity20 = soilHumidityRes.data.humidity20;
          const humidity30 = soilHumidityRes.data.humidity30;
          const soilTemp = soilTempRes.data.temperaturesol;

          setSoilData({
            humidity10: humidity10[humidity10.length - 1]?.value ?? 0,
            humidity20: humidity20[humidity20.length - 1]?.value ?? 0,
            humidity30: humidity30[humidity30.length - 1]?.value ?? 0,
            soilTemp: soilTemp[soilTemp.length - 1]?.value ?? 0,
          });
        }

        // Fetch plant suitability data
        const co2Res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/co2`
        );
        const luminosityRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/luminosity`
        );
        const pressureRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/pressure`
        );

        if (co2Res.data && luminosityRes.data && pressureRes.data) {
          const co2Data = co2Res.data.co2;
          const luminosityData = luminosityRes.data.luminosity;
          const pressureData = pressureRes.data.pressure;

          setPlantData({
            co2: co2Data[co2Data.length - 1]?.value ?? 0,
            luminosity: luminosityData[luminosityData.length - 1]?.value ?? 0,
            pressure: pressureData[pressureData.length - 1]?.value ?? 0,
          });
        }

        // Fetch error count
        const errorsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/errors`
        );
        if (errorsRes.data) {
          const activeErrors = errorsRes.data.filter(
            (error: any) => !error.handled
          ).length;
          setErrorCount({
            total: errorsRes.data.length,
            active: activeErrors,
          });
        }

        // Fetch weather data
        const weatherData = await getWeatherData();
        setWeather({
          temperature: weatherData.temperature,
          precipitation: weatherData.precipitation * 100, // Convert to percentage
        });

        // Fetch battery data
        const batteryData = await getBatteryData();
        if (batteryData) {
          setBattery(batteryData.value);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to determine widget status based on values
  const getTemperatureStatus = (temp: number) => {
    if (temp > 30 || temp < 5) return "critical";
    if (temp > 28 || temp < 10) return "warning";
    return "normal";
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity > 80 || humidity < 20) return "critical";
    if (humidity > 70 || humidity < 30) return "warning";
    return "normal";
  };

  const getSoilStatus = (humidity: number) => {
    if (humidity < 20) return "critical";
    if (humidity < 30) return "warning";
    return "normal";
  };

  const getCO2Status = (co2: number) => {
    if (co2 > 1500) return "critical";
    if (co2 > 1000) return "warning";
    return "normal";
  };

  const getErrorStatus = (active: number) => {
    if (active > 5) return "critical";
    if (active > 0) return "warning";
    return "normal";
  };

  const getBatteryStatus = (batteryLevel: number | null) => {
    if (batteryLevel === null) return "warning";
    if (batteryLevel < 20) return "critical";
    if (batteryLevel < 40) return "warning";
    return "normal";
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-xl h-40"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature Widget */}
        <Widget
          title="Air Temperature"
          status={
            tempHumidity
              ? getTemperatureStatus(tempHumidity.temperature)
              : "normal"
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Thermometer className="h-8 w-8 text-[#ffc86b] mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {tempHumidity?.temperature.toFixed(1)}°C
                </p>
                <p className="text-sm text-gray-500">Current air temperature</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Weather: {weather.temperature.toFixed(1)}°C
              </p>
              <p className="text-sm text-gray-500">
                {weather.precipitation.toFixed(0)}% rain chance
              </p>
            </div>
          </div>
        </Widget>

        {/* Humidity Widget */}
        <Widget
          title="Air Humidity"
          status={
            tempHumidity ? getHumidityStatus(tempHumidity.humidity) : "normal"
          }
        >
          <div className="flex items-center">
            <Droplet className="h-8 w-8 text-[#4a6741] mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {tempHumidity?.humidity.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">Current air humidity</p>
            </div>
          </div>
        </Widget>

        {/* Soil Moisture Widget */}
        <Widget
          title="Soil Moisture"
          status={soilData ? getSoilStatus(soilData.humidity10) : "normal"}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">10cm depth:</span>
              <span className="font-bold">
                {soilData?.humidity10.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">20cm depth:</span>
              <span className="font-bold">
                {soilData?.humidity20.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">30cm depth:</span>
              <span className="font-bold">
                {soilData?.humidity30.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Soil temperature:</span>
              <span className="font-bold">
                {soilData?.soilTemp.toFixed(1)}°C
              </span>
            </div>
          </div>
        </Widget>

        {/* Plant Suitability Widget */}
        <Widget
          title="Plant Environment"
          status={plantData ? getCO2Status(plantData.co2) : "normal"}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CO2 Level:</span>
              <span className="font-bold">{plantData?.co2.toFixed(0)} ppm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Light Level:</span>
              <span className="font-bold">
                {plantData?.luminosity.toFixed(0)} lux
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Air Pressure:</span>
              <span className="font-bold">
                {plantData?.pressure.toFixed(0)} hPa
              </span>
            </div>
          </div>
        </Widget>

        {/* Error Counter Widget */}
        <Widget
          title="System Status"
          status={getErrorStatus(errorCount.active)}
        >
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{errorCount.active}</p>
              <p className="text-sm text-gray-500">
                Active errors (Total: {errorCount.total})
              </p>
            </div>
          </div>
        </Widget>

        {/* Battery Status Widget */}
        <Widget title="Battery Status" status={getBatteryStatus(battery)}>
          <div className="flex items-center">
            <Battery className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {battery !== null ? `${battery}%` : "N/A"}
              </p>
              <p className="text-sm text-gray-500">Current battery level</p>
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );
}
