// src/shared/components/layout/TopBar.tsx
import type { ReactNode } from "react";
<<<<<<< Updated upstream

type TopBarProps = { title: string; right?: ReactNode };

const TopBar: React.FC<TopBarProps> = ({ title, right }) => {
  return (
    <header className="app-header">
      <h1>{title}</h1>
      <div className="header-controls">{right}</div>
=======
import { Menu, Bell, User, Search } from "lucide-react";

type TopBarProps = { 
  title: string; 
  right?: ReactNode;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
};

const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  right, 
  onMenuToggle,
  showMenuButton = false,
  searchValue,
  onSearchChange,
  showSearch = false
}) => {
  return (
    <header 
      className="app-header topbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        borderBottom: "1px solid var(--stroke)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
        position: "sticky",
        top: 0,
        zIndex: 90,
      }}
    >
      <div 
        className="header-left"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "16px",
          flex: showSearch ? "0 0 auto" : 1,
        }}
      >
        {showMenuButton && (
          <button
            className="menu-toggle"
            onClick={onMenuToggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--stroke)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Menu size={20} />
          </button>
        )}
        <h1 style={{ 
          margin: 0, 
          fontSize: "18px", 
          fontWeight: 600,
          color: "var(--text)",
          whiteSpace: "nowrap"
        }}>
          {title}
        </h1>
      </div>

      {showSearch && (
        <div style={{ 
          flex: "1 1 auto", 
          maxWidth: "400px", 
          margin: "0 24px",
          position: "relative"
        }}>
          <Search style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            width: "18px",
            height: "18px"
          }} />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchValue || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "white",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      )}
      
      <div 
        className="header-controls"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          flex: "0 0 auto"
        }}
      >
        {right}
        
        <button
          className="icon-button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--stroke)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Bell size={20} />
        </button>
        
        <button
          className="icon-button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--stroke)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <User size={20} />
        </button>
      </div>
>>>>>>> Stashed changes
    </header>
  );
};

export default TopBar;
