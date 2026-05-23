import { Link } from "react-router-dom";

export default function AboutPage() {
  
  // Custom values array to feed the modular grid
  const brandPillars = [
    {
      label: "Discovery",
      title: "Curation First",
      text: "We filter through thousands of listings so you don't have to. Every stone is turned to find the embers of true hospitality.",
    },
    {
      label: "Experience",
      title: "Seamless Hosting",
      text: "Our dashboard gives venue managers the precision tools they need to manage luxury bookings without the clutter.",
    },
    {
      label: "Trust",
      title: "Verified Quality",
      text: "Transparent communication and verified profiles ensure that every stay is as secure as it is beautiful.",
    }
  ];

  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center">
      
      {/* HEADER SECTION: Matching the "Create Listing" Title Style */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-8 tracking-wide uppercase">
        Our Story & Vision
      </h1>

      <div className="w-full max-w-5xl flex flex-col gap-12">
        
        {/* MAIN BRAND CARD: Matching the "Your Venues" Card Style */}
        <div className="bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-[3rem] p-8 md:p-16 shadow-sm flex flex-col items-center text-center">
          
          <div className="border border-[#C5A059] rounded-full px-8 py-2 mb-8 bg-[#FAF9F6]">
            <span className="text-[#4A1D1A] font-bold text-sm tracking-widest uppercase">The Essence</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-[#000000] mb-8 leading-tight">
            Bridging the Gap Between <br className="hidden md:block"/> 
            Raw Elegance and Refined Comfort
          </h2>

          <div className="max-w-3xl text-[#605F5F] font-medium leading-relaxed space-y-6">
            <p>
              Ember & Stone was born from a simple observation: the world's most incredible venues are often the hardest to find. We set out to create a sanctuary for the discerning traveler—a platform where luxury isn't just about price, but about the character of the space.
            </p>
            <p>
              From the rugged texture of the stone walls in a mountain lodge to the warm glow of an ember in a designer penthouse, we celebrate the details that make a venue unforgettable.
            </p>
          </div>
        </div>

        {/* CORE PILLARS GRID: Modular cards matching the booking request style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brandPillars.map((pillar, index) => (
            <div 
              key={index} 
              className="bg-[#FFFFFF] border border-[#C5A059] rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-sm"
            >
              <div className="bg-[#4A1D1A] text-[#C5A059] text-[10px] font-bold px-4 py-1 rounded-full mb-4 tracking-tighter uppercase">
                {pillar.label}
              </div>
              <h3 className="text-lg font-extrabold text-[#000000] mb-4 uppercase tracking-wider">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#605F5F] leading-relaxed">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>

        {/* LOWER CALL TO ACTION: Pill-shaped banner */}
        <div className="w-full flex flex-col items-center gap-6 mt-6">
          <div className="w-full md:w-2/3 border border-[#C5A059] rounded-full py-6 px-10 bg-[#FFFFFF] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-extrabold text-[#000000] uppercase tracking-wider">Ready to host?</h4>
              <p className="text-xs font-bold text-[#605F5F]">Join our exclusive collection of venue managers today.</p>
            </div>
            
            <Link 
              to="/become-a-venue-manager"
              className="bg-[#4A1D1A] text-[#C5A059] font-bold text-sm px-10 py-3 rounded-full border-2 border-[#C5A059] hover:bg-[#3A1412] transition-colors whitespace-nowrap"
            >
              List Your Venue
            </Link>
          </div>

          {/* Minimalist Footer Link */}
          <Link to="/contact" className="text-[#000000] font-extrabold text-sm hover:text-[#4A1D1A] transition-colors uppercase tracking-widest mt-4">
            Questions? Contact our team
          </Link>
        </div>

      </div>
    </div>
  );
}