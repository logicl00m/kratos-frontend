import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { Field } from "../types/form-builder.types";

interface FieldInspectorProps {
  selectedField: Field | null;
  onUpdateField: (updates: Partial<Field>) => void;
  onPreview: () => void;
}

const FIELD_ACTIONS = ["save", "validate", "upload", "replace"];

export default function FieldInspector({
  selectedField,
  onUpdateField,
  onPreview,
}: FieldInspectorProps) {
  if (!selectedField) {
    return (
      <aside className="dfb-inspector__empty">
        <h3 className="dfb-inspector__title">Inspector — Field Properties</h3>
        <p className="dfb-inspector__subtitle">
          Select a field on the canvas to configure its settings.
        </p>
      </aside>
    );
  }

  const withValidation = selectedField.validation ?? {};

  const addOption = () => {
    const newOptions = [
      ...(selectedField.options || []),
      { value: `value_${Date.now()}`, label: "New Option" },
    ];
    onUpdateField({ options: newOptions });
  };

  const updateOption = (
    index: number,
    fieldKey: "value" | "label",
    value: string
  ) => {
    if (!selectedField.options) return;
    const newOptions = [...selectedField.options];
    newOptions[index][fieldKey] = value;
    onUpdateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!selectedField.options) return;
    const newOptions = selectedField.options.filter((_, i) => i !== index);
    onUpdateField({ options: newOptions });
  };

  const toggleFieldAction = (action: string) => {
    const currentActions = selectedField.fieldActions || [];
    const newActions = currentActions.includes(action)
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];
    onUpdateField({ fieldActions: newActions });
  };

  return (
    <aside className="dfb-inspector">
      <div>
        <h3 className="dfb-inspector__title">Inspector — Field Properties</h3>
        <p className="dfb-inspector__subtitle">
          Configure the selected field. Status affects runtime behaviour;
          actions are constrained by type.
        </p>
      </div>

      <section className="dfb-inspector__section">
        <h4>General</h4>
        <div className="dfb-inspector__options">
          <div>
            <Label htmlFor="field-label">Label</Label>
            <Input
              id="field-label"
              value={selectedField.name}
              onChange={(e) => onUpdateField({ name: e.target.value })}
            />
            <p className="dfb-inspector__hint">Human-readable field label.</p>
          </div>

          <div>
            <Label htmlFor="field-id">ID</Label>
            <Input
              id="field-id"
              value={selectedField.id}
              onChange={(e) => onUpdateField({ id: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="field-type">Type</Label>
            <Select
              value={selectedField.type}
              onValueChange={(value) =>
                onUpdateField({ type: value as Field["type"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="section">Section</SelectItem>
                <SelectItem value="divider">Divider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="field-status">Status</Label>
            <Select
              value={selectedField.status}
              onValueChange={(value) =>
                onUpdateField({ status: value as Field["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">default</SelectItem>
                <SelectItem value="readonly">readonly</SelectItem>
                <SelectItem value="disabled">disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="dfb-inspector__section">
        <h4>Data Binding</h4>
        <div className="dfb-inspector__options">
          <div>
            <Label htmlFor="field-path">Path</Label>
            <Input
              id="field-path"
              value={selectedField.data}
              onChange={(e) => onUpdateField({ data: e.target.value })}
            />
            <p className="dfb-inspector__hint">
              Mustache path. Example: {"{{ data.borrower.legalName }}"}
            </p>
          </div>
        </div>
      </section>

      <section className="dfb-inspector__section">
        <h4>Validation</h4>
        <div className="dfb-inspector__options">
          <div className="dfb-inspector__row">
            <Label>Required</Label>
            <Switch
              aria-label="Toggle required"
              checked={withValidation.required || false}
              onCheckedChange={(checked) =>
                onUpdateField({
                  validation: { ...withValidation, required: checked },
                })
              }
            />
          </div>

          {selectedField.type === "number" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <div>
                <Label htmlFor="field-min">Min</Label>
                <Input
                  id="field-min"
                  type="number"
                  value={
                    withValidation.min !== undefined
                      ? String(withValidation.min)
                      : ""
                  }
                  onChange={(e) =>
                    onUpdateField({
                      validation: {
                        ...withValidation,
                        min:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="field-max">Max</Label>
                <Input
                  id="field-max"
                  type="number"
                  value={
                    withValidation.max !== undefined
                      ? String(withValidation.max)
                      : ""
                  }
                  onChange={(e) =>
                    onUpdateField({
                      validation: {
                        ...withValidation,
                        max:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {selectedField.type === "text" && (
            <div>
              <Label htmlFor="field-regex">Regex</Label>
              <Input
                id="field-regex"
                value={withValidation.regex || ""}
                onChange={(e) =>
                  onUpdateField({
                    validation: { ...withValidation, regex: e.target.value },
                  })
                }
                placeholder="^[A-Za-z]+$"
              />
              <p className="dfb-inspector__hint">
                Optional. Applied after trimming.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="dfb-inspector__section">
        <h4>Help Text</h4>
        <Textarea
          id="field-help"
          value={selectedField.helpText || ""}
          onChange={(e) => onUpdateField({ helpText: e.target.value })}
          placeholder="Enter your full legal name as it appears on official documents."
          rows={3}
        />
      </section>

      {(selectedField.type === "select" || selectedField.type === "radio") && (
        <section className="dfb-inspector__section">
          <h4>Options</h4>
          <p className="dfb-inspector__hint">
            Stored in formMeta.optionsByFieldId[id]. Not included in the primary
            export.
          </p>
          <div className="dfb-inspector__options">
            {selectedField.options?.map((option, index) => (
              <div key={option.value} className="dfb-inspector__option">
                <Input
                  value={option.value}
                  onChange={(e) => updateOption(index, "value", e.target.value)}
                  placeholder="value"
                />
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(index, "label", e.target.value)}
                  placeholder="Label"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() => removeOption(index)}
                >
                  <Minus size={16} />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addOption}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Add Option
            </Button>
          </div>
        </section>
      )}

      <section className="dfb-inspector__section">
        <h4>Field Actions</h4>
        <p className="dfb-inspector__hint">
          Allowed by type: text / number / textarea / select / radio / checkbox
          / date (save, validate). file (upload, replace, validate).
        </p>
        <div className="dfb-inspector__options">
          {FIELD_ACTIONS.map((action) => (
            <div key={action} className="dfb-inspector__row">
              <Label style={{ textTransform: "capitalize" }}>{action}</Label>
              <Switch
                aria-label={`Toggle ${action}`}
                checked={selectedField.fieldActions.includes(action)}
                onCheckedChange={() => toggleFieldAction(action)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="dfb-inspector__footer">
        <Button>Save</Button>
        <Button variant="outline">Preview</Button>
      </div>
    </aside>
  );
}
