// src/features/workflow/components/GraphToolbar.tsx
import React from "react";
import { Download } from "lucide-react";
import "./GraphToolbar.css";

type GraphToolbarProps = {
  onExport?: () => void;
  right?: React.ReactNode;
};

const GraphToolbar: React.FC<GraphToolbarProps> = ({ onExport, right }) => {
  return (
    <div className="graph-toolbar">
      {onExport && (
        <button onClick={onExport} className="gt-btn">
          <Download size={14} />
          Export
        </button>
      )}
      {right}
    </div>
  );
};

export default GraphToolbar;
