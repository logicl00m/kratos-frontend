/*
PROMPT (Copilot/GPT-5): Context menu item for forms

- Add menu item “Attach / Edit form” when the target is a process node.
- Calls onOpenFormConfig(nodeId).
- Keyboard support: Enter/Space to trigger; aria-haspopup="dialog".
*/
// src/features/workflow/components/builder/ContextMenu.tsx
import React, { useEffect, useRef } from "react";
import { Copy, Trash2, Edit3, Users } from "lucide-react";
import "./ContextMenu.css";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onAssignPeople?: () => void;
  onOpenFormConfig?: (nodeId: string) => void; // Added for form config
  nodeId?: string; // Added to identify the node
  isNode?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onDuplicate,
  onDelete,
  onRename,
  onAssignPeople,
  onOpenFormConfig, // Destructure form config prop
  nodeId, // Receive nodeId
  isNode = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      // set CSS custom properties for positioning
      style={(() => {
        const cssVars = {
          ["--ctx-left"]: `${x}px`,
          ["--ctx-top"]: `${y}px`,
        } as unknown as React.CSSProperties;
        return cssVars;
      })()}
      role="menu"
      aria-label={isNode ? "Node context menu" : "Edge context menu"}
    >
      {isNode && (
        <>
          <button
            className="context-menu-item"
            onClick={() => {
              onAssignPeople?.();
              onClose();
            }}
            role="menuitem"
          >
            <Users size={14} />
            Assign people...
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              onRename?.();
              onClose();
            }}
            role="menuitem"
          >
            <Edit3 size={14} />
            Rename state
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              onDuplicate?.();
              onClose();
            }}
            role="menuitem"
          >
            <Copy size={14} />
            Duplicate
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              if (nodeId && onOpenFormConfig) {
                onOpenFormConfig(nodeId);
              }
              onClose();
            }}
            role="menuitem"
            aria-haspopup="dialog"
          >
            Attach / Edit form
          </button>
        </>
      )}
      <button
        className="context-menu-item delete"
        onClick={() => {
          onDelete?.();
          onClose();
        }}
        role="menuitem"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
};

export default ContextMenu;
