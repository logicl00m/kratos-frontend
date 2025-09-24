// src/shared/components/layout/TopBar.tsx
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Menu,
  Bell,
  User,
  Search,
  Home,
  Plus,
  FileText,
  Workflow,
  FormInput,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CreateWorkflowModal from "@/shared/components/modals/CreateWorkflowModal";
import "./TopBar.css";

// Create New Dropdown Component
const CreateNewDropdown: React.FC<{ onNavigate: (itemId: string) => void }> = ({
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      id: "create-workflow",
      label: "Create New Workflow",
      icon: <Workflow className="w-4 h-4" />,
      description: "Start from a template",
    },
    {
      id: "builder",
      label: "Create Workflow Template",
      icon: <FileText className="w-4 h-4" />,
      description: "Build a custom template",
    },
    {
      id: "form-builder",
      label: "Create New Form",
      icon: <FormInput className="w-4 h-4" />,
      description: "Design a dynamic form",
    },
  ];

  const handleItemClick = (itemId: string) => {
    setIsOpen(false);
    
    if (itemId === "create-workflow") {
      // Open the modal instead of navigating directly
      setIsModalOpen(true);
    } else {
      // For other items, use the original navigation
      onNavigate(itemId);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="create-new-button"
          aria-label="Create new"
        >
          <Plus size={20} />
          <span className="create-new-text">Create New</span>
        </button>

        {isOpen && (
          <div className="create-new-dropdown">
            <div className="dropdown-content">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="dropdown-item"
                >
                  <div className="dropdown-item-icon">{item.icon}</div>
                  <div className="dropdown-item-text">
                    <div className="dropdown-item-label">{item.label}</div>
                    <div className="dropdown-item-description">
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className="dropdown-item-chevron" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

type TopBarProps = {
  title: string;
  right?: ReactNode;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  onNavigate?: (viewId: string) => void;
};

const TopBar: React.FC<TopBarProps> = ({
  title,
  right,
  onMenuToggle,
  showMenuButton = false,
  searchValue,
  onSearchChange,
  showSearch = false,
  onNavigate,
}) => {
  return (
    <header className="app-header topbar">
      <div className="header-left">
        {showMenuButton && (
          <button className="menu-toggle" onClick={onMenuToggle}>
            <Menu size={20} />
          </button>
        )}
        <button
          className="home-button"
          onClick={() => onNavigate?.("dashboard")}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            padding: "10px 20px",
            marginLeft: showMenuButton ? "8px" : "0",
            marginRight: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(102, 126, 234, 0.4)";
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      {showSearch && (
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchValue || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      <div className="header-controls">
        {right}

        {/* Add Create New Dropdown */}
        {onNavigate && <CreateNewDropdown onNavigate={onNavigate} />}

        <ThemeToggle />

        <button className="icon-button">
          <Bell size={20} />
        </button>

        <button className="icon-button">
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
