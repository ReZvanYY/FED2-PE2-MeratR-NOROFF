import React, { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    // Simulate an API call / Email sending delay (e.g., EmailJS or Formspree)
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage("Thank you for reaching out! We will get back to you shortly.");
      setFormData({ name: "", email: "", subject: "", message: "" }); // Clear form
    }, 1500);
  };

  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-8 md:mb-12 tracking-wide uppercase">
        Get In Touch
      </h1>

      <div className="w-full max-w-6xl bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-[2rem] md:rounded-[3rem] shadow-sm flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: Contact Information */}
        <div className="w-full lg:w-5/12 bg-[#4A1D1A] p-8 md:p-12 text-[#FAF9F6] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background graphic for the dark side */}
          <svg className="absolute -bottom-20 -left-20 w-64 h-64 text-[#3A1412] opacity-50 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="50" />
          </svg>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-[#C5A059] mb-6 tracking-wider uppercase">
              Contact Us
            </h2>
            <p className="text-sm font-medium leading-relaxed mb-12 opacity-90">
              Whether you are looking to host an unforgettable event or need assistance with an upcoming booking, the Ember & Stone team is here to provide you with world-class support.
            </p>

            <div className="space-y-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#C5A059] shrink-0 mt-1">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-bold text-[#C5A059] uppercase tracking-wider text-sm mb-1">Our Office</h3>
                  <p className="text-sm">Enebakkveien 123<br/>1912 Enebakk, Norway</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#C5A059] shrink-0 mt-1">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                <div>
                  <h3 className="font-bold text-[#C5A059] uppercase tracking-wider text-sm mb-1">Email</h3>
                  <p className="text-sm">support@emberandstone.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#C5A059] shrink-0 mt-1">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-bold text-[#C5A059] uppercase tracking-wider text-sm mb-1">Phone</h3>
                  <p className="text-sm">+47 987 65 432</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#FFFFFF]">
          
          <h2 className="text-2xl font-extrabold text-[#000000] mb-8 tracking-wide uppercase">
            Send a Message
          </h2>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl font-bold mb-8 text-sm text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="YOUR NAME"
                value={formData.name} 
                onChange={handleChange}
                className="w-full border border-[#C5A059] rounded-full px-6 py-3.5 text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
              />

              {/* Email */}
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="YOUR EMAIL"
                value={formData.email} 
                onChange={handleChange}
                className="w-full border border-[#C5A059] rounded-full px-6 py-3.5 text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
              />
            </div>

            {/* Subject */}
            <input 
              type="text" 
              name="subject" 
              required 
              placeholder="SUBJECT"
              value={formData.subject} 
              onChange={handleChange}
              className="w-full border border-[#C5A059] rounded-full px-6 py-3.5 text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
            />

            {/* Message */}
            <textarea 
              name="message" 
              required 
              placeholder="HOW CAN WE HELP YOU?"
              value={formData.message} 
              onChange={handleChange}
              className="w-full border border-[#C5A059] rounded-[2rem] p-6 text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm h-40 resize-none focus:border-[#4A1D1A] transition-colors"
            />

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#4A1D1A] text-[#C5A059] font-bold text-sm md:text-base px-10 py-4 rounded-full shadow-lg hover:bg-[#3A1412] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#C5A059] uppercase tracking-widest w-full md:w-auto"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}