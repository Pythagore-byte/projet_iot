"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import GaugeChart from "react-gauge-chart";

interface Measurement {
  value: number;
  recorded_at: string;
}

interface MeasurementData {
  temperature: Measurement[];
  humidity: Measurement[];
}

type GraphType = "temperature" | "humidity" | null;

type TimeRange = "1h" | "6h" | "12h" | "24h" | "3d" | "7d" | "all";

async function getMeasurements() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/temperatures-humidity`
  );
  return res.data;
}

export default function TemperatureHumidityPage() {
  const [data, setData] = useState<MeasurementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity">(
    "temperature"
  );
  const [maximizedGraph, setMaximizedGraph] = useState<GraphType>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("all");

  // For custom zoom with mouse
  const [tempRefAreaLeft, setTempRefAreaLeft] = useState("");
  const [tempRefAreaRight, setTempRefAreaRight] = useState("");
  const [humidRefAreaLeft, setHumidRefAreaLeft] = useState("");
  const [humidRefAreaRight, setHumidRefAreaRight] = useState("");
  const [tempZoomData, setTempZoomData] = useState<Measurement[] | null>(null);
  const [humidZoomData, setHumidZoomData] = useState<Measurement[] | null>(
    null
  );

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const data = await getMeasurements();
      setData(data);
      setTempZoomData(null); // Reset zoom on data refresh
      setHumidZoomData(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!data) return null;

    const now = new Date();
    let startTime: Date;

    switch (selectedTimeRange) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "12h":
        startTime = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "3d":
        startTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    return {
      temperature: data.temperature.filter(
        (m) => new Date(m.recorded_at) >= startTime
      ),
      humidity: data.humidity.filter(
        (m) => new Date(m.recorded_at) >= startTime
      ),
    };
  }, [data, selectedTimeRange]);

  // Handlers for custom zoom with mouse
  const handleTempMouseDown = (e: any) => {
    if (!e) return;
    setTempRefAreaLeft(e.activeLabel);
  };

  const handleTempMouseMove = (e: any) => {
    if (!e || !tempRefAreaLeft) return;
    setTempRefAreaRight(e.activeLabel);
  };

  const handleTempMouseUp = () => {
    if (!tempRefAreaLeft || !tempRefAreaRight || !data?.temperature) {
      setTempRefAreaLeft("");
      setTempRefAreaRight("");
      return;
    }

    // Ensure left is before right
    let refLeft = tempRefAreaLeft;
    let refRight = tempRefAreaRight;

    if (new Date(refLeft).getTime() > new Date(refRight).getTime()) {
      [refLeft, refRight] = [refRight, refLeft];
    }

    // Filter data based on selected range
    const zoomedData = data.temperature.filter(
      (item) =>
        new Date(item.recorded_at) >= new Date(refLeft) &&
        new Date(item.recorded_at) <= new Date(refRight)
    );

    if (zoomedData.length > 0) {
      setTempZoomData(zoomedData);
    }

    setTempRefAreaLeft("");
    setTempRefAreaRight("");
  };

  const handleHumidMouseDown = (e: any) => {
    if (!e) return;
    setHumidRefAreaLeft(e.activeLabel);
  };

  const handleHumidMouseMove = (e: any) => {
    if (!e || !humidRefAreaLeft) return;
    setHumidRefAreaRight(e.activeLabel);
  };

  const handleHumidMouseUp = () => {
    if (!humidRefAreaLeft || !humidRefAreaRight || !data?.humidity) {
      setHumidRefAreaLeft("");
      setHumidRefAreaRight("");
      return;
    }

    // Ensure left is before right
    let refLeft = humidRefAreaLeft;
    let refRight = humidRefAreaRight;

    if (new Date(refLeft).getTime() > new Date(refRight).getTime()) {
      [refLeft, refRight] = [refRight, refLeft];
    }

    // Filter data based on selected range
    const zoomedData = data.humidity.filter(
      (item) =>
        new Date(item.recorded_at) >= new Date(refLeft) &&
        new Date(item.recorded_at) <= new Date(refRight)
    );

    if (zoomedData.length > 0) {
      setHumidZoomData(zoomedData);
    }

    setHumidRefAreaLeft("");
    setHumidRefAreaRight("");
  };

  const resetTempZoom = () => {
    setTempZoomData(null);
  };

  const resetHumidZoom = () => {
    setHumidZoomData(null);
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "1h", label: "Last Hour" },
    { value: "6h", label: "6 Hours" },
    { value: "12h", label: "12 Hours" },
    { value: "24h", label: "Last Day" },
    { value: "3d", label: "3 Days" },
    { value: "7d", label: "Last Week" },
    { value: "all", label: "All Data" },
  ];

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayData = selectedTimeRange === "all" ? data : filteredData;
  const latestTemperature =
    data?.temperature[data.temperature.length - 1]?.value ?? 0;
  const latestHumidity = data?.humidity[data.humidity.length - 1]?.value ?? 0;

  const tempPercentage = (latestTemperature + 10) / 60;
  const humidityPercentage = latestHumidity / 100;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#7da06c]">
        Temperature & Humidity Monitor
      </h1>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#ffc86b]">
            Current Temperature
          </h2>
          <div className="flex justify-center">
            <div className="w-[300px]">
              <GaugeChart
                id="temp-gauge"
                nrOfLevels={20}
                percent={tempPercentage}
                colors={["#7da06c", "#ffc86b", "#ff8e8e"]}
                formatTextValue={() => `${latestTemperature}°C`}
                textColor="#000000"
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#f0a67d]">
            Current Humidity
          </h2>
          <div className="flex justify-center">
            <div className="w-[300px]">
              <GaugeChart
                id="humidity-gauge"
                nrOfLevels={20}
                percent={humidityPercentage}
                colors={["#7da06c", "#ffc86b", "#ff8e8e"]}
                formatTextValue={() => `${latestHumidity}%`}
                textColor="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector - Updated to be horizontally scrollable on mobile */}
      <div className="flex flex-wrap items-center mb-6">
        <span className="text-sm text-gray-500 mr-2 whitespace-nowrap">
          Display range:
        </span>
        <div className="overflow-x-auto pb-2 flex-1 scrollbar-hide">
          <div className="flex gap-2 min-w-min">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedTimeRange(option.value);
                  setTempZoomData(null);
                  setHumidZoomData(null);
                }}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap flex-shrink-0 ${
                  selectedTimeRange === option.value
                    ? "bg-[#7da06c] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#7da06c]">
              Temperature History
            </h2>
            <div className="flex items-center gap-2">
              {tempZoomData && (
                <button
                  onClick={resetTempZoom}
                  className="p-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Reset zoom"
                >
                  Reset zoom
                </button>
              )}
              <button
                onClick={() => setMaximizedGraph("temperature")}
                className="p-1 rounded hover:bg-gray-100"
                title="Maximize graph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#ffc86b]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Drag horizontally on the graph to zoom in on a specific time period
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={tempZoomData || displayData?.temperature}
                onMouseDown={handleTempMouseDown}
                onMouseMove={handleTempMouseMove}
                onMouseUp={handleTempMouseUp}
              >
                <XAxis
                  dataKey="recorded_at"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${
                      date.getMonth() + 1
                    } ${date.getHours()}:${String(date.getMinutes()).padStart(
                      2,
                      "0"
                    )}`;
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis domain={[-10, 50]} unit="°C" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value}°C`, "Temperature"]}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ffc86b"
                  dot={false}
                />
                {tempRefAreaLeft && tempRefAreaRight ? (
                  <ReferenceArea
                    x1={tempRefAreaLeft}
                    x2={tempRefAreaRight}
                    strokeOpacity={0.3}
                    fill="#ffc86b"
                    fillOpacity={0.3}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#7da06c]">
              Humidity History
            </h2>
            <div className="flex items-center gap-2">
              {humidZoomData && (
                <button
                  onClick={resetHumidZoom}
                  className="p-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Reset zoom"
                >
                  Reset zoom
                </button>
              )}
              <button
                onClick={() => setMaximizedGraph("humidity")}
                className="p-1 rounded hover:bg-gray-100"
                title="Maximize graph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#f0a67d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Drag horizontally on the graph to zoom in on a specific time period
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={humidZoomData || displayData?.humidity}
                onMouseDown={handleHumidMouseDown}
                onMouseMove={handleHumidMouseMove}
                onMouseUp={handleHumidMouseUp}
              >
                <XAxis
                  dataKey="recorded_at"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${
                      date.getMonth() + 1
                    } ${date.getHours()}:${String(date.getMinutes()).padStart(
                      2,
                      "0"
                    )}`;
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value}%`, "Humidity"]}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f0a67d"
                  dot={false}
                />
                {humidRefAreaLeft && humidRefAreaRight ? (
                  <ReferenceArea
                    x1={humidRefAreaLeft}
                    x2={humidRefAreaRight}
                    strokeOpacity={0.3}
                    fill="#f0a67d"
                    fillOpacity={0.3}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabbed Tables */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "temperature"
                ? "text-[#ffc86b] border-b-2 border-[#ffc86b]"
                : "text-gray-500 hover:text-[#ffc86b]"
            }`}
            onClick={() => setActiveTab("temperature")}
          >
            Temperature Records
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "humidity"
                ? "text-[#f0a67d] border-b-2 border-[#f0a67d]"
                : "text-gray-500 hover:text-[#f0a67d]"
            }`}
            onClick={() => setActiveTab("humidity")}
          >
            Humidity Records
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === "temperature" && (
            <MeasurementTable
              data={displayData?.temperature ?? []}
              unit="°C"
              type="Temperature"
              headerColor="#ffc86b"
            />
          )}
          {activeTab === "humidity" && (
            <MeasurementTable
              data={displayData?.humidity ?? []}
              unit="%"
              type="Humidity"
              headerColor="#f0a67d"
            />
          )}
        </div>
      </div>

      {/* Maximized Graph Modal */}
      {maximizedGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2
                className="text-xl font-bold"
                style={{
                  color:
                    maximizedGraph === "temperature" ? "#ffc86b" : "#f0a67d",
                }}
              >
                {maximizedGraph === "temperature" ? "Temperature" : "Humidity"}{" "}
                History
              </h2>
              <button
                onClick={() => setMaximizedGraph(null)}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Time range controls - Made horizontally scrollable for mobile */}
            <div className="p-4 pb-0 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    Display range:
                  </span>
                  <div className="overflow-x-auto scrollbar-hide flex-1">
                    <div className="flex gap-2 min-w-min">
                      {timeRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedTimeRange(option.value);
                            setTempZoomData(null);
                            setHumidZoomData(null);
                          }}
                          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap flex-shrink-0 ${
                            selectedTimeRange === option.value
                              ? "bg-[#7da06c] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex ml-auto">
                  {maximizedGraph === "temperature" && tempZoomData && (
                    <button
                      onClick={resetTempZoom}
                      className="p-1 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 flex-shrink-0"
                    >
                      Reset zoom
                    </button>
                  )}
                  {maximizedGraph === "humidity" && humidZoomData && (
                    <button
                      onClick={resetHumidZoom}
                      className="p-1 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 flex-shrink-0"
                    >
                      Reset zoom
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-grow p-4">
              <div className="text-sm text-gray-500 mb-2">
                Drag horizontally on the graph to zoom in on a specific time
                period
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart
                  data={
                    maximizedGraph === "temperature"
                      ? tempZoomData || displayData?.temperature
                      : humidZoomData || displayData?.humidity
                  }
                  margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
                  onMouseDown={
                    maximizedGraph === "temperature"
                      ? handleTempMouseDown
                      : handleHumidMouseDown
                  }
                  onMouseMove={
                    maximizedGraph === "temperature"
                      ? handleTempMouseMove
                      : handleHumidMouseMove
                  }
                  onMouseUp={
                    maximizedGraph === "temperature"
                      ? handleTempMouseUp
                      : handleHumidMouseUp
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="recorded_at"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${
                        date.getMonth() + 1
                      } ${date.getHours()}:${String(date.getMinutes()).padStart(
                        2,
                        "0"
                      )}`;
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    domain={
                      maximizedGraph === "temperature" ? [-10, 50] : [0, 100]
                    }
                    unit={maximizedGraph === "temperature" ? "°C" : "%"}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [
                      `${value}${
                        maximizedGraph === "temperature" ? "°C" : "%"
                      }`,
                      maximizedGraph === "temperature"
                        ? "Temperature"
                        : "Humidity",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      maximizedGraph === "temperature" ? "#ffc86b" : "#f0a67d"
                    }
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  {maximizedGraph === "temperature" &&
                  tempRefAreaLeft &&
                  tempRefAreaRight ? (
                    <ReferenceArea
                      x1={tempRefAreaLeft}
                      x2={tempRefAreaRight}
                      strokeOpacity={0.3}
                      fill="#ffc86b"
                      fillOpacity={0.3}
                    />
                  ) : null}
                  {maximizedGraph === "humidity" &&
                  humidRefAreaLeft &&
                  humidRefAreaRight ? (
                    <ReferenceArea
                      x1={humidRefAreaLeft}
                      x2={humidRefAreaRight}
                      strokeOpacity={0.3}
                      fill="#f0a67d"
                      fillOpacity={0.3}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeasurementTable({
  data,
  unit,
  type,
  headerColor,
}: {
  data: Measurement[];
  unit: string;
  type: string;
  headerColor: string;
}) {
  return (
    <div className="rounded-md overflow-x-auto">
      <table className="w-full min-w-[400px] table-fixed">
        <thead>
          <tr
            className="border-b"
            style={{ backgroundColor: `${headerColor}15` }}
          >
            <th className="p-3 text-left" style={{ color: headerColor }}>
              {type}
            </th>
            <th
              className="p-3 text-left w-[200px]"
              style={{ color: headerColor }}
            >
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {data
            .slice()
            .reverse()
            .map((measurement, index) => (
              <tr key={index} className="border-b">
                <td className="p-3 whitespace-nowrap">
                  {measurement.value}
                  {unit}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {new Date(measurement.recorded_at).toLocaleString()}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
