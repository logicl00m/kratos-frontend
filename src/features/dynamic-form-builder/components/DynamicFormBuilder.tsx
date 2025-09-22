/*
PROMPT (Copilot/GPT-5): Headless drawer API + Preview

- Expose a headless API for the builder when shown in a drawer:
  - Props: initialForm?: FormDTO, onSave(form: FormDTO), onCancel().
  - FormDTO: { id?: string; name: string; version?: number; json: object }.
- On Save: POST to /api/forms (mock), receive {id, version}; call onSave({id, name, version, json}).
- Provide a Preview tab (read-only) that the BuilderDetailsPanel can reuse.
- Respect labels/aria for all fields (tie to FieldInspector config).
Docs: https://www.w3.org/WAI/tutorials/forms/labels/
*/

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Upload,
  Plus,
  Eye,
  Save,
  Edit2,
  Copy,
  Trash2,
} from "lucide-react";
import FieldPalette from "./FieldPalette";
import FieldList from "./FieldList";
import FieldInspector from "./FieldInspector";
import type { Field, FormConfig } from "../types/form-builder.types";
import "../dynamic-form-builder.css";
import {
  createForm,
  type FormDTO,
} from "@features/workflow-config-edit/services/formsApi";

type ContextMenuState = {
  field: Field;
  index: number;
  position: { x: number; y: number };
};

const DEFAULT_FIELD_ACTIONS: Record<Field["type"], string[]> = {
  text: ["save", "validate"],
  number: ["save", "validate"],
  textarea: ["save", "validate"],
  file: ["upload", "replace", "validate"],
  select: ["save", "validate"],
  radio: ["save", "validate"],
  checkbox: ["save", "validate"],
  date: ["save", "validate"],
  section: [],
  divider: [],
};

const generateFieldId = (type: Field["type"]) =>
  `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const INITIAL_FIELDS: Field[] = [
  {
    id: "borrower_legal_name",
    name: "Legal Name",
    type: "text",
    status: "default",
    data: "{{ data.borrower.legalName }}",
    fieldActions: [...DEFAULT_FIELD_ACTIONS.text],
  },
  {
    id: "borrower_birthdate",
    name: "Birthdate",
    type: "date",
    status: "default",
    data: "{{ data.borrower.birthdate }}",
    fieldActions: [...DEFAULT_FIELD_ACTIONS.date],
  },
  {
    id: "borrower_document",
    name: "Document Upload",
    type: "file",
    status: "default",
    data: "{{ data.borrower.documents[0] }}",
    fieldActions: [...DEFAULT_FIELD_ACTIONS.file],
  },
];

const createField = (type: Field["type"]): Field => {
  const isStructural = type === "section" || type === "divider";
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return {
    id: generateFieldId(type),
    name: isStructural ? label : `New ${label} field`,
    type,
    status: "default",
    data: isStructural ? "" : "{{ data.field }}",
    fieldActions: [...(DEFAULT_FIELD_ACTIONS[type] ?? [])],
  };
};

interface FieldContextMenuProps {
  position: { x: number; y: number };
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function FieldContextMenu({
  position,
  onEdit,
  onDuplicate,
  onDelete,
}: Readonly<FieldContextMenuProps>) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      // Close is handled by outside listener in parent via window click; no-op here
      (event.currentTarget as HTMLDivElement).blur();
    }
    if (event.key === "Enter") {
      // Activate first item by default
      onEdit();
    }
  };
  return (
    <div
      className="dfb-context-menu"
      style={{ top: position.y, left: position.x }}
      role="menu"
      tabIndex={0}
      aria-label="Field actions"
      onKeyDown={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button type="button" className="dfb-context-menu__item" onClick={onEdit}>
        <Edit2 size={14} aria-hidden />
        Edit properties
      </button>
      <button
        type="button"
        className="dfb-context-menu__item"
        onClick={onDuplicate}
      >
        <Copy size={14} aria-hidden />
        Duplicate field
      </button>
      <button
        type="button"
        className="dfb-context-menu__item dfb-context-menu__item--danger"
        onClick={onDelete}
      >
        <Trash2 size={14} aria-hidden />
        Delete field
      </button>
    </div>
  );
}

const adjustContextMenuPosition = (x: number, y: number) => {
  if (typeof window === "undefined") {
    return { x, y };
  }

  const menuWidth = 220;
  const menuHeight = 132;
  const padding = 12;
  const maxX = window.innerWidth - menuWidth - padding;
  const maxY = window.innerHeight - menuHeight - padding;

  return {
    x: Math.max(padding, Math.min(x, maxX)),
    y: Math.max(padding, Math.min(y, maxY)),
  };
};

export interface DynamicFormBuilderProps {
  initialForm?: FormDTO;
  onSave?: (form: FormDTO) => void;
  onCancel?: () => void;
}

export function DynamicFormBuilder({
  initialForm,
  onSave,
  onCancel,
}: Readonly<DynamicFormBuilderProps>) {
  const [formName, setFormName] = useState(
    initialForm?.name ?? "applicationCore"
  );
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [draggedFieldType, setDraggedFieldType] = useState<
    Field["type"] | null
  >(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const saveFeedbackTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const handleClose = () => setContextMenu(null);

    window.addEventListener("click", handleClose);
    window.addEventListener("resize", handleClose);
    window.addEventListener("scroll", handleClose, true);

    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [contextMenu]);

  useEffect(() => {
    return () => {
      if (saveFeedbackTimeout.current) {
        window.clearTimeout(saveFeedbackTimeout.current);
      }
    };
  }, []);

  const handleFieldDragStart = (type: Field["type"]) => {
    setDraggedFieldType(type);
  };

  const handleFieldReorderStart = (index: number) => {
    setDraggedFieldIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const clearDragState = () => {
    setDraggedFieldType(null);
    setDraggedFieldIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();

    if (draggedFieldType) {
      const newField = createField(draggedFieldType);
      const updatedFields = [...fields];
      updatedFields.splice(dropIndex, 0, newField);
      setFields(updatedFields);
      setSelectedField(newField);
    } else if (draggedFieldIndex !== null && draggedFieldIndex !== dropIndex) {
      const updatedFields = [...fields];
      const [movedField] = updatedFields.splice(draggedFieldIndex, 1);
      const targetIndex =
        draggedFieldIndex < dropIndex ? dropIndex - 1 : dropIndex;
      updatedFields.splice(targetIndex, 0, movedField);
      setFields(updatedFields);
    }

    clearDragState();
  };

  const addField = () => {
    const newField = { ...createField("text"), name: "New Field" };
    setFields((current) => [...current, newField]);
    setSelectedField(newField);
  };

  const deleteField = (index: number) => {
    const fieldToRemove = fields[index];
    const updatedFields = fields.filter(
      (_, fieldIndex) => fieldIndex !== index
    );
    setFields(updatedFields);

    if (selectedField?.id === fieldToRemove.id) {
      setSelectedField(null);
    }
  };

  const duplicateField = (index: number) => {
    const original = fields[index];
    const duplicated: Field = {
      ...original,
      id: generateFieldId(original.type),
      name: `${original.name} (Copy)`,
    };

    const updatedFields = [...fields];
    updatedFields.splice(index + 1, 0, duplicated);
    setFields(updatedFields);
    setSelectedField(duplicated);
  };

  const updateSelectedField = (updates: Partial<Field>) => {
    if (!selectedField) {
      return;
    }

    const updatedField = { ...selectedField, ...updates };
    setFields((current) =>
      current.map((field) =>
        field.id === selectedField.id ? updatedField : field
      )
    );
    setSelectedField(updatedField);
  };

  const exportJSON = () => {
    const output: FormConfig = {
      [formName]: {
        fields: fields.map((field) => ({
          ...field,
          fieldActions: field.fieldActions ?? [],
        })),
      },
    };

    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const json = JSON.parse(
            loadEvent.target?.result as string
          ) as FormConfig;
          const firstKey = Object.keys(json)[0];

          if (!firstKey || !json[firstKey]) {
            throw new Error("JSON must contain a top-level form name.");
          }

          const importedFields = json[firstKey].fields?.map((field) => ({
            ...field,
            fieldActions: field.fieldActions ?? [
              ...(DEFAULT_FIELD_ACTIONS[field.type] ?? []),
            ],
          }));

          if (!importedFields) {
            throw new Error("JSON form is missing a fields array.");
          }

          setFormName(firstKey);
          setFields(importedFields);
          setSelectedField(null);
        } catch (error) {
          console.error("Invalid JSON file", error);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const saveConfiguration = async () => {
    // Translate internal state to FormDTO
    const dto: FormDTO = {
      id: initialForm?.id,
      name: formName,
      version: initialForm?.version,
      json: {
        [formName]: {
          fields,
        },
      },
    };

    try {
      const saved = await createForm(dto);
      onSave?.({
        id: saved.id,
        name: saved.name,
        version: saved.version,
        json: saved.json as Record<string, unknown>,
      });
      setSaveFeedback(`Saved ${saved.name}@v${saved.version}`);
    } catch (e) {
      console.error(e);
      setSaveFeedback("Failed to save form");
    }

    if (saveFeedbackTimeout.current) {
      window.clearTimeout(saveFeedbackTimeout.current);
    }
    saveFeedbackTimeout.current = window.setTimeout(
      () => setSaveFeedback(null),
      2500
    );
  };

  const handleFieldContextMenu = (
    field: Field,
    index: number,
    position: { x: number; y: number }
  ) => {
    setSelectedField(field);
    const adjusted = adjustContextMenuPosition(position.x, position.y);
    setContextMenu({ field, index, position: adjusted });
  };

  return (
    <div className="dfb" role="application" onDragEnd={handleDragEnd}>
      <FieldPalette onFieldDragStart={handleFieldDragStart} />

      <div className="dfb__workspace">
        <div className="dfb__canvas">
          <div className="dfb__header">
            <div className="dfb__formname">
              <span className="dfb__badge">Form builder</span>
              <h1 className="dfb__heading">Dynamic form configuration</h1>
              <div className="dfb__formname-input">
                <label htmlFor="dfb-form-name">Form name</label>
                <Input
                  id="dfb-form-name"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="applicationCore"
                  aria-label="Form name"
                />
                <span className="dfb__formname-help">
                  This value becomes the top-level key in exported JSON.
                </span>
              </div>
            </div>

            <div className="dfb__actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={importJSON}
                className="dfb__actions-button dfb__actions-button--ghost"
              >
                <Upload size={16} />
                Import JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportJSON}
                className="dfb__actions-button dfb__actions-button--ghost"
              >
                <Download size={16} />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveConfiguration}
                className="dfb__actions-button dfb__actions-button--outline"
              >
                <Save size={16} />
                Save
              </Button>
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="dfb__actions-button dfb__actions-button--ghost"
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="dfb__actions-button dfb__actions-button--primary"
              >
                <Eye size={16} />
                Preview
              </Button>
            </div>

            {saveFeedback && (
              <output className="dfb__save-feedback" aria-live="polite">
                {saveFeedback}
              </output>
            )}
          </div>

          <FieldList
            fields={fields}
            selectedField={selectedField}
            onFieldSelect={setSelectedField}
            onFieldReorderStart={handleFieldReorderStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDeleteField={deleteField}
            onDuplicateField={duplicateField}
            onFieldContextMenu={handleFieldContextMenu}
            dragOverIndex={dragOverIndex}
          />

          <Button
            onClick={addField}
            variant="outline"
            className="dfb__add-button"
          >
            <Plus size={16} />
            Add Field
          </Button>
        </div>
      </div>

      <FieldInspector
        selectedField={selectedField}
        onUpdateField={updateSelectedField}
        onPreview={() => setIsPreviewOpen(true)}
      />

      {isPreviewOpen && (
        <dialog className="dfb-preview" open aria-label="Form preview">
          <button
            type="button"
            className="dfb-preview__backdrop"
            aria-label="Close preview"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="dfb-preview__panel">
            <div className="dfb-preview__heading">
              <h3 className="dfb-preview__title">{formName} preview</h3>
            </div>
            <p className="dfb-inspector__subtitle">
              Review how this configuration will export and appear to end users.
            </p>
            <div className="dfb-preview__fields">
              {fields.length ? (
                fields.map((field) => (
                  <div key={field.id} className="dfb-preview__field">
                    <h5>{field.name}</h5>
                    <div>
                      {field.data && (
                        <p className="dfb-inspector__hint">
                          Path: {field.data}
                        </p>
                      )}
                      <p className="dfb-inspector__hint">ID: {field.id}</p>
                      {!!field.fieldActions.length && (
                        <p className="dfb-inspector__hint">
                          Actions: {field.fieldActions.join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="dfb-preview__field-type">
                      {field.type}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <p className="dfb-inspector__hint">
                    No fields yet. Add a field to preview the layout.
                  </p>
                </div>
              )}
            </div>
            <div className="dfb-preview__footer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="dfb__actions-button dfb__actions-button--ghost"
              >
                Close
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  exportJSON();
                  setIsPreviewOpen(false);
                }}
                className="dfb__actions-button dfb__actions-button--primary"
              >
                <Download size={16} />
                Export JSON
              </Button>
            </div>
          </div>
        </dialog>
      )}

      {contextMenu && (
        <FieldContextMenu
          position={contextMenu.position}
          onEdit={() => {
            setSelectedField(contextMenu.field);
            setContextMenu(null);
          }}
          onDuplicate={() => {
            duplicateField(contextMenu.index);
            setContextMenu(null);
          }}
          onDelete={() => {
            deleteField(contextMenu.index);
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}

export default DynamicFormBuilder;
