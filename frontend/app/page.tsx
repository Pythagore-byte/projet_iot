import { Widget } from "./components/widget"
import { Thermometer, Sun, Droplet } from "lucide-react"

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Widget title="Temperature">
        <div className="flex items-center justify-between">
          <Thermometer className="text-[#e3b448] h-12 w-12" />
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2c3e50]">72°F</p>
            <p className="text-sm text-gray-500">Optimal: 68°F - 75°F</p>
          </div>
        </div>
      </Widget>
      <Widget title="Lighting">
        <div className="flex items-center justify-between">
          <Sun className="text-[#e3b448] h-12 w-12" />
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2c3e50]">65%</p>
            <p className="text-sm text-gray-500">12h on / 12h off</p>
          </div>
        </div>
      </Widget>
      <Widget title="Irrigation">
        <div className="flex items-center justify-between">
          <Droplet className="text-[#4a6741] h-12 w-12" />
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2c3e50]">Active</p>
            <p className="text-sm text-gray-500">Next: 2 hours</p>
          </div>
        </div>
      </Widget>
      {/* Add more widgets as needed */}
    </div>
  )
}

