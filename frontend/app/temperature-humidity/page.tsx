'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GaugeChart from 'react-gauge-chart';

interface Measurement {
  value: number;
  recorded_at: string;
}

interface MeasurementData {
  temperature: Measurement[];
  humidity: Measurement[];
}

async function getMeasurements() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/temperatures-humidity`);
  return res.data;
}

export default function TemperatureHumidityPage() {
  const [data, setData] = useState<MeasurementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'temperature' | 'humidity'>('temperature');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const data = await getMeasurements();
      setData(data);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const latestTemperature = data?.temperature[data.temperature.length - 1]?.value ?? 0;
  const latestHumidity = data?.humidity[data.humidity.length - 1]?.value ?? 0;

  const tempPercentage = (latestTemperature + 10) / 60;
  const humidityPercentage = latestHumidity / 100;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#7da06c]">Temperature & Humidity Monitor</h1>
      
      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#ffc86b]">Current Temperature</h2>
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
          <h2 className="text-lg font-semibold mb-4 text-center text-[#f0a67d]">Current Humidity</h2>
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

      {/* Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-[#7da06c]">Temperature History</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.temperature}>
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis domain={[-10, 50]} unit="°C" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value}°C`, 'Temperature']}
                />
                <Line type="monotone" dataKey="value" stroke="#ffc86b" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-[#7da06c]">Humidity History</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.humidity}>
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value}%`, 'Humidity']}
                />
                <Line type="monotone" dataKey="value" stroke="#7da06c" dot={false} />
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
              activeTab === 'temperature'
                ? 'text-[#ffc86b] border-b-2 border-[#ffc86b]'
                : 'text-gray-500 hover:text-[#ffc86b]'
            }`}
            onClick={() => setActiveTab('temperature')}
          >
            Temperature Records
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === 'humidity'
                ? 'text-[#7da06c] border-b-2 border-[#7da06c]'
                : 'text-gray-500 hover:text-[#7da06c]'
            }`}
            onClick={() => setActiveTab('humidity')}
          >
            Humidity Records
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'temperature' && (
            <MeasurementTable 
              data={data?.temperature ?? []} 
              unit="°C"
              type="Temperature"
              headerColor="#ffc86b"
            />
          )}
          {activeTab === 'humidity' && (
            <MeasurementTable 
              data={data?.humidity ?? []} 
              unit="%"
              type="Humidity"
              headerColor="#7da06c"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MeasurementTable({ 
  data, 
  unit,
  type,
  headerColor 
}: { 
  data: Measurement[], 
  unit: string,
  type: string,
  headerColor: string
}) {
  return (
    <div className="rounded-md overflow-x-auto">
      <table className="w-full min-w-[400px] table-fixed">
        <thead>
          <tr className="border-b" style={{ backgroundColor: `${headerColor}15` }}>
            <th className="p-3 text-left" style={{ color: headerColor }}>{type}</th>
            <th className="p-3 text-left w-[200px]" style={{ color: headerColor }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {data.slice().reverse().map((measurement, index) => (
            <tr key={index} className="border-b">
              <td className="p-3 whitespace-nowrap">{measurement.value}{unit}</td>
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