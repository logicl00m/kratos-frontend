// src/features/dashboard/components/StatsCard.tsx
import React from "react";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  type: "total" | "completed" | "pending" | "overdue";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, type }) => {
  const getIconAndStyle = () => {
    switch (type) {
      case "total":
        return {
          icon: <FileText className="dashboard-stat-icon-blue" />,
          containerClass: "dashboard-stat-icon-container",
          valueClass: "dashboard-stat-value"
        };
      case "completed":
        return {
          icon: <CheckCircle className="dashboard-stat-icon-emerald" />,
          containerClass: "dashboard-stat-icon-completed",
          valueClass: "dashboard-stat-value-completed"
        };
      case "pending":
        return {
          icon: <Clock className="dashboard-stat-icon-amber" />,
          containerClass: "dashboard-stat-icon-pending",
          valueClass: "dashboard-stat-value-pending"
        };
      case "overdue":
        return {
          icon: <AlertCircle className="dashboard-stat-icon-red" />,
          containerClass: "dashboard-stat-icon-overdue",
          valueClass: "dashboard-stat-value-overdue"
        };
      default:
        return {
          icon: <FileText className="dashboard-stat-icon-blue" />,
          containerClass: "dashboard-stat-icon-container",
          valueClass: "dashboard-stat-value"
        };
    }
  };

  const { icon, containerClass, valueClass } = getIconAndStyle();

  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-content">
        <div className="dashboard-stat-text-container">
          <p className="dashboard-stat-label">{title}</p>
          <p className={`dashboard-stat-value ${valueClass}`}>
            {value}
          </p>
        </div>
        <div className={containerClass}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;