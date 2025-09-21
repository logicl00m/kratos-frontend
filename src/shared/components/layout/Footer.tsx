// src/shared/components/layout/Footer.tsx
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="app-footer"
      style={{
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e5e7eb",
        padding: "16px",
        textAlign: "center",
        fontSize: "14px",
        color: "#6b7280",
        marginTop: "auto",
      }}
    >
      <div 
        className="footer-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <span>© {currentYear} Kratos Workflow Manager</span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span>Made with <Heart size={14} style={{ color: "#ef4444", display: "inline", verticalAlign: "middle" }} /> for efficient workflows</span>
      </div>
    </footer>
  );
};

export default Footer;