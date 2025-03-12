"use client";

import { useState, useEffect } from "react";
import { Sun, Cloud, Droplet, Battery } from "lucide-react";
import { getWeatherData, getBatteryData } from "@/lib/api";

export function Header() {
  const [weather, setWeather] = useState({
    temperature: 0,
    precipitation: 0,
    weatherDescription: "",
  });
  const [battery, setBattery] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch weather data
        const weatherData = await getWeatherData();
        setWeather({
          temperature: weatherData.temperature,
          precipitation: weatherData.precipitation * 100, // Convert to percentage
          weatherDescription: weatherData.weatherDescription,
        });

        // Fetch battery data
        const batteryData = await getBatteryData();
        if (batteryData) {
          setBattery(batteryData.value);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh data every 30 minutes
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to get weather icon based on description
  const getWeatherIcon = () => {
    const description = weather.weatherDescription.toLowerCase();
    if (
      description.includes("rain") ||
      description.includes("drizzle") ||
      description.includes("shower")
    ) {
      return <Droplet className="text-[#4a6741]" />;
    } else if (
      description.includes("cloud") ||
      description.includes("overcast") ||
      description.includes("fog")
    ) {
      return <Cloud className="text-[#8c7851]" />;
    } else {
      return <Sun className="text-[#e3b448]" />;
    }
  };

  // Function to get battery icon color based on level
  const getBatteryColor = () => {
    if (battery === null) return "text-gray-400";
    if (battery < 20) return "text-red-500";
    if (battery < 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center">
      <h2 className="text-2xl font-semibold text-[#4a6741] mb-4 md:mb-0">
        TerraTrack
      </h2>
      <div className="flex items-center space-x-4 bg-[#f9f7f3] p-2 rounded-lg">
        {loading ? (
          <div className="animate-pulse flex space-x-4 items-center">
            <div className="h-5 w-20 bg-slate-200 rounded"></div>
            <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
            <div className="h-5 w-20 bg-slate-200 rounded"></div>
          </div>
        ) : (
          <>
            {getWeatherIcon()}
            <span
              className="text-[#2c3e50] font-medium"
              title={weather.weatherDescription}
            >
              {weather.temperature.toFixed(1)}°C
            </span>
            <Droplet className="text-[#4a6741]" />
            <span className="text-[#2c3e50] font-medium">
              {weather.precipitation.toFixed(0)}% rain
            </span>
            <div className="border-l border-gray-300 h-6 mx-2"></div>
            <Battery className={getBatteryColor()} />
            <span className="text-[#2c3e50] font-medium">
              {battery !== null ? `${battery}%` : "N/A"}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
