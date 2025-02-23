import { useEffect, useState, useRef } from 'react';

interface SoilMoistureVisualProps {
  depth10: number;
  depth20: number;
  depth30: number;
  historicalData?: {
    humidity10: { value: number }[];
    humidity20: { value: number }[];
    humidity30: { value: number }[];
  };
}

const IDEAL_RANGE = { min: 40, max: 60 }; // Clay soil ideal range

export default function SoilMoistureVisual({ depth10, depth20, depth30, historicalData }: SoilMoistureVisualProps) {
  const [showInfo, setShowInfo] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate trends
  const getTrend = (currentValue: number, history: { value: number }[] = []) => {
    if (history.length < 2) return 'stable';
    const recent = history.slice(-5);
    const avg = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
    const diff = currentValue - avg;
    return Math.abs(diff) < 2 ? 'stable' : diff > 0 ? 'rising' : 'falling';
  };

  // Get moisture status
  const getMoistureStatus = (value: number) => {
    if (value < IDEAL_RANGE.min) return 'too-dry';
    if (value > IDEAL_RANGE.max) return 'too-wet';
    return 'ideal';
  };

  // Animation and canvas drawing
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const drawSoilLayer = (y: number, height: number, moisture: number) => {
      // Create gradient for the layer
      const gradient = ctx.createLinearGradient(0, y, 0, y + height);
      
      // Enhanced soil coloring based on moisture
      const moistureLevel = moisture / 100;
      const baseColor = '#8B4513'; // Clay soil base color
      
      gradient.addColorStop(0, baseColor);
      
      // Add moisture effect
      if (getMoistureStatus(moisture) === 'too-wet') {
        gradient.addColorStop(1, `rgba(0, 0, 139, ${moistureLevel})`); // Dark blue for wet
      } else if (getMoistureStatus(moisture) === 'too-dry') {
        gradient.addColorStop(1, `rgba(139, 69, 19, ${1 - moistureLevel * 0.5})`); // Brown for dry
      } else {
        gradient.addColorStop(1, `rgba(34, 139, 34, ${moistureLevel})`); // Green for ideal
      }
      
      // Fill the main layer
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, ctx.canvas.width, height);

      // Add soil texture
      ctx.save();
      ctx.globalAlpha = 0.15;
      const particleCount = 150;
      const maxParticleSize = 2.5;

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * ctx.canvas.width;
        const particleY = y + Math.random() * height;
        const size = Math.random() * maxParticleSize;
        
        // Draw soil particles
        ctx.beginPath();
        ctx.arc(x, particleY, size, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      }
      ctx.restore();

      // Add moisture droplets for wet soil
      if (moisture > 60) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < moisture / 5; i++) {
          const x = Math.random() * ctx.canvas.width;
          const dropY = y + Math.random() * height;
          
          // Draw water droplet
          ctx.beginPath();
          ctx.arc(x, dropY, 1, 0, Math.PI * 2);
          ctx.fillStyle = '#4169E1';
          ctx.fill();
        }
        ctx.restore();
      }
    };

    // Clear canvas with fade effect
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw layers with enhanced visuals
    const layerHeight = ctx.canvas.height / 3;
    drawSoilLayer(0, layerHeight, depth10);
    drawSoilLayer(layerHeight, layerHeight, depth20);
    drawSoilLayer(layerHeight * 2, layerHeight, depth30);

    // Draw enhanced root system
    ctx.strokeStyle = '#2F4F2F';
    ctx.lineWidth = 1.5;
    const rootCount = 7;
    
    for (let i = 0; i < rootCount; i++) {
      const x = (ctx.canvas.width / (rootCount - 1)) * i;
      
      // Main root
      ctx.beginPath();
      ctx.moveTo(x, 0);
      const controlPoint1X = x + Math.random() * 40 - 20;
      const controlPoint2X = x + Math.random() * 40 - 20;
      ctx.bezierCurveTo(
        controlPoint1X, ctx.canvas.height / 3,
        controlPoint2X, ctx.canvas.height * 2/3,
        x + Math.random() * 60 - 30, ctx.canvas.height
      );
      ctx.stroke();

      // Add small root branches
      for (let j = 0; j < 3; j++) {
        const startY = (ctx.canvas.height / 3) * j;
        const endY = startY + 40;
        
        ctx.beginPath();
        ctx.moveTo(x, startY + Math.random() * 50);
        ctx.quadraticCurveTo(
          x + (Math.random() > 0.5 ? 20 : -20),
          (startY + endY) / 2,
          x + (Math.random() > 0.5 ? 30 : -30),
          endY
        );
        ctx.stroke();
      }
    }

  }, [depth10, depth20, depth30]);

  return (
    <div className="relative">
      {/* Main Visualization */}
      <div className="relative w-full max-w-[600px] mx-auto">
        <canvas 
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-[400px] rounded-lg shadow-inner bg-gradient-to-b from-[#E8F5E9] to-transparent"
        />

        {/* Enhanced Depth Indicators */}
        {[
          { depth: 10, value: depth10, y: '15%' },
          { depth: 20, value: depth20, y: '48%' },
          { depth: 30, value: depth30, y: '81%' }
        ].map((layer, i) => (
          <div
            key={i}
            className="absolute left-0 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-r-lg shadow-lg p-2.5 cursor-help transition-all duration-200 hover:pl-4"
            style={{ top: layer.y }}
            onMouseEnter={() => setShowInfo(i)}
            onMouseLeave={() => setShowInfo(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-gray-700">{layer.depth}cm</span>
              <span className={`text-sm font-medium ${
                getMoistureStatus(layer.value) === 'ideal' ? 'text-green-600' :
                getMoistureStatus(layer.value) === 'too-wet' ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {layer.value}%
              </span>
              {/* Enhanced trend indicator */}
              {historicalData && (
                <span className={`text-xs font-bold ${
                  getTrend(layer.value, historicalData[`humidity${layer.depth}` as keyof typeof historicalData]) === 'rising' ? 'text-green-500' :
                  getTrend(layer.value, historicalData[`humidity${layer.depth}` as keyof typeof historicalData]) === 'falling' ? 'text-red-500' :
                  'text-gray-400'
                }`}>
                  {getTrend(layer.value, historicalData[`humidity${layer.depth}` as keyof typeof historicalData]) === 'rising' ? '↑' :
                   getTrend(layer.value, historicalData[`humidity${layer.depth}` as keyof typeof historicalData]) === 'falling' ? '↓' : '→'}
                </span>
              )}
            </div>

            {/* Enhanced info popup */}
            {showInfo === i && (
              <div className="absolute left-full ml-2 top-0 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 w-48 z-20 border border-gray-100">
                <h4 className="font-bold text-sm mb-1 text-gray-800">Depth: {layer.depth}cm</h4>
                <p className="text-xs mb-2 text-gray-600">
                  Ideal range: {IDEAL_RANGE.min}% - {IDEAL_RANGE.max}%
                </p>
                <div className={`text-xs font-medium ${
                  getMoistureStatus(layer.value) === 'ideal' ? 'text-green-600' :
                  getMoistureStatus(layer.value) === 'too-wet' ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  Status: {
                    getMoistureStatus(layer.value) === 'ideal' ? 'Optimal' :
                    getMoistureStatus(layer.value) === 'too-wet' ? 'Too wet' :
                    'Too dry'
                  }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Legend */}
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2 bg-white/90 px-3 py-1 rounded-full shadow-sm">
          <div className="w-3 h-3 bg-orange-600 rounded-full shadow-inner"></div>
          <span className="text-gray-700">Too Dry</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/90 px-3 py-1 rounded-full shadow-sm">
          <div className="w-3 h-3 bg-green-600 rounded-full shadow-inner"></div>
          <span className="text-gray-700">Optimal</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/90 px-3 py-1 rounded-full shadow-sm">
          <div className="w-3 h-3 bg-blue-600 rounded-full shadow-inner"></div>
          <span className="text-gray-700">Too Wet</span>
        </div>
      </div>
    </div>
  );
}