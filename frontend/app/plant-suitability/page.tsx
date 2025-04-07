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

interface PlantSuitabilityData {
  co2: Measurement[];
  luminosity: Measurement[];
  pressure: Measurement[];
}

type GraphType = "co2" | "luminosity" | "pressure" | null;
type TimeRange = "1h" | "6h" | "12h" | "24h" | "3d" | "7d" | "all";

async function getMeasurements() {
  const co2Response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/co2`);
  const luminosityResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/luminosity`
  );
  const pressureResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/pressure`
  );

  return {
    co2: co2Response.data.co2,
    luminosity: luminosityResponse.data.luminosity,
    pressure: pressureResponse.data.pressure,
  };
}

export default function PlantSuitabilityPage() {
  const [data, setData] = useState<PlantSuitabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"co2" | "luminosity" | "pressure">(
    "co2"
  );
  const [maximizedGraph, setMaximizedGraph] = useState<GraphType>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("all");

  // For custom zoom with mouse
  const [co2ZoomData, setCo2ZoomData] = useState<Measurement[] | null>(null);
  const [luminosityZoomData, setLuminosityZoomData] = useState<
    Measurement[] | null
  >(null);
  const [pressureZoomData, setPressureZoomData] = useState<
    Measurement[] | null
  >(null);

  const [co2RefAreaLeft, setCo2RefAreaLeft] = useState("");
  const [co2RefAreaRight, setCo2RefAreaRight] = useState("");
  const [luminosityRefAreaLeft, setLuminosityRefAreaLeft] = useState("");
  const [luminosityRefAreaRight, setLuminosityRefAreaRight] = useState("");
  const [pressureRefAreaLeft, setPressureRefAreaLeft] = useState("");
  const [pressureRefAreaRight, setPressureRefAreaRight] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const data = await getMeasurements();
      setData(data);

      // Reset zoom data on refresh
      setCo2ZoomData(null);
      setLuminosityZoomData(null);
      setPressureZoomData(null);
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
      co2: data.co2.filter((m) => new Date(m.recorded_at) >= startTime),
      luminosity: data.luminosity.filter(
        (m) => new Date(m.recorded_at) >= startTime
      ),
      pressure: data.pressure.filter(
        (m) => new Date(m.recorded_at) >= startTime
      ),
    };
  }, [data, selectedTimeRange]);

  // Zoom handlers
  const handleMouseDown = (e: any, sensor: GraphType) => {
    if (!e) return;

    if (sensor === "co2") setCo2RefAreaLeft(e.activeLabel);
    else if (sensor === "luminosity") setLuminosityRefAreaLeft(e.activeLabel);
    else if (sensor === "pressure") setPressureRefAreaLeft(e.activeLabel);
  };

  const handleMouseMove = (e: any, sensor: GraphType) => {
    if (!e) return;

    if (sensor === "co2" && co2RefAreaLeft) {
      setCo2RefAreaRight(e.activeLabel);
    } else if (sensor === "luminosity" && luminosityRefAreaLeft) {
      setLuminosityRefAreaRight(e.activeLabel);
    } else if (sensor === "pressure" && pressureRefAreaLeft) {
      setPressureRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = (sensor: GraphType) => {
    if (sensor === "co2") {
      if (!co2RefAreaLeft || !co2RefAreaRight || !data?.co2) {
        setCo2RefAreaLeft("");
        setCo2RefAreaRight("");
        return;
      }

      // Ensure left is before right
      let refLeft = co2RefAreaLeft;
      let refRight = co2RefAreaRight;

      if (new Date(refLeft).getTime() > new Date(refRight).getTime()) {
        [refLeft, refRight] = [refRight, refLeft];
      }

      // Filter data based on selected range
      const zoomedData = data.co2.filter(
        (item) =>
          new Date(item.recorded_at) >= new Date(refLeft) &&
          new Date(item.recorded_at) <= new Date(refRight)
      );

      if (zoomedData.length > 0) {
        setCo2ZoomData(zoomedData);
      }

      setCo2RefAreaLeft("");
      setCo2RefAreaRight("");
    } else if (sensor === "luminosity") {
      if (
        !luminosityRefAreaLeft ||
        !luminosityRefAreaRight ||
        !data?.luminosity
      ) {
        setLuminosityRefAreaLeft("");
        setLuminosityRefAreaRight("");
        return;
      }

      let refLeft = luminosityRefAreaLeft;
      let refRight = luminosityRefAreaRight;

      if (new Date(refLeft).getTime() > new Date(refRight).getTime()) {
        [refLeft, refRight] = [refRight, refLeft];
      }

      const zoomedData = data.luminosity.filter(
        (item) =>
          new Date(item.recorded_at) >= new Date(refLeft) &&
          new Date(item.recorded_at) <= new Date(refRight)
      );

      if (zoomedData.length > 0) {
        setLuminosityZoomData(zoomedData);
      }

      setLuminosityRefAreaLeft("");
      setLuminosityRefAreaRight("");
    } else if (sensor === "pressure") {
      if (!pressureRefAreaLeft || !pressureRefAreaRight || !data?.pressure) {
        setPressureRefAreaLeft("");
        setPressureRefAreaRight("");
        return;
      }

      let refLeft = pressureRefAreaLeft;
      let refRight = pressureRefAreaRight;

      if (new Date(refLeft).getTime() > new Date(refRight).getTime()) {
        [refLeft, refRight] = [refRight, refLeft];
      }

      const zoomedData = data.pressure.filter(
        (item) =>
          new Date(item.recorded_at) >= new Date(refLeft) &&
          new Date(item.recorded_at) <= new Date(refRight)
      );

      if (zoomedData.length > 0) {
        setPressureZoomData(zoomedData);
      }

      setPressureRefAreaLeft("");
      setPressureRefAreaRight("");
    }
  };

  const resetZoom = (sensor: GraphType) => {
    if (sensor === "co2") setCo2ZoomData(null);
    else if (sensor === "luminosity") setLuminosityZoomData(null);
    else if (sensor === "pressure") setPressureZoomData(null);
  };

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
  const latestCO2 = data?.co2[data.co2.length - 1]?.value ?? 0;
  const latestLuminosity =
    data?.luminosity[data.luminosity.length - 1]?.value ?? 0;
  const latestPressure = data?.pressure[data.pressure.length - 1]?.value ?? 0;

  // Normalize values for gauge charts
  const co2Percentage = Math.min(latestCO2 / 2000, 1); // Assuming 2000 ppm is max
  const luminosityPercentage = Math.min(latestLuminosity / 1000, 1); // Assuming 1000 lux is max
  const pressurePercentage = (latestPressure - 900) / 200; // Assuming range 900-1100 hPa

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "1h", label: "Last Hour" },
    { value: "6h", label: "6 Hours" },
    { value: "12h", label: "12 Hours" },
    { value: "24h", label: "Last Day" },
    { value: "3d", label: "3 Days" },
    { value: "7d", label: "Last Week" },
    { value: "all", label: "All Data" },
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7da06c] to-[#90A955] bg-clip-text text-transparent">
          Plant Suitability Monitor
        </h1>
        <div className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          Last updated:{" "}
          {data?.co2[data.co2.length - 1]?.recorded_at
            ? new Date(
                data.co2[data.co2.length - 1].recorded_at
              ).toLocaleString()
            : "N/A"}
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
                  setCo2ZoomData(null);
                  setLuminosityZoomData(null);
                  setPressureZoomData(null);
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

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#7da06c]">
            CO2 Level
          </h2>
          <div className="flex justify-center">
            <div className="w-[200px]">
              <GaugeChart
                id="co2-gauge"
                nrOfLevels={20}
                percent={co2Percentage}
                colors={["#7da06c", "#ffc86b", "#ff8e8e"]}
                formatTextValue={() => `${latestCO2} ppm`}
                textColor="#000000"
              />
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#7da06c]">
            Luminosity
          </h2>
          <div className="flex justify-center">
            <div className="w-[200px]">
              <GaugeChart
                id="luminosity-gauge"
                nrOfLevels={20}
                percent={luminosityPercentage}
                colors={["#ff8e8e", "#ffc86b", "#7da06c"]}
                formatTextValue={() => `${latestLuminosity} lux`}
                textColor="#000000"
              />
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#7da06c]">
            Atmospheric Pressure
          </h2>
          <div className="flex justify-center">
            <div className="w-[200px]">
              <GaugeChart
                id="pressure-gauge"
                nrOfLevels={20}
                percent={pressurePercentage}
                colors={["#ff8e8e", "#ffc86b", "#7da06c"]}
                formatTextValue={() => `${latestPressure} hPa`}
                textColor="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#7da06c]">
              CO2 History
            </h2>
            <div className="flex items-center gap-2">
              {co2ZoomData && (
                <button
                  onClick={() => resetZoom("co2")}
                  className="p-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Reset zoom"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setMaximizedGraph("co2")}
                className="p-1 rounded hover:bg-gray-100"
                title="Maximize graph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
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
                data={co2ZoomData || displayData?.co2}
                onMouseDown={(e) => handleMouseDown(e, "co2")}
                onMouseMove={(e) => handleMouseMove(e, "co2")}
                onMouseUp={() => handleMouseUp("co2")}
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
                <YAxis domain={[0, "auto"]} unit=" ppm" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value} ppm`, "CO2"]}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7da06c"
                  dot={false}
                />
                {co2RefAreaLeft && co2RefAreaRight ? (
                  <ReferenceArea
                    x1={co2RefAreaLeft}
                    x2={co2RefAreaRight}
                    strokeOpacity={0.3}
                    fill="#7da06c"
                    fillOpacity={0.3}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#7da06c]">
              Luminosity History
            </h2>
            <div className="flex items-center gap-2">
              {luminosityZoomData && (
                <button
                  onClick={() => resetZoom("luminosity")}
                  className="p-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Reset zoom"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setMaximizedGraph("luminosity")}
                className="p-1 rounded hover:bg-gray-100"
                title="Maximize graph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
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
                data={luminosityZoomData || displayData?.luminosity}
                onMouseDown={(e) => handleMouseDown(e, "luminosity")}
                onMouseMove={(e) => handleMouseMove(e, "luminosity")}
                onMouseUp={() => handleMouseUp("luminosity")}
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
                <YAxis domain={[0, "auto"]} unit=" lux" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value} lux`, "Luminosity"]}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ffc86b"
                  dot={false}
                />
                {luminosityRefAreaLeft && luminosityRefAreaRight ? (
                  <ReferenceArea
                    x1={luminosityRefAreaLeft}
                    x2={luminosityRefAreaRight}
                    strokeOpacity={0.3}
                    fill="#ffc86b"
                    fillOpacity={0.3}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#7da06c]">
              Pressure History
            </h2>
            <div className="flex items-center gap-2">
              {pressureZoomData && (
                <button
                  onClick={() => resetZoom("pressure")}
                  className="p-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Reset zoom"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setMaximizedGraph("pressure")}
                className="p-1 rounded hover:bg-gray-100"
                title="Maximize graph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
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
                data={pressureZoomData || displayData?.pressure}
                onMouseDown={(e) => handleMouseDown(e, "pressure")}
                onMouseMove={(e) => handleMouseMove(e, "pressure")}
                onMouseUp={() => handleMouseUp("pressure")}
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
                <YAxis domain={["auto", "auto"]} unit=" hPa" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value} hPa`, "Pressure"]}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f0a67d"
                  dot={false}
                />
                {pressureRefAreaLeft && pressureRefAreaRight ? (
                  <ReferenceArea
                    x1={pressureRefAreaLeft}
                    x2={pressureRefAreaRight}
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
              activeTab === "co2"
                ? "border-b-2 border-[#7da06c] text-[#7da06c]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("co2")}
          >
            CO2 Measurements
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "luminosity"
                ? "border-b-2 border-[#7da06c] text-[#7da06c]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("luminosity")}
          >
            Luminosity Measurements
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "pressure"
                ? "border-b-2 border-[#7da06c] text-[#7da06c]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pressure")}
          >
            Pressure Measurements
          </button>
        </div>

        {activeTab === "co2" && (
          <MeasurementTable
            data={displayData?.co2 || []}
            unit=" ppm"
            type="CO2 Level"
            headerColor="#7da06c"
          />
        )}

        {activeTab === "luminosity" && (
          <MeasurementTable
            data={displayData?.luminosity || []}
            unit=" lux"
            type="Luminosity"
            headerColor="#ffc86b"
          />
        )}

        {activeTab === "pressure" && (
          <MeasurementTable
            data={displayData?.pressure || []}
            unit=" hPa"
            type="Pressure"
            headerColor="#f0a67d"
          />
        )}
      </div>

      {/* Maximized Graph Modal */}
      {maximizedGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-[#7da06c]">
                {maximizedGraph === "co2"
                  ? "CO2"
                  : maximizedGraph === "luminosity"
                  ? "Luminosity"
                  : "Pressure"}{" "}
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
                            setCo2ZoomData(null);
                            setLuminosityZoomData(null);
                            setPressureZoomData(null);
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
                  {((maximizedGraph === "co2" && co2ZoomData) ||
                    (maximizedGraph === "luminosity" && luminosityZoomData) ||
                    (maximizedGraph === "pressure" && pressureZoomData)) && (
                    <button
                      onClick={() => resetZoom(maximizedGraph)}
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
                    maximizedGraph === "co2"
                      ? co2ZoomData || displayData?.co2
                      : maximizedGraph === "luminosity"
                      ? luminosityZoomData || displayData?.luminosity
                      : pressureZoomData || displayData?.pressure
                  }
                  margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
                  onMouseDown={(e) => handleMouseDown(e, maximizedGraph)}
                  onMouseMove={(e) => handleMouseMove(e, maximizedGraph)}
                  onMouseUp={() => handleMouseUp(maximizedGraph)}
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
                      maximizedGraph === "pressure"
                        ? ["auto", "auto"]
                        : [0, "auto"]
                    }
                    unit={
                      maximizedGraph === "co2"
                        ? " ppm"
                        : maximizedGraph === "luminosity"
                        ? " lux"
                        : " hPa"
                    }
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [
                      `${value}${
                        maximizedGraph === "co2"
                          ? " ppm"
                          : maximizedGraph === "luminosity"
                          ? " lux"
                          : " hPa"
                      }`,
                      maximizedGraph === "co2"
                        ? "CO2"
                        : maximizedGraph === "luminosity"
                        ? "Luminosity"
                        : "Pressure",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      maximizedGraph === "co2"
                        ? "#7da06c"
                        : maximizedGraph === "luminosity"
                        ? "#ffc86b"
                        : "#f0a67d"
                    }
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  {maximizedGraph === "co2" &&
                  co2RefAreaLeft &&
                  co2RefAreaRight ? (
                    <ReferenceArea
                      x1={co2RefAreaLeft}
                      x2={co2RefAreaRight}
                      strokeOpacity={0.3}
                      fill="#7da06c"
                      fillOpacity={0.3}
                    />
                  ) : null}
                  {maximizedGraph === "luminosity" &&
                  luminosityRefAreaLeft &&
                  luminosityRefAreaRight ? (
                    <ReferenceArea
                      x1={luminosityRefAreaLeft}
                      x2={luminosityRefAreaRight}
                      strokeOpacity={0.3}
                      fill="#ffc86b"
                      fillOpacity={0.3}
                    />
                  ) : null}
                  {maximizedGraph === "pressure" &&
                  pressureRefAreaLeft &&
                  pressureRefAreaRight ? (
                    <ReferenceArea
                      x1={pressureRefAreaLeft}
                      x2={pressureRefAreaRight}
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
