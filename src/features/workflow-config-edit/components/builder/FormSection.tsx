import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  Check,
  Plus,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { getAllForms } from "@features/workflow-config-edit/services/formsApi";
import type { FormRef } from "@features/workflow-config-edit/types/builder.types";
import "./FormSection.css";

interface FormSectionProps {
  form?: FormRef;
  requireFormToTransition?: boolean;
  onFormSelect: (form: { id: string; name: string; version: number }) => void;
  onBindingChange: (binding: "pinned" | "latest") => void;
  onRequireChange: (required: boolean) => void;
  onCreateNew: () => void;
}

export const FormSection: React.FC<FormSectionProps> = ({
  form,
  requireFormToTransition = false,
  onFormSelect,
  onBindingChange,
  onRequireChange,
  onCreateNew,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [forms, setForms] = useState<
    Array<{ id: string; name: string; version: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Cache of normalized forms fetched when dropdown opens
  const [allForms, setAllForms] = useState<Array<{ id: string; name: string; version: number }>>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadAndFilter = async () => {
      setLoading(true);
      try {
        // Fetch all forms once when dropdown opens
        if (isOpen && allForms.length === 0) {
          const raw = await getAllForms();
          const normalized = Array.isArray(raw)
            ? raw.map((f: any) => ({
                id: f?.id ?? String(f?.formId ?? ""),
                name: f?.name ?? f?.formName ?? f?.title ?? "",
                version: typeof f?.version === "number" ? f.version : 1,
              }))
            : [];
          if (!cancelled) setAllForms(normalized);
        }

        // Use cached normalized list and filter locally
        const source = allForms.length > 0 ? allForms : [];
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const filtered = source.filter((s) => s.name.toLowerCase().includes(q));
          if (!cancelled) setForms(filtered);
        } else {
          if (!cancelled) setForms(source);
        }
      } catch (error) {
        console.error("Failed to load forms:", error);
        if (!cancelled) setForms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (isOpen) {
      loadAndFilter();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isOpen]);

  const displayValue = form ? `${form.name}@v${form.version}` : "";

  return (
    <div className="form-section">
      <div className="section-header">
        <h4 className="section-title">
          <FileText size={14} />
          <span>Form Configuration</span>
        </h4>
      </div>

      <div className="form-field">
        <label>Attach Form</label>
        <div className="form-select" ref={dropdownRef}>
          <button
            className={`form-select-trigger ${form ? "has-value" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="select-content">
              <Search size={14} className="select-icon" />
              <span className="select-value">
                {form ? displayValue : "Select a form"}
              </span>
            </div>
            <div className="select-indicators">
              {form && <Check size={14} className="check-icon" />}
              <ChevronDown
                size={14}
                className={`chevron ${isOpen ? "open" : ""}`}
              />
            </div>
          </button>

          {isOpen && (
            <div className="form-dropdown">
              <div className="dropdown-header">
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dropdown-search"
                  autoFocus
                />
              </div>

              <div className="dropdown-content">
                {loading ? (
                  <div className="dropdown-loading">Loading forms...</div>
                ) : forms.length > 0 ? (
                  <div className="form-options">
                    {forms.map((f) => (
                      <button
                        key={f.id}
                        className={`form-option ${
                          form?.id === f.id ? "selected" : ""
                        }`}
                        onClick={() => {
                          onFormSelect(f);
                          setIsOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <span className="option-name">
                          {f.name}@v{f.version}
                        </span>
                        {form?.id === f.id && (
                          <Check size={14} className="option-check" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="dropdown-empty">
                    <FileText size={20} />
                    <span>No forms found</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {!form && (
          <div className="field-warning">
            <AlertCircle size={12} />
            <span>No form attached - workflow may not function correctly</span>
          </div>
        )}
      </div>

      {form && (
        <>
          <div className="form-field">
            <label>Version Binding</label>
            <div className="binding-options">
              <label className="binding-option">
                <input
                  type="radio"
                  name="binding"
                  checked={form.binding === "pinned"}
                  onChange={() => onBindingChange("pinned")}
                />
                <div className="option-content">
                  <span className="option-label">Pinned</span>
                  <span className="option-desc">
                    Use version {form.version}
                  </span>
                </div>
              </label>
              <label className="binding-option">
                <input
                  type="radio"
                  name="binding"
                  checked={form.binding === "latest"}
                  onChange={() => onBindingChange("latest")}
                />
                <div className="option-content">
                  <span className="option-label">Track Latest</span>
                  <span className="option-desc">Auto-update</span>
                </div>
              </label>
            </div>
            {form.binding === "latest" && (
              <div className="field-info">
                <AlertCircle size={12} />
                <span>
                  Tracking latest may cause non-deterministic behavior
                </span>
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={requireFormToTransition}
                onChange={(e) => onRequireChange(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-label">
                Require valid form to transition
              </span>
            </label>
          </div>
        </>
      )}

      <button className="create-form-btn" onClick={onCreateNew}>
        <Plus size={14} />
        <span>Create New Form</span>
      </button>
    </div>
  );
};
