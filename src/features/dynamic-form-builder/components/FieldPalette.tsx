import React from 'react';

interface FieldType {
  type: string;
  label: string;
  icon: string;
}

interface FieldPaletteProps {
  onFieldDragStart: (type: string) => void;
}

const FIELD_TYPES: FieldType[] = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'textarea', label: 'Textarea', icon: '¶' },
  { type: 'file', label: 'File', icon: '📎' },
  { type: 'select', label: 'Select', icon: '▼' },
  { type: 'radio', label: 'Radio', icon: '◉' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'section', label: 'Section', icon: '═' },
  { type: 'divider', label: 'Divider', icon: '─' }
];

export default function FieldPalette({ onFieldDragStart }: FieldPaletteProps) {
  return (
    <aside className="dfb__palette">
      <div>
        <h3 className="dfb__palette-title">Palette</h3>
        <p className="dfb__palette-subtitle">Drag a field type to add it to the canvas.</p>
      </div>
      <div className="dfb__palette-grid">
        {FIELD_TYPES.map(fieldType => (
          <div
            key={fieldType.type}
            draggable
            onDragStart={() => onFieldDragStart(fieldType.type)}
            className="dfb__palette-item"
          >
            <span className="dfb__palette-item-icon">{fieldType.icon}</span>
            <span>{fieldType.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
