"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import SoilMoistureVisual from "@/components/SoilMoistureVisual";

interface Measurement {
  value: number;
  recorded_at: string;
}

interface SoilMoistureData {
  humidity10: Measurement[];
  humidity20: Measurement[];
  humidity30: Measurement[];
  temperaturesol?: Measurement[];
}

type GraphType = "10cm" | "20cm" | "30cm" | "soil-temp" | null;

async function getMeasurements() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/soil-humidity`
  );
  return res.data;
}

async function getTemperatureSol() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/temperaturesol`
  );
  return res.data;
}

export default function SoilMoisturePage() {
  const [data, setData] = useState<SoilMoistureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"10cm" | "20cm" | "30cm" | "temp">(
    "10cm"
  );
  const [maximizedGraph, setMaximizedGraph] = useState<GraphType>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const moistureData = await getMeasurements();
      const tempData = await getTemperatureSol();
      setData({
        ...moistureData,
        temperaturesol: tempData.temperaturesol,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate statistics
  const getStats = (measurements: Measurement[]) => {
    if (!measurements?.length) return { avg: 0, min: 0, max: 0 };
    const values = measurements.map((m) => m.value);
    return {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
    };
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

  const latest10cm = data?.humidity10[data.humidity10.length - 1]?.value ?? 0;
  const latest20cm = data?.humidity20[data.humidity20.length - 1]?.value ?? 0;
  const latest30cm = data?.humidity30[data.humidity30.length - 1]?.value ?? 0;
  const latestTemp =
    data?.temperaturesol?.[data.temperaturesol.length - 1]?.value ?? 0;

  const stats10cm = getStats(data?.humidity10 ?? []);
  const stats20cm = getStats(data?.humidity20 ?? []);
  const stats30cm = getStats(data?.humidity30 ?? []);
  const statsTemp = getStats(data?.temperaturesol ?? []);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7da06c] to-[#90A955] bg-clip-text text-transparent">
          Soil Moisture Monitor
        </h1>
        <div className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          Last updated:{" "}
          {data?.humidity10[data.humidity10.length - 1]?.recorded_at
            ? new Date(
                data.humidity10[data.humidity10.length - 1].recorded_at
              ).toLocaleString()
            : "N/A"}
        </div>
      </div>

      {/* Visualization Section */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-6">
            <h2 className="text-lg font-semibold text-[#7da06c]">
              Clay Soil Profile Analysis
            </h2>
            <div className="w-full sm:w-auto grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-6 text-sm">
              {[
                { depth: "10cm", stats: stats10cm },
                { depth: "20cm", stats: stats20cm },
                { depth: "30cm", stats: stats30cm },
                { depth: "Temp", stats: statsTemp, isTemp: true },
              ].map((layer, i) => (
                <div
                  key={i}
                  className="text-center bg-white/90 px-4 py-2 rounded-lg shadow-sm"
                >
                  <div className="font-semibold text-gray-700">
                    {layer.depth}
                  </div>
                  <div className="text-xs space-x-2 text-gray-500">
                    <span>
                      Avg: {layer.stats.avg}
                      {layer.isTemp ? "°C" : "%"}
                    </span>
                    <span>•</span>
                    <span className="text-red-500">
                      Min: {layer.stats.min}
                      {layer.isTemp ? "°C" : "%"}
                    </span>
                    <span>•</span>
                    <span className="text-green-500">
                      Max: {layer.stats.max}
                      {layer.isTemp ? "°C" : "%"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SoilMoistureVisual
            depth10={latest10cm}
            depth20={latest20cm}
            depth30={latest30cm}
            historicalData={data ?? undefined}
          />
        </div>
      </div>

      {/* History Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            data: data?.humidity10,
            depth: "10cm",
            stats: stats10cm,
            unit: "%",
            label: "Moisture",
            graphType: "10cm" as GraphType,
          },
          {
            data: data?.humidity20,
            depth: "20cm",
            stats: stats20cm,
            unit: "%",
            label: "Moisture",
            graphType: "20cm" as GraphType,
          },
          {
            data: data?.humidity30,
            depth: "30cm",
            stats: stats30cm,
            unit: "%",
            label: "Moisture",
            graphType: "30cm" as GraphType,
          },
          {
            data: data?.temperaturesol,
            depth: "Soil Temp",
            stats: statsTemp,
            unit: "°C",
            label: "Temperature",
            color: "#e67e22",
            graphType: "soil-temp" as GraphType,
          },
        ].map((layer, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-[#7da06c] to-[#90A955] bg-clip-text text-transparent">
                {layer.depth} History
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600">
                  24h Change:{" "}
                  {layer.data && layer.data.length > 24 ? (
                    <span
                      className={
                        layer.data[layer.data.length - 1].value -
                          layer.data[layer.data.length - 24].value >
                        0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {(layer.data[layer.data.length - 1].value -
                        layer.data[layer.data.length - 24].value >
                      0
                        ? "+"
                        : "") +
                        (
                          layer.data[layer.data.length - 1].value -
                          layer.data[layer.data.length - 24].value
                        ).toFixed(1) +
                        "%"}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </div>
                <button
                  onClick={() => setMaximizedGraph(layer.graphType)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Maximize graph"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500"
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={layer.data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
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
                    domain={layer.unit === "%" ? [0, 100] : [0, 50]}
                    unit={layer.unit}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [
                      `${value}${layer.unit}`,
                      layer.label,
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={layer.color || "#7da06c"}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          {["10cm", "20cm", "30cm", "temp"].map((depth) => (
            <button
              key={depth}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === depth
                  ? "text-[#7da06c] border-b-2 border-[#7da06c]"
                  : "text-gray-500 hover:text-[#90A955]"
              }`}
              onClick={() => setActiveTab(depth as any)}
            >
              {depth} Depth Records
            </button>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
          {["10cm", "20cm", "30cm", "temp"].map(
            (depth) =>
              activeTab === depth && (
                <MeasurementTable
                  key={depth}
                  data={
                    depth === "temp"
                      ? data?.temperaturesol ?? []
                      : data?.[
                          `humidity${depth.replace(
                            "cm",
                            ""
                          )}` as keyof SoilMoistureData
                        ] ?? []
                  }
                  unit={depth === "temp" ? "°C" : "%"}
                  type={
                    depth === "temp"
                      ? "Soil Temperature"
                      : `Soil Moisture (${depth})`
                  }
                  headerColor={depth === "temp" ? "#e67e22" : "#7da06c"}
                />
              )
          )}
        </div>
      </div>

      {/* Maximized Graph Modal */}
      {maximizedGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-[#7da06c]">
                {maximizedGraph === "soil-temp"
                  ? "Soil Temperature"
                  : `Soil Moisture (${maximizedGraph})`}{" "}
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

            <div className="flex-grow p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    maximizedGraph === "soil-temp"
                      ? data?.temperaturesol
                      : maximizedGraph === "10cm"
                      ? data?.humidity10
                      : maximizedGraph === "20cm"
                      ? data?.humidity20
                      : data?.humidity30
                  }
                  margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
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
                    domain={maximizedGraph === "soil-temp" ? [0, 50] : [0, 100]}
                    unit={maximizedGraph === "soil-temp" ? "°C" : "%"}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [
                      `${value}${maximizedGraph === "soil-temp" ? "°C" : "%"}`,
                      maximizedGraph === "soil-temp"
                        ? "Temperature"
                        : "Moisture",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      maximizedGraph === "soil-temp" ? "#e67e22" : "#7da06c"
                    }
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
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
