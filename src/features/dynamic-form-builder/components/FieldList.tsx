import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Field } from "../types/form-builder.types";

interface FieldListProps {
  fields: Field[];
  selectedField: Field | null;
  onFieldSelect: (field: Field) => void;
  onFieldReorderStart: (index: number) => void;
  onDragOver: (event: React.DragEvent, index: number) => void;
  onDrop: (event: React.DragEvent, index: number) => void;
  onDeleteField: (index: number) => void;
  onDuplicateField: (index: number) => void;
  onFieldContextMenu: (field: Field, index: number, position: { x: number; y: number }) => void;
  dragOverIndex: number | null;
}

export default function FieldList({
  fields,
  selectedField,
  onFieldSelect,
  onFieldReorderStart,
  onDragOver,
  onDrop,
  onDeleteField,
  onDuplicateField,
  onFieldContextMenu,
  dragOverIndex,
}: FieldListProps) {
  return (
    <Card className="dfb-field-list">
      <div className="dfb-field-list__header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3>Fields (drag to reorder)</h3>
          <span className="dfb-field-list__hint">IDs are auto-generated</span>
        </div>
        <span className="dfb-field-list__hint">{fields.length} fields</span>
      </div>

      <div>
        {fields.map((field, index) => (
          <div
            key={field.id}
            draggable
            onDragStart={() => onFieldReorderStart(index)}
            onDragOver={(event) => onDragOver(event, index)}
            onDrop={(event) => onDrop(event, index)}
            onClick={() => onFieldSelect(field)}
            onContextMenu={(event) => {
              event.preventDefault();
              onFieldContextMenu(field, index, { x: event.clientX, y: event.clientY });
            }}
            className={cn(
              "dfb-field-item",
              selectedField?.id === field.id && "dfb-field-item--selected",
              dragOverIndex === index && "dfb-field-item--drag-over"
            )}
          >
            <GripVertical className="dfb-field-item__handle" size={16} />
            <div className="dfb-field-item__name">
              <span>{field.name}</span>
              <span className="dfb-field-item__badge">{field.type}</span>
            </div>
            <div className="dfb-field-item__meta-group">id: {field.id}</div>
            <div className="dfb-field-item__meta-group">data: {field.data || "(unbound)"}</div>
            <div className="dfb-field-item__tags">
              {field.fieldActions.map((action) => (
                <span key={action} className="dfb-field-item__tag">
                  {action}
                </span>
              ))}
            </div>
            <div className="dfb-field-item__actions">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Duplicate ${field.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicateField(index);
                }}
              >
                <Copy size={16} aria-hidden />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Delete ${field.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteField(index);
                }}
              >
                <Trash2 size={16} aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
