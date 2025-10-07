// src/shared/components/layout/Sidebar.tsx
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  FileText,
  Settings,
  Users,
  BarChart3,
  Workflow,
  PlayCircle,
  PlusCircle,
} from "lucide-react";
import "./Sidebar.css";

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

type SidebarProps = {
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  mobile?: boolean;
  onNavigate?: (id: string) => void;
};

const Sidebar = ({
  collapsed = false,
  onCollapseChange,
  mobile = false,
  onNavigate,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const sidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    {
      id: "create-workflow",
      label: "Create Workflow",
      icon: <PlusCircle size={20} />,
    },
    {
      id: "running",
      label: "Running Workflows",
      icon: <PlayCircle size={20} />,
    },
    {
      id: "builder",
      label: "Workflow Builder",
      icon: <PlusCircle size={20} />,
    },
    { id: "form-builder", label: "Form Builder", icon: <FileText size={20} /> },
    { id: "viewer", label: "Workflow Viewer", icon: <Workflow size={20} /> },
    { id: "workflow-clone", label: "Workflow Clone", icon: <Workflow size={20} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const handleItemClick = (itemId: string) => {
    onNavigate?.(itemId);
    if (mobile) {
      toggleSidebar();
    }
  };

  const sidebarStyle = mobile
    ? {
        left: isCollapsed ? "-240px" : "0",
      }
    : {
        transition: "width 0.3s ease",
        height: "100vh",
        position: "fixed" as const,
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column" as const,
      };

  return (
    <>
      {mobile && !isCollapsed && (
        <div className="sidebar-backdrop" onClick={toggleSidebar} />
      )}
      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          mobile ? "mobile" : ""
        }`}
        style={sidebarStyle}
      >
        <div className="sidebar-header">
          {!isCollapsed && <div className="logo">Kratos Workflow</div>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed && !mobile ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`nav-item ${isCollapsed ? "collapsed" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="footer-content">
              <div>Workflow Manager</div>
              <div className="footer-content">v1.0.0</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
