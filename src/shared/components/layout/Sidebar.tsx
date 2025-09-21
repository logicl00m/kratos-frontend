// src/shared/components/layout/Sidebar.tsx
import { useState, useEffect } from "react";
import { Menu, X, Home, FileText, Settings, Users, BarChart3, Workflow, PlayCircle, PlusCircle } from "lucide-react";

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

const Sidebar = ({ collapsed = false, onCollapseChange, mobile = false, onNavigate }: SidebarProps) => {
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
    { id: "applications", label: "Applications", icon: <FileText size={20} /> },
    { id: "running", label: "Running Workflows", icon: <PlayCircle size={20} /> },
    { id: "builder", label: "Workflow Builder", icon: <PlusCircle size={20} /> },
    { id: "viewer", label: "Workflow Viewer", icon: <Workflow size={20} /> },
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

  const sidebarStyle = mobile ? {
    width: "240px",
    backgroundColor: "#1e293b",
    height: "100vh",
    position: "fixed" as const,
    left: isCollapsed ? "-240px" : "0",
    top: 0,
    zIndex: 100,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    transition: "left 0.3s ease",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
  } : {
    width: isCollapsed ? "64px" : "240px",
    transition: "width 0.3s ease",
    backgroundColor: "#1e293b",
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
        <div 
          className="sidebar-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99,
          }}
          onClick={toggleSidebar}
        />
      )}
      <aside 
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${mobile ? "mobile" : ""}`}
        style={sidebarStyle}
      >
        <div 
          className="sidebar-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            height: "64px",
          }}
        >
          {!isCollapsed && (
            <div className="logo" style={{ 
              fontWeight: 600, 
              fontSize: "18px",
              color: "white"
            }}>
              Kratos Workflow
            </div>
          )}
          <button
            className="toggle-btn"
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.7)",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            {isCollapsed && !mobile ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav 
          className="sidebar-nav"
          style={{ 
            flex: 1, 
            overflowY: "auto",
            padding: "8px 0"
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`nav-item ${isCollapsed ? "collapsed" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    textDecoration: "none",
                    color: "rgba(255, 255, 255, 0.9)",
                    transition: "background-color 0.2s",
                    margin: "4px 8px",
                    borderRadius: "8px",
                    width: "calc(100% - 16px)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <span 
                    className="nav-icon"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "24px",
                    }}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span 
                      className="nav-label"
                      style={{ 
                        marginLeft: "12px",
                        fontSize: "15px",
                        fontWeight: 500
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div 
          className="sidebar-footer"
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          {!isCollapsed && (
            <div className="footer-content">
              <div>Workflow Manager</div>
              <div style={{ marginTop: "4px", opacity: 0.7 }}>v1.0.0</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;