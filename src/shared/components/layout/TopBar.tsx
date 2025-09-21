// src/shared/components/layout/TopBar.tsx
import type { ReactNode } from "react";
import { Menu, Bell, User, Search, Home } from "lucide-react";
import "./TopBar.css";

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
  onNavigate
}) => {
  return (
    <header 
      className="app-header topbar"
    >
      <div
        className="header-left"
      >
        {showMenuButton && (
          <button
            className="menu-toggle"
            onClick={onMenuToggle}
          >
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
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <h1 className="header-title">
          {title}
        </h1>
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
      
      <div 
        className="header-controls"
      >
        {right}
        
        <button
          className="icon-button"
        >
          <Bell size={20} />
        </button>
        
        <button
          className="icon-button"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
