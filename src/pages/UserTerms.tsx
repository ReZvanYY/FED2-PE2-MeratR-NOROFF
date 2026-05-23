// This page provides a comprehensive breakdown of user terms and policies. 
// It utilizes a modular, accordion-style design that keeps the legal text 
// organized and accessible without cluttering the UI.
import React, { useState } from "react";

// Reusable Dropdown Component that maintains the Ember & Stone design system
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

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center">
      
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-12 tracking-wide uppercase">
        Terms & Conditions
      </h1>

      <div className="w-full max-w-4xl space-y-2">
        
        <TermDropDown title="1. User Account Responsibility">
          <p>By creating an account with Ember & Stone, you agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We reserve the right to suspend accounts that provide false information.</p>
        </TermDropDown>

        <TermDropDown title="2. Booking Policy">
          <p>All bookings made through our platform are subject to the specific terms set by the Venue Manager. A booking is considered confirmed once the payment has been processed and you receive a confirmation email from our system.</p>
        </TermDropDown>

        <TermDropDown title="3. Cancellation & Refunds">
          <p>Cancellation policies vary by venue. Please review the specific policy displayed on the venue's page before confirming your reservation. Refund requests must be submitted directly through our support dashboard.</p>
        </TermDropDown>

        <TermDropDown title="4. Payment & Pricing">
          <p>All prices listed on Ember & Stone are final at the time of booking. We use secure payment gateways. By booking, you authorize us to charge the total amount due to your selected payment method.</p>
        </TermDropDown>

        <TermDropDown title="5. Guest Conduct">
          <p>Guests are expected to treat the venue and its surroundings with respect. Any damage to property or disturbance to neighbors may result in immediate eviction from the venue and potential legal action. Local laws must be followed at all times.</p>
        </TermDropDown>

        <TermDropDown title="6. Privacy & Data Protection">
          <p>We take your privacy seriously. Your personal information is used solely to facilitate your bookings and improve your experience on our platform. We never sell your data to third parties. Please refer to our full Privacy Policy for details.</p>
        </TermDropDown>

        <TermDropDown title="7. Intellectual Property">
          <p>All content on Ember & Stone—including logos, design, text, and imagery—is the intellectual property of Ember & Stone. You may not copy, reproduce, or distribute our branding without express written consent.</p>
        </TermDropDown>

        <TermDropDown title="8. Limitation of Liability">
          <p>Ember & Stone acts as a booking platform. We are not responsible for the physical condition of the venues listed or the conduct of individual hosts. We act solely as an intermediary to facilitate your reservation.</p>
        </TermDropDown>

        <TermDropDown title="9. Dispute Resolution">
          <p>In the event of a dispute, we encourage both guests and hosts to contact our support team. If a resolution cannot be reached, disputes will be governed by the laws of Norway, regardless of conflict of law principles.</p>
        </TermDropDown>

        <TermDropDown title="10. Termination of Service">
          <p>Ember & Stone reserves the right to terminate access to our platform for any user who violates these terms. This includes, but is not limited to, fraudulent activity, harassment, or severe property damage.</p>
        </TermDropDown>

      </div>

      <div className="mt-12 text-center text-[#000000] text-xs font-bold uppercase tracking-widest">
        Last Updated: May 2026
      </div>
    </div>
  );
}