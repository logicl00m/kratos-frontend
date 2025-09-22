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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Minus } from "lucide-react";
import type { Field } from "../types/form-builder.types";

interface FieldInspectorProps {
  selectedField: Field | null;
  onUpdateField: (updates: Partial<Field>) => void;
  onPreview: () => void;
}

interface FieldActionOption {
  value: string;
  label: string;
  types: Field["type"][];
}

const FIELD_ACTION_OPTIONS: FieldActionOption[] = [
  {
    value: "save",
    label: "Save",
    types: [
      "text",
      "number",
      "textarea",
      "select",
      "radio",
      "checkbox",
      "date",
    ],
  },
  {
    value: "validate",
    label: "Validate",
    types: [
      "text",
      "number",
      "textarea",
      "select",
      "radio",
      "checkbox",
      "date",
      "file",
    ],
  },
  {
    value: "upload",
    label: "Upload",
    types: ["file"],
  },
  {
    value: "replace",
    label: "Replace",
    types: ["file"],
  },
];

const FIELD_TYPES_WITH_OPTIONS: Field["type"][] = [
  "select",
  "radio",
  "checkbox",
];

function getAllowedActions(fieldType: Field["type"]) {
  return FIELD_ACTION_OPTIONS.filter((option) =>
    option.types.includes(fieldType)
  );
}

interface FieldActionsSelectorProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  options: FieldActionOption[];
}

function FieldActionsSelector({
  value,
  onChange,
  disabled,
  options,
}: FieldActionsSelectorProps) {
  const toggleAction = (action: string, checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...value, action])));
    } else {
      onChange(value.filter((item) => item !== action));
    }
  };

  const summary = value.length
    ? `${value.length} action${value.length > 1 ? "s" : ""} selected`
    : "Select actions";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="dfb-inspector__actions-trigger"
          disabled={disabled || !options.length}
        >
          <span>{summary}</span>
          <ChevronDown size={14} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="dfb-inspector__actions-menu"
        align="start"
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => toggleAction(option.value, checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {!options.length && (
          <div className="dfb-inspector__actions-empty">
            No actions available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function FieldInspector({
  selectedField,
  onUpdateField,
  onPreview,
}: FieldInspectorProps) {
  if (!selectedField) {
    return (
      <aside className="dfb-inspector__empty">
        <h3 className="dfb-inspector__title">Inspector - Field properties</h3>
        <p className="dfb-inspector__subtitle">
          Select a field on the canvas to configure its settings.
        </p>
      </aside>
    );
  }

  const withValidation = selectedField.validation ?? {};
  const isStructuralField =
    selectedField.type === "section" || selectedField.type === "divider";
  const allowedActions = getAllowedActions(selectedField.type);
  const fieldActions = selectedField.fieldActions ?? [];

  const addOption = () => {
    const newOptions = [
      ...(selectedField.options || []),
      { value: `value_${Date.now()}`, label: "New option" },
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

  const handleActionsChange = (actions: string[]) => {
    onUpdateField({ fieldActions: actions });
  };

  return (
    <aside className="dfb-inspector">
      <div>
        <h3 className="dfb-inspector__title">Inspector - Field properties</h3>
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
              onChange={(event) => onUpdateField({ name: event.target.value })}
              className="dfb-input"
            />
            <p className="dfb-inspector__hint">Human-readable field label.</p>
          </div>

          <div>
            <Label htmlFor="field-id">Field ID</Label>
            <Input
              id="field-id"
              value={selectedField.id}
              disabled
              className="dfb-input"
            />
            <p className="dfb-inspector__hint">
              Managed by backend. IDs are read-only here.
            </p>
          </div>

          <div>
            <Label htmlFor="field-type">Type</Label>
            <Select
              value={selectedField.type}
              onValueChange={(value) =>
                onUpdateField({ type: value as Field["type"] })
              }
            >
              <SelectTrigger className="dfb-select__trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="dfb-select__content"
                position="popper"
                sideOffset={6}
              >
                <SelectItem value="text" className="dfb-select__item">
                  Text
                </SelectItem>
                <SelectItem value="number" className="dfb-select__item">
                  Number
                </SelectItem>
                <SelectItem value="textarea" className="dfb-select__item">
                  Textarea
                </SelectItem>
                <SelectItem value="file" className="dfb-select__item">
                  File
                </SelectItem>
                <SelectItem value="select" className="dfb-select__item">
                  Select
                </SelectItem>
                <SelectItem value="radio" className="dfb-select__item">
                  Radio
                </SelectItem>
                <SelectItem value="checkbox" className="dfb-select__item">
                  Checkbox
                </SelectItem>
                <SelectItem value="date" className="dfb-select__item">
                  Date
                </SelectItem>
                <SelectItem value="section" className="dfb-select__item">
                  Section
                </SelectItem>
                <SelectItem value="divider" className="dfb-select__item">
                  Divider
                </SelectItem>
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
              <SelectTrigger className="dfb-select__trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="dfb-select__content"
                position="popper"
                sideOffset={6}
              >
                <SelectItem value="default" className="dfb-select__item">
                  Default
                </SelectItem>
                <SelectItem value="readonly" className="dfb-select__item">
                  Read only
                </SelectItem>
                <SelectItem value="disabled" className="dfb-select__item">
                  Disabled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Field actions</Label>
            <FieldActionsSelector
              value={fieldActions}
              onChange={handleActionsChange}
              disabled={isStructuralField}
              options={allowedActions}
            />
            {/* Also render quick toggles for accessibility and faster edits */}
            <div className="dfb-inspector__grid" style={{ marginTop: 8 }}>
              {allowedActions.map((option) => {
                const checked = fieldActions.includes(option.value);
                return (
                  <div key={option.value} className="dfb-inspector__row">
                    <span className="dfb-inspector__hint">{option.label}</span>
                    <Switch
                      aria-label={`Toggle ${option.value}`}
                      checked={checked}
                      onCheckedChange={(next) => {
                        if (next && !checked) {
                          handleActionsChange([...fieldActions, option.value]);
                        } else if (!next && checked) {
                          handleActionsChange(
                            fieldActions.filter((a) => a !== option.value)
                          );
                        }
                      }}
                      disabled={isStructuralField}
                    />
                  </div>
                );
              })}
            </div>
            <div className="dfb-inspector__action-tags">
              {fieldActions.length ? (
                fieldActions.map((action) => (
                  <span key={action} className="dfb-inspector__action-tag">
                    {action}
                  </span>
                ))
              ) : (
                <p className="dfb-inspector__hint">
                  {isStructuralField
                    ? "Structural elements do not support actions."
                    : "Select one or more behaviours applied to this field."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="dfb-inspector__section">
        <h4>Data binding</h4>
        <div className="dfb-inspector__options">
          <div>
            <Label htmlFor="field-path">Path</Label>
            <Input
              id="field-path"
              value={selectedField.data}
              placeholder={
                isStructuralField ? "" : "{{ data.borrower.property }}"
              }
              onChange={(event) => onUpdateField({ data: event.target.value })}
              disabled={isStructuralField}
              className="dfb-input"
            />
            <p className="dfb-inspector__hint">
              {isStructuralField
                ? "Structural elements do not bind to data."
                : "Mustache path. Example: {{ data.borrower.legalName }}"}
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
              disabled={isStructuralField}
            />
          </div>

          {selectedField.type === "number" && (
            <div className="dfb-inspector__grid">
              <div>
                <Label htmlFor="field-min">Min</Label>
                <Input
                  id="field-min"
                  type="number"
                  value={withValidation.min ?? ""}
                  onChange={(event) =>
                    onUpdateField({
                      validation: {
                        ...withValidation,
                        min:
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value),
                      },
                    })
                  }
                  className="dfb-input"
                />
              </div>
              <div>
                <Label htmlFor="field-max">Max</Label>
                <Input
                  id="field-max"
                  type="number"
                  value={withValidation.max ?? ""}
                  onChange={(event) =>
                    onUpdateField({
                      validation: {
                        ...withValidation,
                        max:
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value),
                      },
                    })
                  }
                  className="dfb-input"
                />
              </div>
            </div>
          )}

          {!isStructuralField && (
            <div>
              <Label htmlFor="field-regex">Pattern (regex)</Label>
              <Input
                id="field-regex"
                value={withValidation.regex ?? ""}
                onChange={(event) =>
                  onUpdateField({
                    validation: {
                      ...withValidation,
                      regex: event.target.value || undefined,
                    },
                  })
                }
                placeholder="^\\w+$"
                className="dfb-input"
              />
              <p className="dfb-inspector__hint">
                Optional. Leave blank to remove a pattern constraint.
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="dfb-inspector__section">
        <h4>Help text</h4>
        <Textarea
          id="field-help"
          value={selectedField.helpText || ""}
          onChange={(event) => onUpdateField({ helpText: event.target.value })}
          placeholder="Provide guidance for form users."
          rows={3}
        />
        <p className="dfb-inspector__hint">
          Displayed to the end user as supporting copy.
        </p>
      </section>{" "}
      {FIELD_TYPES_WITH_OPTIONS.includes(selectedField.type) && (
        <section className="dfb-inspector__section">
          <h4>Options</h4>
          <div className="dfb-inspector__options">
            {(selectedField.options || []).map((option, index) => (
              <div key={option.value} className="dfb-inspector__option">
                <div className="dfb-inspector__grid">
                  <div>
                    <Label htmlFor={`option-label-${index}`}>Label</Label>
                    <Input
                      id={`option-label-${index}`}
                      value={option.label}
                      onChange={(event) =>
                        updateOption(index, "label", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`option-value-${index}`}>Value</Label>
                    <Input
                      id={`option-value-${index}`}
                      value={option.value}
                      onChange={(event) =>
                        updateOption(index, "value", event.target.value)
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="dfb-inspector__option-remove"
                  onClick={() => removeOption(index)}
                >
                  <Minus size={14} aria-hidden />
                  Remove option
                </Button>
              </div>
            ))}

            <Button
              type="button"
              onClick={addOption}
              variant="outline"
              size="sm"
              className="dfb-inspector__option-add"
              aria-label="Add Option"
            >
              <Plus size={14} aria-hidden />
              Add option
            </Button>
          </div>
        </section>
      )}
      <footer className="dfb-inspector__footer">
        <div className="dfb-inspector__actions">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            aria-label="Preview"
          >
            Preview changes
          </Button>
        </div>
      </footer>
    </aside>
  );
}
