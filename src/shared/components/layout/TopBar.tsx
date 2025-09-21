// src/shared/components/layout/TopBar.tsx
import type { ReactNode } from "react";
import { Menu, Bell, User, Search } from "lucide-react";
import "./TopBar.css";

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
