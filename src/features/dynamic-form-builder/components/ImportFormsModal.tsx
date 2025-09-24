import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileJson, Calendar, User } from "lucide-react";
import { getAllForms } from "@features/workflow-config-edit/services/formsApi";
import type { Field } from "../types/form-builder.types";
import { useTheme } from "@/contexts/ThemeContext";
import "./ImportFormsModal.css";

interface ImportFormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (fields: Field[], formName: string) => void;
}

interface FormData {
  id: string;
  formName: string;
  configJson: any;
  createdAt?: string;
  createdBy?: string;
}

export function ImportFormsModal({
  isOpen,
  onClose,
  onImport,
}: ImportFormsModalProps) {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      fetchForms();
    }
  }, [isOpen]);

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllForms();
      setForms(data);
    } catch (err) {
      setError("Failed to load existing forms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!selectedForm?.configJson) return;

    try {
      let formName = selectedForm.formName || "importedForm";
      let fields: Field[] = [];

      if (typeof selectedForm.configJson === "object") {
        const formKeys = Object.keys(selectedForm.configJson);
        if (formKeys.length > 0) {
          formName = formKeys[0];
          const formData = selectedForm.configJson[formName];

          if (formData?.fields && Array.isArray(formData.fields)) {
            fields = formData.fields.map((field: any) => ({
              id:
                field.id ||
                `field_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              name: field.name || "Unnamed Field",
              type: field.type || "text",
              status: field.status || "default",
              data: field.data || "",
              fieldActions: field.fieldActions || [],
              validation: field.validation,
              helpText: field.helpText,
              options: field.options,
            }));
          }
        }
      }

      if (fields.length > 0) {
        onImport(fields, formName);
        onClose();
      } else {
        setError("No valid fields found in the selected form");
      }
    } catch (err) {
      setError("Failed to parse form data");
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-theme={theme}
        className={`max-h-[70vh] import-forms-modal ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <DialogHeader className="import-forms-modal-header">
          <DialogTitle className="import-forms-modal-title">
            Import from Existing Forms
          </DialogTitle>
          <DialogDescription className="import-forms-modal-description">
            Select a form from existing workflows to import its field
            configuration
          </DialogDescription>
        </DialogHeader>

        <div className="import-forms-modal-body">
          {loading && (
            <div className="import-forms-modal-loading">
              <Loader2
                className="animate-spin import-forms-modal-loading-icon"
                size={32}
              />
              <span className="import-forms-modal-loading-text">
                Loading existing forms...
              </span>
            </div>
          )}

          {error && <div className="import-forms-modal-error">{error}</div>}

          {!loading && !error && (
            <>
              <ScrollArea className="import-forms-modal-scrollarea">
                {forms.length === 0 ? (
                  <div className="import-forms-modal-empty-state">
                    No existing forms found
                  </div>
                ) : (
                  <div className="import-forms-modal-form-list">
                    {forms.map((form) => {
                      let fieldCount = 0;
                      if (form.configJson) {
                        const formKeys = Object.keys(form.configJson);
                        if (formKeys.length > 0) {
                          const formData = form.configJson[formKeys[0]];
                          fieldCount = formData?.fields?.length || 0;
                        }
                      }

                      return (
                        <div
                          key={form.id}
                          onClick={() => setSelectedForm(form)}
                          className={`import-forms-modal-form-item ${
                            selectedForm?.id === form.id ? "selected" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="import-forms-modal-form-icon-wrapper">
                                <FileJson size={24} />
                              </div>
                              <div className="import-forms-modal-form-content">
                                <h4 className="import-forms-modal-form-name">
                                  {form.formName}
                                </h4>
                                <div className="import-forms-modal-form-meta">
                                  <span className="import-forms-modal-form-meta-item">
                                    <FileJson size={14} />
                                    <span>{fieldCount} fields</span>
                                  </span>
                                  {form.createdAt && (
                                    <div className="import-forms-modal-form-meta-item">
                                      <Calendar size={14} />
                                      <span>
                                        {new Date(
                                          form.createdAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {form.createdBy && (
                                    <div className="import-forms-modal-form-meta-item">
                                      <User size={14} />
                                      <span>{form.createdBy}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="import-forms-modal-form-id">
                              {form.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <div className="import-forms-modal-footer">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="import-forms-modal-cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!selectedForm}
                  className="import-forms-modal-import-btn"
                >
                  Import Selected Form
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
