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
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import from Existing Forms</DialogTitle>
          <DialogDescription>
            Select a form from existing workflows to import its field
            configuration
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-2" size={24} />
              <span>Loading existing forms...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                {forms.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No existing forms found
                  </div>
                ) : (
                  <div className="space-y-2">
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
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent ${
                            selectedForm?.id === form.id
                              ? "border-primary bg-accent"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <FileJson className="mt-1" size={20} />
                              <div>
                                <h4 className="font-medium">{form.formName}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>{fieldCount} fields</span>
                                  {form.createdAt && (
                                    <div className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      <span>
                                        {new Date(
                                          form.createdAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {form.createdBy && (
                                    <div className="flex items-center gap-1">
                                      <User size={14} />
                                      <span>{form.createdBy}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {form.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!selectedForm}>
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
