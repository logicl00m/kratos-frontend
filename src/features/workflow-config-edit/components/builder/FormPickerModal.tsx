import React, { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { getAllForms } from "@features/workflow-config-edit/services/formsApi";
import "./FormPickerModal.css";

export interface FormPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (form: { id: string; name: string; version: number }) => void;
  title?: string;
  placeholder?: string;
}

export const FormPickerModal: React.FC<FormPickerModalProps> = ({
  open,
  onClose,
  onSelect,
  title = "Attach Form",
  placeholder = "Search for forms...",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; name: string; version: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  // Cache of all forms fetched on modal open
  const [allForms, setAllForms] = useState<
    Array<{ id: string; name: string; version: number }>
  >([]);

  // Handle modal visibility
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Focus the search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      // Fetch and cache all forms once when modal opens
      (async () => {
        setLoading(true);
        try {
          const forms = await getAllForms();
          const normalized = Array.isArray(forms)
            ? forms.map((f: any) => ({
                id: f?.id ?? String(f?.formId ?? ""),
                name: f?.name ?? f?.formName ?? f?.title ?? "",
                version: typeof f?.version === "number" ? f.version : 1,
              }))
            : [];
          setAllForms(normalized);
          // If there is an existing query, initialize results
          if (query.trim()) {
            const q = query.trim().toLowerCase();
            setResults(
              normalized.filter((it) =>
                (it.name ?? "").toLowerCase().includes(q)
              )
            );
          } else {
            setResults([]);
          }
        } catch (err) {
          console.error("Failed to fetch forms on modal open:", err);
          setAllForms([]);
          setResults([]);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
      setAllForms([]);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle backdrop keyboard events
  const handleBackdropKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }
  };

  // Search forms
  useEffect(() => {
    let cancelled = false;

    const searchForForms = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Filter cached forms instead of calling remote search
        const q = query.trim().toLowerCase();
        const filtered = allForms.filter((f) =>
          (f?.name ?? "").toLowerCase().includes(q)
        );
        if (!cancelled) setResults(filtered);
      } catch (error) {
        console.error("Error searching forms:", error);
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchForForms, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, allForms]);

  const handleFormSelect = (form: {
    id: string;
    name: string;
    version: number;
  }) => {
    onSelect(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="form-picker-modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-picker-modal-title"
      tabIndex={-1}
    >
      <div ref={modalRef} className="form-picker-modal">
        <div className="form-picker-modal-header">
          <h2 id="form-picker-modal-title" className="form-picker-modal-title">
            {title}
          </h2>
          <button
            className="form-picker-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="form-picker-modal-body">
          <div className="form-picker-search">
            <Search size={16} className="form-picker-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="form-picker-search-input"
            />
          </div>

          <div className="form-picker-results">
            {loading && (
              <div className="form-picker-loading">Searching forms...</div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="form-picker-no-results">
                No forms found for "{query}"
              </div>
            )}

            {!loading && query && results.length > 0 && (
              <div className="form-picker-results-list">
                {results.map((form) => (
                  <div
                    key={`${form.id}@${form.version}`}
                    className="form-picker-result-item"
                  >
                    <div className="form-picker-result-info">
                      <span className="form-picker-result-name">
                        {form.name}
                      </span>
                      <span className="form-picker-result-version">
                        v{form.version}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFormSelect(form)}
                      className="form-picker-result-select"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!query && (
              <div className="form-picker-empty-state">
                <Search size={48} className="form-picker-empty-icon" />
                <p>Start typing to search for forms</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-picker-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="form-picker-modal-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormPickerModal;
