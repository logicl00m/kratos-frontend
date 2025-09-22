// src/features/application-details/components/ContactInfo.tsx
import React from "react";
import { Phone, User, Mail, Phone as PhoneIcon } from "lucide-react";

const ContactInfo: React.FC<{ applicant: string }> = ({ applicant }) => (
  <div
    style={{
      background: "white",
      borderRadius: "8px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      height: "100%",
    }}
    className="dark:bg-slate-800 dark:border-slate-700"
  >
    <h3
      style={{
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#0f172a",
      }}
      className="dark:text-slate-100"
    >
      <Phone size={18} className="dark:text-blue-400" />
      Contact Information
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-700">
          <User size={16} className="text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#6b7280" }} className="dark:text-slate-400 font-medium">
            Full Name
          </div>
          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: "500" }} className="dark:text-slate-100">
            {applicant}
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-700">
          <Mail size={16} className="text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#6b7280" }} className="dark:text-slate-400 font-medium">
            Email Address
          </div>
          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: "500" }} className="dark:text-slate-100">
            {applicant.toLowerCase().replace(" ", ".")}@email.com
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-700">
          <PhoneIcon size={16} className="text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#6b7280" }} className="dark:text-slate-400 font-medium">
            Phone Number
          </div>
          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: "500" }} className="dark:text-slate-100">
            (555) 123-4567
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ContactInfo;
