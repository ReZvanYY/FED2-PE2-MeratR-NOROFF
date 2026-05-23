// This page provides the legal framework for venue managers and hosts on Ember & Stone. 
// It uses the same modular, accordion-style design as the user terms page to ensure
// a unified experience for all platform participants.
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

export default function HostTermsPage() {
  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center">
      
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-12 tracking-wide uppercase">
        Host Agreement
      </h1>

      <div className="w-full max-w-4xl space-y-2">
        
        <TermDropDown title="1. Host Eligibility & Registration">
          <p>By registering as a host, you confirm that you have the legal right to rent out the properties you list on Ember & Stone. You must maintain an accurate profile, and we reserve the right to verify your identity and property ownership documentation at any time.</p>
        </TermDropDown>

        <TermDropDown title="2. Venue Standards & Accuracy">
          <p>Hosts are required to keep listing information—including photos, amenities, and descriptions—current and accurate. Representing a property incorrectly, or failing to disclose significant defects, is a breach of this agreement and may lead to removal from the platform.</p>
        </TermDropDown>

        <TermDropDown title="3. Pricing & Commission">
          <p>You set your own nightly rates for your venues. Ember & Stone applies a platform commission fee on every successful booking. By listing, you agree to our current commission structure, which is clearly outlined in your host dashboard upon onboarding.</p>
        </TermDropDown>

        <TermDropDown title="4. Booking Acceptance">
          <p>You have full control over accepting or declining booking requests. Once you accept a request, you are entering into a binding contract with the guest. Cancellations by hosts are strongly discouraged and may negatively impact your host ranking or eligibility.</p>
        </TermDropDown>

        <TermDropDown title="5. Property Maintenance & Safety">
          <p>As a host, you are solely responsible for ensuring your venue meets all local health and safety regulations, including fire codes and sanitation standards. The venue must be clean and guest-ready for every check-in.</p>
        </TermDropDown>

        <TermDropDown title="6. Payouts & Taxation">
          <p>Payouts are processed after the guest check-in date. It is the host’s sole responsibility to calculate, collect, and report any applicable local taxes or tourism levies required by your jurisdiction.</p>
        </TermDropDown>

        <TermDropDown title="7. Communication & Guest Relations">
          <p>Timely and professional communication is key. Hosts must respond to guest inquiries within 24 hours. Harassment or abusive communication towards guests will result in immediate termination of your host privileges.</p>
        </TermDropDown>

        <TermDropDown title="8. Damage & Liability">
          <p>While we facilitate the booking, Ember & Stone is not liable for damages caused to your property by guests. We strongly encourage all hosts to maintain comprehensive independent property insurance to cover potential guest-related incidents.</p>
        </TermDropDown>

        <TermDropDown title="9. Use of Media">
          <p>By uploading photos and content to Ember & Stone, you grant us a non-exclusive, worldwide license to display and use this media to market your venue across our platform and associated promotional channels.</p>
        </TermDropDown>

        <TermDropDown title="10. Termination & Disputes">
          <p>We reserve the right to deactivate any host account that consistently fails to meet guest expectations or violates our safety policies. Disputes between hosts and guests must be handled through our resolution portal; legal matters are governed by Norwegian law.</p>
        </TermDropDown>

      </div>

      <div className="mt-12 text-center text-[#000000] text-xs font-bold uppercase tracking-widest">
        Last Updated: May 2026
      </div>
    </div>
  );
}