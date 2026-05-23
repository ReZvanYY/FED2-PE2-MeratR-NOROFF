// This page details our data collection and privacy practices. 
// It utilizes the established modular accordion-style design to keep
// legal information organized, readable, and consistent with the brand.
import React, { useState } from "react";

// Reusable Dropdown Component 
const TermDropDown = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full border border-[#C5A059] rounded-2xl bg-[#FFFFFF] shadow-sm overflow-hidden mb-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-5 flex justify-between items-center font-extrabold text-[#000000] uppercase tracking-wide hover:bg-[#FAF9F6] transition-colors"
      >
        {title}
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-8 pb-6 text-[#000000] text-sm leading-relaxed border-t border-[#C5A059]/20 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center">
      
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-12 tracking-wide uppercase">
        Privacy Policy
      </h1>

      <div className="w-full max-w-4xl space-y-2">
        
        <TermDropDown title="1. Information We Collect">
          <p>We collect information you provide directly to us, such as your name, email address, profile photo, and booking history. When you create an account, we store this information to facilitate your experience on the Ember & Stone platform.</p>
        </TermDropDown>

        <TermDropDown title="2. Usage & Device Data">
          <p>We automatically collect information about how you interact with our platform, including your device type, operating system, IP address, and pages visited. This helps us optimize performance and security for all users.</p>
        </TermDropDown>

        <TermDropDown title="3. Cookie Usage">
          <p>Ember & Stone uses cookies to maintain your session state, remember your preferences, and track site performance. You may choose to disable cookies in your browser settings, though this may limit your ability to use certain features like persistent logins.</p>
        </TermDropDown>

        <TermDropDown title="4. How We Use Your Data">
          <p>Your data is used to provide and improve our services, communicate booking updates, personalize your user experience, and ensure the safety and security of our platform and its community members.</p>
        </TermDropDown>

        <TermDropDown title="5. Sharing & Disclosure">
          <p>We do not sell your personal information. We may share necessary booking details with venue hosts to facilitate your stay, or disclose information if required by law, regulation, or legal process to protect our rights and the safety of our users.</p>
        </TermDropDown>

        <TermDropDown title="6. Data Security">
          <p>We implement industry-standard encryption and security protocols to protect your data from unauthorized access, alteration, or destruction. While we strive to protect your information, please be aware that no online platform is 100% secure.</p>
        </TermDropDown>

        <TermDropDown title="7. Data Retention">
          <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. You may request the deletion of your account and associated data at any time through your account settings.</p>
        </TermDropDown>

        <TermDropDown title="8. Your Privacy Rights">
          <p>Depending on your location, you may have the right to access, rectify, or erase your personal data. You also have the right to withdraw consent for certain data processing activities. Please contact our support team to exercise these rights.</p>
        </TermDropDown>

        <TermDropDown title="9. Third-Party Links">
          <p>Our platform may contain links to third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any service you visit outside of Ember & Stone.</p>
        </TermDropDown>

        <TermDropDown title="10. Policy Updates">
          <p>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or an in-app announcement. Your continued use of the platform constitutes acceptance of the updated policy.</p>
        </TermDropDown>

      </div>

      <div className="mt-12 text-center text-[#000000] text-xs font-bold uppercase tracking-widest">
        Effective Date: May 2026
      </div>
    </div>
  );
}