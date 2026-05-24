// This page is only accessible to authenticated users with venue manager status. It provides a form for creating new venue listings, which includes fields for title, description, price, capacity, location details, amenities, and multiple image URLs. The form data is structured to match the Noroff API requirements, and upon submission, it sends a POST request to create the venue. The page also includes error handling and user feedback for a smooth experience.
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CreateVenuePage() {
  const { accessToken, isAuthenticated, venueManager } = useAuth();
  const navigate = useNavigate();

  // Core form data state. Location is nested to cleanly map to the Noroff API requirements. Meta is also nested to group all amenities together, making it easier to manage and extend in the future if needed.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    maxGuests: "",
    location: {
      address: "",
      city: "",
      zip: "",
      country: "",
    },
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false,
    }
  });

  // Dynamic state specifically for managing multiple image URLs (min 1, max 3)
  const [mediaUrls, setMediaUrls] = useState<string[]>([""]);
  
  // UI States - error handling and submission status to provide user feedback during the venue creation process.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard input handler for top-level fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Nested handler for the location segment fields
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }));
  };

  // Nested handler for toggling amenity booleans
  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [name]: checked },
    }));
  };

  // Handlers for the dynamic media array
  const handleMediaChange = (index: number, value: string) => {
    const newMediaUrls = [...mediaUrls];
    newMediaUrls[index] = value;
    setMediaUrls(newMediaUrls);
  };
  // Adds a new media URL input field, up to a maximum of 3. This allows users to provide multiple images for their venue listing, enhancing the appeal and providing more visual information to potential customers. The function checks the current number of media URLs and only adds a new one if there are fewer than 3, ensuring compliance with the API's requirements.
  const addMediaInput = () => {
    if (mediaUrls.length < 3) {
      setMediaUrls([...mediaUrls, ""]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    
    setError(null);
    setIsSubmitting(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const apiKey = import.meta.env.VITE_API_KEY;

    // Filter out any blank media fields and map them to the format the API expects ({ url, alt }). This ensures that only valid image URLs are included in the payload sent to the API, and it also provides alt text for accessibility. The alt text is generated based on the venue name to give context to the images, which can improve SEO and provide a better experience for users relying on screen readers.
    const validMedia = mediaUrls
      .filter((url) => url.trim() !== "")
      .map((url) => ({ url: url.trim(), alt: `${formData.name} image` }));

    // Construct the strict payload payload for the Noroff API based on the form data and the valid media URLs. This ensures that the data sent to the API is properly formatted and includes all necessary fields, adhering to the API's requirements for creating a new venue listing. The payload includes the venue's name, description, price, maximum guests, location details, amenities (meta), and an array of media objects for the images. By structuring the payload in this way, we can ensure a successful API request and proper creation of the venue listing on the server.
    const payload = { 
      name: formData.name, 
      description: formData.description, 
      price: Number(formData.price), 
      maxGuests: Number(formData.maxGuests), 
      media: validMedia,
      location: formData.location, 
      meta: formData.meta 
    };

    try {
      const response = await fetch(`${baseUrl}/holidaze/venues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to create venue.");
      }

      alert("Venue created successfully!");
      navigate("/dashboard"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guard Clauses - If the user is not authenticated, redirect them to the login page. If they are authenticated but not a venue manager, redirect them to their profile page. These checks ensure that only users with the appropriate permissions can access the venue creation form, maintaining the integrity of the app's access control and providing a better user experience by guiding users to the correct pages based on their status.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  return (
    <div 
      className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center"
      aria-labelledby="page-heading"
    >
      
      <h1 id="page-heading" className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-8 tracking-wide">
        Create a new listing
      </h1>

      <div className="w-full max-w-4xl bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl md:rounded-[3rem] p-6 md:p-12 shadow-sm">
        
        {error && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="bg-red-100 p-4 rounded-xl text-red-700 text-center font-bold mb-8 border border-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Create new venue form" className="flex flex-col items-center gap-10">
          
          {/* TITLE */}
          <div className="w-full flex justify-center">
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="VENUE TITLE"
              aria-label="Venue Title"
              value={formData.name} 
              onChange={handleChange}
              className="w-full md:w-1/2 border border-[#C5A059] rounded-full px-6 py-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
            />
          </div>

          {/* Dynamic Media URLs */}
          <div className="w-full flex flex-col items-center gap-4" role="group" aria-label="Venue Images">
            {mediaUrls.map((url, index) => (
              <input 
                key={index}
                type="url" 
                required={index === 0} // Only the first image is strictly required
                placeholder="IMAGE URL"
                aria-label={`Image URL ${index + 1}`}
                value={url} 
                onChange={(e) => handleMediaChange(index, e.target.value)}
                className="w-full md:w-2/3 border border-[#C5A059] rounded-full px-6 py-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
              />
            ))}
            
            {/* Conditional Add Button */}
            {mediaUrls.length < 3 && (
              <button 
                type="button" 
                onClick={addMediaInput}
                aria-label="Add another image URL"
                className="bg-[#4A1D1A] text-[#C5A059] font-bold text-xs px-6 py-1.5 rounded-full shadow-md hover:bg-[#3A1412] transition-colors mt-2"
              >
                +1
              </button>
            )}
          </div>

          {/* Venue Address */}
          <div className="w-full flex flex-col items-center">
            <h3 id="address-heading" className="font-extrabold text-[#000000] tracking-wider mb-2 uppercase">Venue Address</h3>
            <div 
              role="group" 
              aria-labelledby="address-heading"
              className="w-full md:w-3/4 border border-[#C5A059] rounded-full flex overflow-hidden shadow-sm divide-x divide-[#C5A059]"
            >
              <input 
                type="text" name="address" required placeholder="ADDRESS"
                aria-label="Street Address"
                value={formData.location.address} onChange={handleLocationChange}
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
              <input 
                type="text" name="city" required placeholder="CITY"
                aria-label="City"
                value={formData.location.city} onChange={handleLocationChange}
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
              <input 
                type="text" name="zip" required placeholder="POSTAL CODE"
                aria-label="Postal Code"
                value={formData.location.zip} onChange={handleLocationChange}
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
              <input 
                type="text" name="country" required placeholder="COUNTRY"
                aria-label="Country"
                value={formData.location.country} onChange={handleLocationChange}
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Amenities & Capacity/Price */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-4 md:w-3/4">
            
            {/* Amenities Column */}
            <div className="flex flex-col items-center md:items-start pl-0 md:pl-10">
              <h3 id="amenities-heading" className="font-extrabold text-[#000000] tracking-wider mb-3 uppercase">Venue Amenities</h3>
              <div role="group" aria-labelledby="amenities-heading" className="flex flex-col gap-2">
                {Object.keys(formData.meta).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input 
                        type="checkbox" 
                        name={key}
                        checked={formData.meta[key as keyof typeof formData.meta]}
                        onChange={handleMetaChange}
                        className="peer appearance-none w-5 h-5 border border-[#C5A059] rounded-sm cursor-pointer checked:bg-[#C5A059] transition-all"
                      />
                      <svg
                        className="absolute w-3.5 h-3.5 text-[#FFFFFF] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[#000000] font-bold text-sm uppercase tracking-wider">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price & Capacity Column */}
            <div className="flex flex-col items-center gap-8">
              
              <div className="flex flex-col items-center w-full">
                <h3 id="price-heading" className="font-extrabold text-[#000000] tracking-wider mb-2 uppercase">Venue Price Per Night</h3>
                <input 
                  type="number" min="1" name="price" required placeholder="ENTER DAILY PRICE"
                  aria-labelledby="price-heading"
                  value={formData.price} onChange={handleChange}
                  className="w-full md:w-3/4 border border-[#C5A059] rounded-full px-6 py-2.5 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm"
                />
              </div>

              <div className="flex flex-col items-center w-full">
                <h3 id="capacity-heading" className="font-extrabold text-[#000000] tracking-wider mb-2 uppercase">Venue Capacity</h3>
                <input 
                  type="number" min="1" name="maxGuests" required placeholder="ENTER CAPACITY HERE"
                  aria-labelledby="capacity-heading"
                  value={formData.maxGuests} onChange={handleChange}
                  className="w-full md:w-3/4 border border-[#C5A059] rounded-full px-6 py-2.5 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm"
                />
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="w-full">
            <textarea 
              name="description" 
              required 
              placeholder="VENUE DESCRIPTION"
              aria-label="Venue Description"
              value={formData.description} 
              onChange={handleChange}
              className="w-full border border-[#C5A059] rounded-2xl p-6 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm h-32 resize-none focus:border-[#4A1D1A] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="bg-[#4A1D1A] text-[#C5A059] font-bold text-lg md:text-xl px-12 md:px-20 py-4 rounded-full shadow-lg hover:bg-[#3A1412] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#C5A059] uppercase tracking-widest mt-4"
          >
            {isSubmitting ? "Processing..." : "List My Venue"}
          </button>

        </form>
      </div>
    </div>
  );
}