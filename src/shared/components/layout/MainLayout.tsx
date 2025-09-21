// src/shared/components/layout/MainLayout.tsx
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

type MainLayoutProps = {
  children: ReactNode;
  title?: string;
  onNavigate?: (viewId: string) => void;
  topBarControls?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  hideFooter?: boolean;
  fullHeight?: boolean;
};

const MainLayout = ({
  children,
  title = "Workflow Manager",
  onNavigate,
  topBarControls,
  searchValue,
  onSearchChange,
  showSearch = false,
  hideFooter = false,
  fullHeight = false,
}: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div
      className="app-shell"
      style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
        mobile={isMobile}
        onNavigate={onNavigate}
      />

      <div
        className="main-content"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: (() => {
            if (isMobile) return 0;
            return sidebarCollapsed ? "64px" : "240px";
          })(),
          transition: "margin-left 0.3s ease",
          minWidth: 0,
        }}
      >
        <TopBar
          title={title}
          right={topBarControls}
          onMenuToggle={handleMenuToggle}
          // Only show the menu (hamburger) button on mobile to avoid duplication
          showMenuButton={isMobile}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          showSearch={showSearch}
        />

        <main
          className="content"
          style={{
            flex: 1,
            padding: fullHeight ? 0 : "24px",
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
