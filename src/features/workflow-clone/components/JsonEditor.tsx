// src/features/workflow/components/JsonEditor.tsx
import React, { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import "./JsonEditor.css";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  error: string | null;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  onApply,
  error,
}) => {
  const [isValid, setIsValid] = useState(() => {
    if (!value?.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    try {
      if (newValue.trim()) {
        JSON.parse(newValue);
        setIsValid(true);
      }
    } catch {
      setIsValid(false);
    }
  };

  return (
    <div className="json-editor">
      <div className="json-editor-header">
        <h3 className="json-editor-title">Workflow JSON</h3>
        <button
          onClick={onApply}
          disabled={!isValid}
          className={`json-editor-apply ${isValid ? "valid" : "invalid"}`}
        >
          <Check size={14} />
          Apply Changes
        </button>
      </div>

      <div className="json-editor-body">
        <textarea
          value={value}
          onChange={handleChange}
          className="json-editor-textarea"
          spellCheck={false}
        />

        {!isValid && (
          <div className="json-editor-error">
            <AlertCircle size={14} />
            Invalid JSON syntax
          </div>
        )}

        {error && <div className="json-editor-server-error">{error}</div>}
      </div>
    </div>
  );
};

export default JsonEditor;
