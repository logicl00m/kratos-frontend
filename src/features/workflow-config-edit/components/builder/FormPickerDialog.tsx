import React, { useEffect, useRef, useState } from "react";
import { searchForms } from "@features/workflow-config-edit/services/formsApi";

export interface FormPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (form: { id: string; name: string; version: number }) => void;
}

export const FormPickerDialog: React.FC<FormPickerDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; name: string; version: number }>
  >([]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const r = await searchForms(query);
        if (!cancelled) setResults(r);
      } catch {
        if (!cancelled) setResults([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <dialog ref={dialogRef} aria-label="Attach form">
      <form
        method="dialog"
        style={{
          display: "flex",
          gap: 12,
          flexDirection: "column",
          minWidth: 420,
        }}
      >
        <h3 style={{ margin: 0 }}>Attach an existing form</h3>
        <label htmlFor="form-search">Search forms</label>
        <input
          id="form-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a form name..."
        />
        <div
          style={{
            maxHeight: 260,
            overflow: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 8,
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {results.map((f) => (
              <li
                key={`${f.id}@${f.version}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 4px",
                }}
              >
                <span>
                  {f.name}@v{f.version}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(f);
                    onClose();
                  }}
                >
                  Select
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li style={{ padding: "8px 4px", color: "#6b7280" }}>
                No results
              </li>
            )}
          </ul>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </form>
    </dialog>
  );
};
