// This page allows venue managers to edit their existing venue listings. It fetches the current details of the venue on mount and pre-fills the form, enabling users to make updates and submit changes via a PUT request to the Noroff API. The form includes fields for all relevant venue information, including dynamic media URLs, location details, amenities, price, and capacity. Proper error handling and loading states are implemented to ensure a smooth user experience throughout the editing process.
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditVenuePage() {
  // Extract the venue ID from the URL parameters to identify which venue is being edited. This allows the component to fetch the correct venue data on mount and to send the appropriate PUT request when submitting changes. The ID is essential for interacting with the Noroff API, as it specifies which venue resource to update.
  const { id } = useParams<{ id: string }>();
  const { accessToken, isAuthenticated, venueManager } = useAuth();
  const navigate = useNavigate();

  // Core form data state. Location is nested to cleanly map to the Noroff API requirements. Meta is also nested to group all amenities together, making it easier to manage and extend in the future if needed. This state structure allows for organized handling of the form data and ensures that it can be easily transformed into the format required by the API when submitting updates.
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

  const [mediaUrls, setMediaUrls] = useState<string[]>([""]);
  
  // UI States for loading, submitting, and error handling to provide feedback to the user during data fetching and form submission processes. These states help manage the user experience by showing loading indicators when data is being fetched or submitted, and by displaying error messages if any issues arise during these operations.
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing venue data on mount to pre-fill the form with the current details of the venue. This allows users to see the existing information and make updates as needed, rather than starting from a blank form. The fetched data is mapped to the form state structure, ensuring that all fields are populated correctly for editing. Proper error handling is included to manage any issues that arise during the data fetching process, providing feedback to the user if the venue details cannot be loaded.
  useEffect(() => {
    const fetchVenueData = async () => {
      if (!id) return;
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
      
      try {
        const response = await fetch(`${baseUrl}/holidaze/venues/${id}`);
        if (!response.ok) throw new Error("Could not fetch venue details.");
        
        const jsonResponse = await response.json();
        const venue = jsonResponse.data;
        // Map the fetched venue data to the form state structure, ensuring that all fields are populated correctly for editing. This includes handling nested location and meta fields, as well as mapping media URLs to a simple array for easier management in the form. By structuring the data in this way, we can ensure that the form is pre-filled with the existing venue details, allowing users to make updates as needed without having to re-enter all information from scratch.
        setFormData({
          name: venue.name || "",
          description: venue.description || "",
          price: venue.price?.toString() || "",
          maxGuests: venue.maxGuests?.toString() || "",
          location: {
            address: venue.location?.address || "",
            city: venue.location?.city || "",
            zip: venue.location?.zip || "",
            country: venue.location?.country || "",
          },
          meta: {
            wifi: venue.meta?.wifi || false,
            parking: venue.meta?.parking || false,
            breakfast: venue.meta?.breakfast || false,
            pets: venue.meta?.pets || false,
          }
        });

        // Map existing media URLs, capping at 3 for the UI
        if (venue.media && venue.media.length > 0) {
          const urls = venue.media.map((m: { url: string }) => m.url).slice(0, 3);
          setMediaUrls(urls);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load venue data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenueData();
  }, [id]);

  // Input Handlers to manage changes to form fields, including nested location and meta fields, as well as dynamic media URLs. These handlers update the form state in response to user input, ensuring that the data is kept up-to-date as the user makes changes. The media handler allows for adding multiple image URLs dynamically, while the location and meta handlers manage their respective nested structures in the form state.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }));
  };

  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [name]: checked },
    }));
  };

  const handleMediaChange = (index: number, value: string) => {
    const newMediaUrls = [...mediaUrls];
    newMediaUrls[index] = value;
    setMediaUrls(newMediaUrls);
  };

  const addMediaInput = () => {
    if (mediaUrls.length < 3) {
      setMediaUrls([...mediaUrls, ""]);
    }
  };

  // Submit Handler (PUT Request) to update the venue listing on the Noroff API. This function constructs the payload based on the form data, including filtering and formatting media URLs, and sends a PUT request to the appropriate endpoint. It includes error handling to manage any issues that arise during the submission process, providing feedback to the user if the update fails. Upon successful update, it navigates the user back to the dashboard or previous page, allowing them to see their updated listing.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken || !id) return;
    
    setError(null);
    setIsSubmitting(true);
    // Prepare the base URL and API key for the request, ensuring that the base URL does not have a trailing slash to prevent issues when constructing the endpoint URL. This setup is crucial for making successful API requests to update the venue listing on the server. By standardizing the base URL, we can avoid common pitfalls related to URL formatting and ensure that our requests are sent to the correct endpoint.
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const apiKey = import.meta.env.VITE_API_KEY;

    const validMedia = mediaUrls
      .filter((url) => url.trim() !== "")
      .map((url) => ({ url: url.trim(), alt: `${formData.name} image` }));
    // Construct the strict payload payload for the Noroff API based on the form data and the valid media URLs. This ensures that the data sent to the API is properly formatted and includes all necessary fields, adhering to the API's requirements for updating a venue listing. The payload includes the venue's name, description, price, maximum guests, location details, amenities (meta), and an array of media objects for the images. By structuring the payload in this way, we can ensure a successful API request and proper updating of the venue listing on the server. The payload is carefully constructed to match the expected format of the API, which is essential for the update operation to succeed without errors.
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
      const response = await fetch(`${baseUrl}/holidaze/venues/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to update venue.");
      }

      alert("Venue updated successfully!");
      navigate("/dashboard"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guard Clauses to protect the route and ensure that only authenticated venue managers can access the edit page. If the user is not authenticated, they are redirected to the login page. If they are authenticated but not a venue manager, they are redirected to their profile page. These guard clauses help maintain the security and integrity of the application by preventing unauthorized access to sensitive routes and ensuring that users only see content relevant to their permissions and roles within the app.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  if (isLoading) {
    return (
      <div className="w-full flex-grow flex justify-center items-center font-kadwa bg-[#FAF9F6]" aria-live="polite" aria-busy="true">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]" role="status" aria-label="Loading venue details"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 flex flex-col items-center">
      
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#000000] mb-8 tracking-wide">
        Edit Venue Listing
      </h1>

      <div className="w-full max-w-4xl bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl md:rounded-[3rem] p-6 md:p-12 shadow-sm">
        
        {error && (
          <div className="bg-red-100 p-4 rounded-xl text-red-700 text-center font-bold mb-8 border border-red-300" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-10" aria-label="Edit venue form">
          
          {/* Title */}
          <div className="w-full flex justify-center">
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="VENUE TITLE"
              value={formData.name} 
              onChange={handleChange}
              aria-label="Venue Title"
              className="w-full md:w-1/2 border border-[#C5A059] rounded-full px-6 py-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
            />
          </div>

          {/* Dynamic Media URLs */}
          <div className="w-full flex flex-col items-center gap-4" aria-label="Venue Images">
            {mediaUrls.map((url, index) => (
              <input 
                key={index}
                type="url" 
                required={index === 0} 
                placeholder="IMAGE URL"
                value={url} 
                onChange={(e) => handleMediaChange(index, e.target.value)}
                aria-label={`Image URL ${index + 1}`}
                className="w-full md:w-2/3 border border-[#C5A059] rounded-full px-6 py-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm focus:border-[#4A1D1A] transition-colors"
              />
            ))}
            
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
            <h3 className="font-extrabold text-[#000000] tracking-wider mb-2 uppercase" id="address-heading">Venue Address</h3>
            <div className="w-full md:w-3/4 border border-[#C5A059] rounded-full flex overflow-hidden shadow-sm divide-x divide-[#C5A059]" aria-labelledby="address-heading">
              <input 
                type="text" name="address" required placeholder="ADDRESS"
                value={formData.location.address} onChange={handleLocationChange}
                aria-label="Address"
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
              <input 
                type="text" name="city" required placeholder="CITY"
                value={formData.location.city} onChange={handleLocationChange}
                aria-label="City"
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
              <input 
                type="text" name="zip" required placeholder="POSTAL CODE"
                value={formData.location.zip} onChange={handleLocationChange}
                aria-label="Postal Code"
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
              <input 
                type="text" name="country" required placeholder="COUNTRY"
                value={formData.location.country} onChange={handleLocationChange}
                aria-label="Country"
                className="w-full px-2 py-3 text-center text-xs md:text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Two Column Section */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-4 md:w-3/4">
            
            {/* Amenities Column */}
            <div className="flex flex-col items-center md:items-start pl-0 md:pl-10">
              <h3 className="font-extrabold text-[#000000] tracking-wider mb-3 uppercase" id="amenities-heading">Venue Amenities</h3>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="amenities-heading">
                {Object.keys(formData.meta).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input 
                        type="checkbox" 
                        name={key}
                        checked={formData.meta[key as keyof typeof formData.meta]}
                        onChange={handleMetaChange}
                        aria-label={`Toggle ${key} amenity`}
                        className="peer appearance-none w-5 h-5 border border-[#C5A059] rounded-sm cursor-pointer checked:bg-[#C5A059] transition-all"
                      />
                      <svg
                        className="absolute w-3.5 h-3.5 text-[#FFFFFF] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
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
                <h3 className="font-extrabold text-[#000000] tracking-wider mb-2 uppercase">Venue Price Per Night</h3>
                <input 
                  type="number" min="1" name="price" required placeholder="ENTER DAILY PRICE"
                  value={formData.price} onChange={handleChange}
                  aria-label="Venue Price Per Night"
                  className="w-full md:w-3/4 border border-[#C5A059] rounded-full px-6 py-2.5 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm"
                />
              </div>

              <div className="flex flex-col items-center w-full">
                <h3 className="font-extrabold text-[#000000] tracking-wider mb-2 uppercase">Venue Capacity</h3>
                <input 
                  type="number" min="1" name="maxGuests" required placeholder="ENTER CAPACITY HERE"
                  value={formData.maxGuests} onChange={handleChange}
                  aria-label="Venue Capacity"
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
              value={formData.description} 
              onChange={handleChange}
              aria-label="Venue Description"
              className="w-full border border-[#C5A059] rounded-2xl p-6 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none shadow-sm h-32 resize-none focus:border-[#4A1D1A] transition-colors"
            />
          </div>

          {/* Action Buttons (Save & Cancel) */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mt-4 w-full max-w-md">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className="flex-1 border-2 border-[#4A1D1A] text-[#4A1D1A] font-bold text-sm md:text-base py-3 rounded-full shadow-sm hover:bg-[#4A1D1A]/10 transition-colors uppercase tracking-widest disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className="flex-1 bg-[#4A1D1A] text-[#C5A059] font-bold text-sm md:text-base py-3 rounded-full shadow-lg hover:bg-[#3A1412] transition-colors disabled:opacity-50 border-2 border-[#C5A059] uppercase tracking-widest"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}