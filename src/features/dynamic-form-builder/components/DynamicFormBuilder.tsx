import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload, Plus } from 'lucide-react';
import FieldPalette from './FieldPalette';
import FieldList from './FieldList';
import FieldInspector from './FieldInspector';
import type { Field, FormConfig } from '../types/form-builder.types';
import '../dynamic-form-builder.css';

export function DynamicFormBuilder() {
  const [formName, setFormName] = useState('applicationCore');
  const [fields, setFields] = useState<Field[]>([
    {
      id: 'borrower_legal_name',
      name: 'Legal Name',
      type: 'text',
      status: 'default',
      data: '{{ data.borrower.legalName }}',
      fieldActions: ['save', 'validate'],
    },
    {
      id: 'borrower_birthdate',
      name: 'Birthdate',
      type: 'date',
      status: 'default',
      data: '{{ data.borrower.birthdate }}',
      fieldActions: ['save', 'validate'],
    },
    {
      id: 'borrower_document',
      name: 'Document Upload',
      type: 'file',
      status: 'default',
      data: '{{ data.borrower.documents[0] }}',
      fieldActions: ['upload', 'replace', 'validate'],
    },
  ]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [draggedFieldType, setDraggedFieldType] = useState<string | null>(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFieldDragStart = (type: string) => {
    setDraggedFieldType(type);
  };

  const handleFieldReorderStart = (index: number) => {
    setDraggedFieldIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedFieldType(null);
    setDraggedFieldIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedFieldType) {
      const newField: Field = {
        id: `field_${Date.now()}`,
        name: `New ${draggedFieldType} Field`,
        type: draggedFieldType as Field['type'],
        status: 'default',
        data: '{{ data.field }}',
        fieldActions:
          draggedFieldType === 'file'
            ? ['upload', 'validate']
            : ['save', 'validate'],
      };

      const newFields = [...fields];
      newFields.splice(dropIndex, 0, newField);
      setFields(newFields);
      setSelectedField(newField);
    } else if (draggedFieldIndex !== null && draggedFieldIndex !== dropIndex) {
      const newFields = [...fields];
      const [movedField] = newFields.splice(draggedFieldIndex, 1);
      const adjustedIndex =
        draggedFieldIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newFields.splice(adjustedIndex, 0, movedField);
      setFields(newFields);
    }

    handleDragEnd();
  };

  const addField = () => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'text',
      status: 'default',
      data: '{{ data.field }}',
      fieldActions: ['save', 'validate'],
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const deleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    if (selectedField === fields[index]) {
      setSelectedField(null);
    }
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = fields[index];
    const newField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}`,
      name: `${fieldToDuplicate.name} (Copy)`,
    };
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    setFields(newFields);
  };

  const updateSelectedField = (updates: Partial<Field>) => {
    if (!selectedField) return;

    const updatedField = { ...selectedField, ...updates };
    const newFields = fields.map((field) =>
      field.id === selectedField.id ? updatedField : field,
    );
    setFields(newFields);
    setSelectedField(updatedField);
  };

  const exportJSON = () => {
    const output: FormConfig = {
      [formName]: {
        fields: fields.map((field) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          status: field.status,
          data: field.data,
          fieldActions: field.fieldActions,
          validation: field.validation,
          helpText: field.helpText,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const json = JSON.parse(loadEvent.target?.result as string);
          const firstKey = Object.keys(json)[0];
          if (firstKey && json[firstKey].fields) {
            setFormName(firstKey);
            setFields(json[firstKey].fields);
            setSelectedField(null);
          }
        } catch (error) {
          console.error('Invalid JSON file', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="dfb" onDragEnd={handleDragEnd}>
      <FieldPalette onFieldDragStart={handleFieldDragStart} />

      <div className="dfb__workspace">
        <div className="dfb__canvas">
          <div className="dfb__header">
            <div className="dfb__formname">
              <h2>Dynamic Form Builder</h2>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Form name"
                style={{ width: 192 }}
              />
              <span className="dfb__formname-help">
                This name becomes the top-level key in exported JSON.
              </span>
            </div>
            <div className="dfb__actions">
              <Button variant="outline" size="sm" onClick={importJSON}>
                <Upload size={16} style={{ marginRight: 6 }} />
                Import JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportJSON}>
                <Download size={16} style={{ marginRight: 6 }} />
                Export JSON
              </Button>
              <Button variant="outline" size="sm">
                Save to Library
              </Button>
              <Button size="sm">Preview</Button>
            </div>
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
            dragOverIndex={dragOverIndex}
          />

          <Button
            onClick={addField}
            variant="outline"
            className="dfb__add-button"
          >
            <Plus size={16} style={{ marginRight: 6 }} />
            Add Field
          </Button>
        </div>
      </div>

      <FieldInspector
        selectedField={selectedField}
        onUpdateField={updateSelectedField}
      />
    </div>
  );
}

