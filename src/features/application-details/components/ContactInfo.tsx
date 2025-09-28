// src/features/application-details/components/ContactInfo.tsx
import React from "react";
import { Phone, User, Mail, Phone as PhoneIcon } from "lucide-react";
import "./ContactInfo.css";

const ContactInfo: React.FC<{ applicant: string }> = ({ applicant }) => (
  <div className="contact-info">
    <div className="contact-info-header">
      <h3 className="contact-info-title">
        <Phone size={18} className="dark:text-blue-400" />
        Contact Information
      </h3>
    </div>
    <div className="contact-info-grid">
      <div className="contact-info-field">
        <div className="contact-info-label">Full Name</div>
        <div className="contact-info-value">{applicant}</div>
      </div>

      <div className="contact-info-field">
        <div className="contact-info-label">Email Address</div>
        <div className="contact-info-value">
          {applicant.toLowerCase().replace(" ", ".")}@email.com
        </div>
      </div>

      <div className="contact-info-field">
        <div className="contact-info-label">Phone Number</div>
        <div className="contact-info-value">(555) 123-4567</div>
      </div>
    </div>
  </div>
);

export default ContactInfo;
