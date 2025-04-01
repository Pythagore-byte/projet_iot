"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getWeatherData, getBatteryData } from "@/lib/api";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Thermometer,
  Sun,
  Droplet,
  Leaf,
  AlertTriangle,
  Battery,
  ChevronRight,
  CloudRain,
  Ruler,
  Wind,
  Gauge,
  BatteryMedium,
  AlertCircle,
  Timer,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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
  const router = useRouter();
  // State for all our dashboard data
  const [tempHumidity, setTempHumidity] = useState<{
    temperature: number;
    humidity: number;
    lastUpdated: string | null;
  }>({ temperature: 0, humidity: 0, lastUpdated: null });

  const [soilData, setSoilData] = useState<{
    humidity10: number;
    humidity20: number;
    humidity30: number;
    soilTemp: number;
    lastUpdated: string | null;
  }>({
    humidity10: 0,
    humidity20: 0,
    humidity30: 0,
    soilTemp: 0,
    lastUpdated: null,
  });

  const [plantData, setPlantData] = useState<{
    co2: number;
    luminosity: number;
    pressure: number;
    lastUpdated: string | null;
  }>({ co2: 0, luminosity: 0, pressure: 0, lastUpdated: null });

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
            lastUpdated: tempData[tempData.length - 1]?.recorded_at ?? null,
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
            lastUpdated: humidity10[humidity10.length - 1]?.recorded_at ?? null,
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
            lastUpdated: co2Data[co2Data.length - 1]?.recorded_at ?? null,
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

  // Helper function to determine status based on values
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

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "normal":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-amber-500";
      case "normal":
        return "text-emerald-500";
      default:
        return "text-gray-400";
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      case "normal":
        return "bg-emerald-500";
      default:
        return "bg-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 h-8 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-40 shadow-sm animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Smart Farming Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-full shadow-sm border">
            <Timer size={16} className="text-gray-500" />
            <span className="text-gray-600">
              Last refresh: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Active Errors Alert */}
        {errorCount.active > 0 && (
          <div
            className={`mb-6 p-4 rounded-lg border ${getStatusColor(
              getErrorStatus(errorCount.active)
            )}`}
          >
            <div className="flex gap-3 items-center">
              <AlertCircle
                className={getIconColor(getErrorStatus(errorCount.active))}
              />
              <div className="flex-1">
                <h3 className="font-medium">Attention Required</h3>
                <p className="text-sm opacity-90">
                  {errorCount.active} active{" "}
                  {errorCount.active === 1 ? "issue" : "issues"} need your
                  attention
                </p>
              </div>
              <button
                className="px-3 py-1.5 rounded-md bg-white border text-sm font-medium shadow-sm hover:bg-gray-50"
                onClick={() => router.push("/errors")}
              >
                View Issues
              </button>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Climate Card */}
          <Card className="p-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/temperature-humidity"
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowUpRight size={16} className="text-gray-700" />
              </Link>
            </div>
            <div className="p-5 border-b">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Thermometer className="text-[#ffc86b]" size={20} />
                Climate Conditions
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Updated {formatTimeAgo(tempHumidity.lastUpdated)}
              </p>
            </div>
            <div className="px-5 py-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Air Temperature
                </div>
                <div
                  className={`text-2xl font-bold ${
                    getTemperatureStatus(tempHumidity.temperature) ===
                    "critical"
                      ? "text-red-600"
                      : getTemperatureStatus(tempHumidity.temperature) ===
                        "warning"
                      ? "text-amber-600"
                      : "text-gray-800"
                  }`}
                >
                  {tempHumidity.temperature.toFixed(1)}°C
                </div>
              </div>
              <div>
                <div className="text-right text-sm text-gray-500 mb-1">
                  Outside
                </div>
                <div className="text-right text-lg font-medium text-gray-600">
                  {weather.temperature.toFixed(1)}°C
                </div>
              </div>
            </div>
            <div className="px-5 py-4 flex justify-between items-center border-t">
              <div>
                <div className="text-sm text-gray-500 mb-1">Air Humidity</div>
                <div
                  className={`text-2xl font-bold ${
                    getHumidityStatus(tempHumidity.humidity) === "critical"
                      ? "text-red-600"
                      : getHumidityStatus(tempHumidity.humidity) === "warning"
                      ? "text-amber-600"
                      : "text-gray-800"
                  }`}
                >
                  {tempHumidity.humidity.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-right text-sm text-gray-500 mb-1">
                  Rain Chance
                </div>
                <div className="text-right flex gap-1 items-center justify-end">
                  <CloudRain size={16} className="text-blue-500" />
                  <span className="text-lg font-medium text-gray-600">
                    {weather.precipitation.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Soil Moisture Card */}
          <Card className="p-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/soil-data"
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowUpRight size={16} className="text-gray-700" />
              </Link>
            </div>
            <div className="p-5 border-b">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Droplet className="text-[#4a6741]" size={20} />
                Soil Conditions
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Updated {formatTimeAgo(soilData.lastUpdated)}
              </p>
            </div>
            <div className="px-5 py-4">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2 flex justify-between">
                  <span>Moisture at 10cm</span>
                  <span
                    className={`font-medium ${
                      getSoilStatus(soilData.humidity10) === "critical"
                        ? "text-red-600"
                        : getSoilStatus(soilData.humidity10) === "warning"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {soilData.humidity10.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressBarColor(
                      getSoilStatus(soilData.humidity10)
                    )}`}
                    style={{ width: `${soilData.humidity10}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">20cm Depth</div>
                  <div className="text-base font-medium">
                    {soilData.humidity20.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">30cm Depth</div>
                  <div className="text-base font-medium">
                    {soilData.humidity30.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Soil Temperature
                  </div>
                  <div className="text-base font-medium">
                    {soilData.soilTemp.toFixed(1)}°C
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Plant Environment Card */}
          <Card className="p-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/plant-suitability"
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowUpRight size={16} className="text-gray-700" />
              </Link>
            </div>
            <div className="p-5 border-b">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Leaf className="text-[#90A955]" size={20} />
                Plant Environment
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Updated {formatTimeAgo(plantData.lastUpdated)}
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      getCO2Status(plantData.co2) === "critical"
                        ? "bg-red-100"
                        : getCO2Status(plantData.co2) === "warning"
                        ? "bg-amber-100"
                        : "bg-green-100"
                    }`}
                  >
                    <Wind
                      size={16}
                      className={`${
                        getCO2Status(plantData.co2) === "critical"
                          ? "text-red-600"
                          : getCO2Status(plantData.co2) === "warning"
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    CO2 Level
                  </span>
                </div>
                <div className="text-base font-semibold">
                  {plantData.co2.toFixed(0)}{" "}
                  <span className="text-xs text-gray-500">ppm</span>{" "}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-100">
                    <Sun size={16} className="text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Light Level
                  </span>
                </div>
                <div className="text-base font-semibold">
                  {plantData.luminosity.toFixed(0)}{" "}
                  <span className="text-xs text-gray-500">lux</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100">
                    <Gauge size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Air Pressure
                  </span>
                </div>
                <div className="text-base font-semibold">
                  {plantData.pressure.toFixed(0)}{" "}
                  <span className="text-xs text-gray-500">hPa</span>
                </div>
              </div>
            </div>
          </Card>

          {/* System Status Card */}
          <Card className="p-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white col-span-1 md:col-span-2 lg:col-span-1">
            <div className="p-5 border-b">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <AlertTriangle className="text-yellow-500" size={20} />
                System Status
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <Link
                href="/errors"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-full ${
                      getErrorStatus(errorCount.active) === "critical"
                        ? "bg-red-100"
                        : getErrorStatus(errorCount.active) === "warning"
                        ? "bg-amber-100"
                        : "bg-green-100"
                    }`}
                  >
                    <AlertCircle
                      size={18}
                      className={`${
                        getErrorStatus(errorCount.active) === "critical"
                          ? "text-red-600"
                          : getErrorStatus(errorCount.active) === "warning"
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Active Errors
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: {errorCount.total}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold ${
                      getErrorStatus(errorCount.active) === "critical"
                        ? "text-red-600"
                        : getErrorStatus(errorCount.active) === "warning"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {errorCount.active}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-full ${
                      getBatteryStatus(battery) === "critical"
                        ? "bg-red-100"
                        : getBatteryStatus(battery) === "warning"
                        ? "bg-amber-100"
                        : "bg-green-100"
                    }`}
                  >
                    <BatteryMedium
                      size={18}
                      className={`${
                        getBatteryStatus(battery) === "critical"
                          ? "text-red-600"
                          : getBatteryStatus(battery) === "warning"
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Battery Status
                    </p>
                    <p className="text-xs text-gray-500">Sensor power</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold ${
                      getBatteryStatus(battery) === "critical"
                        ? "text-red-600"
                        : getBatteryStatus(battery) === "warning"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {battery !== null ? `${battery}%` : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Access Card */}
          <Card className="p-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white col-span-1 md:col-span-2 lg:col-span-2">
            <div className="p-5 border-b">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                Quick Access
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-2 gap-2">
              <Link
                href="/temperature-humidity"
                className="p-4 rounded-lg border hover:bg-gray-50 transition-colors flex flex-col gap-1 items-center justify-center text-center"
              >
                <Thermometer size={24} className="text-[#ffc86b] mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Temperature & Humidity
                </span>
                <span className="text-xs text-gray-500">
                  View detailed climate data
                </span>
              </Link>

              <Link
                href="/soil-data"
                className="p-4 rounded-lg border hover:bg-gray-50 transition-colors flex flex-col gap-1 items-center justify-center text-center"
              >
                <Droplet size={24} className="text-[#4a6741] mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Soil Moisture
                </span>
                <span className="text-xs text-gray-500">
                  Monitor soil conditions
                </span>
              </Link>

              <Link
                href="/plant-suitability"
                className="p-4 rounded-lg border hover:bg-gray-50 transition-colors flex flex-col gap-1 items-center justify-center text-center"
              >
                <Leaf size={24} className="text-[#90A955] mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Plant Environment
                </span>
                <span className="text-xs text-gray-500">
                  Check growth conditions
                </span>
              </Link>

              <Link
                href="/errors"
                className="p-4 rounded-lg border hover:bg-gray-50 transition-colors flex flex-col gap-1 items-center justify-center text-center"
              >
                <AlertTriangle size={24} className="text-yellow-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  System Errors
                </span>
                <span className="text-xs text-gray-500">
                  Manage active issues
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
