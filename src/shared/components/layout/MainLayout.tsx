// src/shared/components/layout/MainLayout.tsx
import { useState, ReactNode, useEffect } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

type MainLayoutProps = {
  children: ReactNode;
  title?: string;
  showMenuButton?: boolean;
  topBarControls?: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarCollapseChange?: (collapsed: boolean) => void;
  hideFooter?: boolean;
  fullHeight?: boolean;
};

const MainLayout = ({ 
  children, 
  title = "Workflow Manager",
  showMenuButton = true,
  topBarControls,
  sidebarCollapsed = false,
  onSidebarCollapseChange,
  hideFooter = false,
  fullHeight = false
}: MainLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        onSidebarCollapseChange?.(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    onSidebarCollapseChange?.(!sidebarCollapsed);
  };

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapseChange={onSidebarCollapseChange} 
        mobile={isMobile}
      />
      
      <div 
        className="main-content"
        style={{ 
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? "64px" : "240px"),
          transition: "margin-left 0.3s ease",
          minWidth: 0,
        }}
      >
        <TopBar 
          title={title}
          right={topBarControls}
          onMenuToggle={handleMenuToggle}
          showMenuButton={showMenuButton}
        />
        
        <main 
          className="content"
          style={{ 
            flex: 1,
            padding: fullHeight ? 0 : "0 24px 24px",
            overflow: fullHeight ? "hidden" : "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {children}
        </main>
        
        {!hideFooter && <Footer />}
      </div>
    </div>
  );
};

export default MainLayout;