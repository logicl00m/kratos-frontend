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
      style={{ left: x, top: y }}
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

