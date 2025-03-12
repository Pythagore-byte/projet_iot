import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  status?: "normal" | "warning" | "critical";
}

export function Widget({ title, children, status = "normal" }: WidgetProps) {
  const getStatusColor = () => {
    switch (status) {
      case "warning":
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      case "critical":
        return "from-red-50 to-red-100 border-red-200";
      default:
        return "from-white to-gray-50 border-gray-100";
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case "warning":
        return <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>;
      case "critical":
        return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
    }
  };

  return (
    <Card
      className={`bg-gradient-to-br ${getStatusColor()} shadow-lg hover:shadow-xl transition-all duration-300 border rounded-xl overflow-hidden`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center">
          {getStatusIndicator()}
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-[#4a6741] to-[#90A955] bg-clip-text text-transparent">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
