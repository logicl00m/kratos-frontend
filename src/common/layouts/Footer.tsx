// src/shared/components/layout/Footer.tsx
import { Heart } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="app-footer"
    >
      <div 
        className="footer-content"
      >
        <span>© {currentYear} Kratos Workflow Manager</span>
        <span>•</span>
        <span>Made with <Heart size={14} className="heart-icon" /> for efficient workflows</span>
      </div>
    </footer>
  );
};

export default Footer;