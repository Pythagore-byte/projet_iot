import { Sun, Cloud, Droplet } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center">
      <h2 className="text-2xl font-semibold text-[#4a6741] mb-4 md:mb-0">Dashboard</h2>
      <div className="flex items-center space-x-4 bg-[#f9f7f3] p-2 rounded-lg">
        <Sun className="text-[#e3b448]" />
        <span className="text-[#2c3e50] font-medium">72°F</span>
        <Cloud className="text-[#8c7851]" />
        <Droplet className="text-[#4a6741]" />
        <span className="text-[#2c3e50] font-medium">30% rain</span>
      </div>
    </header>
  )
}

