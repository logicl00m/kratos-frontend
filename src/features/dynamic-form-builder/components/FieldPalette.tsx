import React from "react";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  CircleDot,
  FileText,
  Hash,
  Layers,
  List,
  Minus,
  Type,
} from "lucide-react";
import type { Field } from "../types/form-builder.types";

interface FieldTypeConfig {
  type: Field["type"];
  label: string;
  icon: React.ReactNode;
}

interface FieldPaletteProps {
  onFieldDragStart: (type: Field["type"]) => void;
}

const FIELD_TYPES: FieldTypeConfig[] = [
  { type: "text", label: "Text", icon: <Type size={16} /> },
  { type: "number", label: "Number", icon: <Hash size={16} /> },
  { type: "textarea", label: "Textarea", icon: <AlignLeft size={16} /> },
  { type: "file", label: "File", icon: <FileText size={16} /> },
  { type: "select", label: "Select", icon: <List size={16} /> },
  { type: "radio", label: "Radio", icon: <CircleDot size={16} /> },
  { type: "checkbox", label: "Checkbox", icon: <CheckSquare size={16} /> },
  { type: "date", label: "Date", icon: <Calendar size={16} /> },
  { type: "section", label: "Section", icon: <Layers size={16} /> },
  { type: "divider", label: "Divider", icon: <Minus size={16} /> },
];

export default function FieldPalette({ onFieldDragStart }: FieldPaletteProps) {
  return (
    <aside className="dfb__palette">
      <div>
        <h3 className="dfb__palette-title">Palette</h3>
        <p className="dfb__palette-subtitle">
          Drag a field type to add it to the canvas.
        </p>
      </div>
      <div className="dfb__palette-grid">
        {FIELD_TYPES.map((fieldType) => (
          <div
            key={fieldType.type}
            draggable
            onDragStart={() => onFieldDragStart(fieldType.type)}
            className="dfb__palette-item"
          >
            <span className="dfb__palette-item-icon" aria-hidden>
              {fieldType.icon}
            </span>
            <span>{fieldType.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
