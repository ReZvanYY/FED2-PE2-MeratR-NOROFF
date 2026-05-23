// This component serves as the primary landing page (Home). It fetches and displays a list of venues from the Noroff API, allowing users to browse and search for accommodations. The page includes features like pagination, filtering, and error handling to enhance the user experience while navigating through available venues.
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { type Venue, type FilterState } from "../types/Venue";

export default function Home() {
  // Data State: Manages the list of venues, loading status, and any errors that occur during data fetching. This state is essential for rendering the venue cards and providing feedback to the user about the loading process or any issues encountered.
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State - Manages the current page number for paginating the list of venues. This state is used to determine which subset of the filtered venues to display on the current page, allowing users to navigate through large lists of venues without overwhelming the UI.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 25; // 25 items perfectly fills five 5-column rows

  // Filter & Search State - Manages user input for search and filter criteria, allowing dynamic updates to the displayed venues based on user preferences. This state is used in conjunction with the useMemo hook to efficiently compute the filtered list of venues without unnecessary re-renders.
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    // Default filter values. These can be adjusted based on the expected range of values for each filter criteria. For example, price might have a wider range, while guests might start at 1. The boolean filters default to false, meaning they will not filter out venues that do not have those amenities unless the user explicitly enables them.
    minPrice: 0,
    maxPrice: 10000,
    maxGuests: 1,
    minRating: 0,
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
    country: "",
    city: "",
  });

  // Data Fetching. Retrieves venue data on component mount. Includes error handling and loading state management to provide feedback to the user during the fetch process. The fetched data is stored in the `venues` state, which is then used for rendering and filtering.
  useEffect(() => {
    const fetchVenues = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${baseUrl}/holidaze/venues?sort=created&sortOrder=desc`,
          {
            headers: {
              "X-Noroff-API-Key": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch venues");

        const data = await response.json();
        setVenues(data.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred fetching venues."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Memoized Search & Filter Logic. Re-calculates the displayed array only when dependencies change. This optimization prevents unnecessary computations and re-renders, improving performance, especially when dealing with larger datasets. The filtering logic includes both a text search for venue names and advanced filters based on price, guests, rating, amenities, and location.
  const filteredVenues = useMemo(() => {
    let result = venues;

    // 1. Text Search (Venue Name) - Filters venues based on the search query entered by the user. This is a case-insensitive search that checks if the venue name includes the search query string. If the search query is empty, it will return all venues without filtering.
    if (searchQuery) {
      result = result.filter((venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Advanced Filters - Applies multiple filter criteria based on the user's selections in the filter dropdown. Each filter checks a specific property of the venue, such as price, guest capacity, rating, amenities (WiFi, parking, breakfast, pets), and location (country and city). The filtering logic ensures that only venues that meet all selected criteria are included in the final result. Safe checks are included for optional fields to prevent errors if certain data is missing from the API response.
    result = result.filter((venue) => {
      const meetsPrice = venue.price >= filters.minPrice && venue.price <= filters.maxPrice;
      const meetsGuests = venue.maxGuests >= filters.maxGuests;
      const meetsRating = venue.rating >= filters.minRating;
      const meetsWifi = filters.wifi ? venue.meta.wifi : true;
      const meetsParking = filters.parking ? venue.meta.parking : true;
      const meetsBreakfast = filters.breakfast ? venue.meta.breakfast : true;
      const meetsPets = filters.pets ? venue.meta.pets : true;

      // Safe location checks for null/undefined API fields and case-insensitive matching. This allows users to filter by partial matches for country and city names, enhancing the usability of the location filters. If the location data is missing, it will not exclude the venue from the results, allowing for a more inclusive search experience.
      const meetsCountry =
        filters.country === "" ||
        (venue.location?.country || "")
          .toLowerCase()
          .includes(filters.country.toLowerCase());
      const meetsCity =
        filters.city === "" ||
        (venue.location?.city || "")
          .toLowerCase()
          .includes(filters.city.toLowerCase());

      return (
        meetsPrice &&
        meetsGuests &&
        meetsRating &&
        meetsWifi &&
        meetsParking &&
        meetsBreakfast &&
        meetsPets &&
        meetsCountry &&
        meetsCity
      );
    });

    return result;
  }, [searchQuery, filters, venues]);

  // Pagination Slicing - Calculates the total number of pages based on the filtered venues and items per page, and slices the filtered venues array to get only the venues that should be displayed on the current page. 
  const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
  const currentVenues = filteredVenues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Split venues into five rows to match the wireframe design (5 per row)
  const popularChoices = currentVenues.slice(0, 5);
  const nextAdventure = currentVenues.slice(5, 25);

  // Input handler - Handles changes to all filter inputs (text, number, range, checkbox) in a single function. This function updates the corresponding filter state based on the input type and resets the current page to 1 to ensure that users see results from the beginning of the list after applying new filters.
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number" || type === "range"
            ? Number(value)
            : value,
    }));
    setCurrentPage(1); // Reset to page 1 to prevent empty state bugs
  };

  return (
    <div className="w-full flex-grow flex flex-col font-kadwa p-8">
      {/* Top Search Interface (Matching Wireframe) */}
      <div className="w-full flex flex-col items-center mb-12 space-y-4">
        {/* Main Search Pill */}
        <div className="w-full max-w-md border border-[#C5A059] rounded-full px-6 py-2 bg-[#FFFFFF] shadow-sm flex items-center justify-center cursor-text">
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-center text-sm outline-none font-medium text-[#000000] placeholder-[#605F5F]"
          />
        </div>

        {/* Where / When / Whose Pill */}
        <div className="w-full max-w-2xl border border-[#C5A059] rounded-full bg-[#FFFFFF] shadow-sm flex items-center divide-x divide-[#C5A059]">
          <div className="flex-1 px-6 py-3 flex flex-col justify-center">
            <span className="text-sm font-bold text-[#000000]">Where</span>
            <input
              type="text"
              name="country"
              placeholder="Search for Country"
              value={filters.country}
              onChange={handleFilterChange}
              className="text-xs outline-none text-[#605F5F]"
            />
          </div>

          <div className="flex-1 px-6 py-3 flex flex-col justify-center">
            <span className="text-sm font-bold text-[#000000]">When</span>
            <input
              type="date"
              className="text-xs outline-none text-[#605F5F] bg-transparent cursor-pointer"
            />
          </div>

          <div className="flex-1 px-6 py-3 flex flex-col justify-center">
            <span className="text-sm font-bold text-[#000000]">Whose</span>
            <input
              type="number"
              name="maxGuests"
              min="1"
              placeholder="Add Guests"
              value={filters.maxGuests === 1 ? "" : filters.maxGuests}
              onChange={handleFilterChange}
              className="text-xs outline-none text-[#605F5F]"
            />
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center items-center h-64 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center text-red-700 bg-red-50 border border-red-200 p-4 rounded-lg w-full max-w-md mx-auto">
          {error}
        </div>
      )}

      {!isLoading && !error && currentVenues.length === 0 && (
        <div className="text-center text-[#000000] text-xl mt-12 font-bold w-full">
          No venues found matching your criteria.
        </div>
      )}

      {/* Grid Rendering */}
      {!isLoading && !error && currentVenues.length > 0 && (
        <div className="w-full flex flex-col space-y-12">
          {/* Row 1: Popular Choices */}
          <div>
            <div className="flex justify-between items-end mb-6 border-b-2 border-transparent relative">
              <h2 className="text-xl font-bold text-[#000000] uppercase tracking-wide">
                Popular Choices Right Now!
              </h2>

              {/* Filter Toggle Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="border border-[#C5A059] rounded-full px-8 py-1 text-[#000000] font-bold text-sm hover:bg-[#C5A059]/10 transition-colors">
                  Filter
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFFFF] border-2 border-[#C5A059] rounded-xl p-5 shadow-xl z-50">
                    <h3 className="font-bold text-[#4A1D1A] mb-4 border-b border-[#C5A059]/30 pb-2">
                      Advanced Filters
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-[#000000] mb-1">
                        Max Price: ${filters.maxPrice}
                      </label>
                      <input
                        type="range"
                        name="maxPrice"
                        min="0"
                        max="10000"
                        step="100"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        className="w-full accent-[#4A1D1A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mt-4 text-[#000000]">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          name="wifi"
                          checked={filters.wifi}
                          onChange={handleFilterChange}
                          className="accent-[#C5A059]"
                        /> WiFi
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          name="parking"
                          checked={filters.parking}
                          onChange={handleFilterChange}
                          className="accent-[#C5A059]"
                        /> Parking
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          name="breakfast"
                          checked={filters.breakfast}
                          onChange={handleFilterChange}
                          className="accent-[#C5A059]"
                        /> Breakfast
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          name="pets"
                          checked={filters.pets}
                          onChange={handleFilterChange}
                          className="accent-[#C5A059]"
                        /> Pets
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {popularChoices.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>

          {/* Row 2: Next Adventure */}
          {nextAdventure.length > 0 && (
            <div className="pt-4">
              <h2 className="text-xl font-bold text-[#000000] uppercase tracking-wide mb-6">
                Book Your Next Adventure!
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {nextAdventure.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-16 mb-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full border-2 border-[#C5A059] text-[#4A1D1A] font-bold text-xl flex items-center justify-center hover:bg-[#C5A059]/20 disabled:opacity-30 transition-all">
            &lt;
          </button>
          <span className="text-[#000000] font-bold tracking-wide">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full border-2 border-[#C5A059] text-[#4A1D1A] font-bold text-xl flex items-center justify-center hover:bg-[#C5A059]/20 disabled:opacity-30 transition-all">
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

// Helper Component for the Venue Cards. Extracts the card UI to keep the main component cleaner. This component receives a venue object as a prop and renders the card UI, including the image, name, location, description, price, and rating. It also includes error handling for missing images and safe checks for optional fields to ensure that the card renders correctly even if some data is missing from the API response.
function VenueCard({ venue }: { venue: Venue }) {
  const locationText = [venue.location?.city, venue.location?.country]
    .filter(Boolean)
    .join(", ") || "Location unlisted";

  return (
    <Link
      to={`/venues/${venue.id}`}
      className="bg-[#FFFFFF] border border-[#C5A059] rounded-3xl flex flex-col hover:shadow-lg transition-all duration-300 overflow-hidden">
      
      {/* Image Area */}
      <div className="w-full h-48 bg-[#FAF9F6] border-b border-[#C5A059]">
        {venue.media && venue.media.length > 0 ? (
          <img
            src={venue.media[0].url}
            alt={venue.media[0].alt || venue.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/fallback-image.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#605F5F] text-sm font-bold uppercase tracking-wider">
            No Image
          </div>
        )}
      </div>

      {/* Text Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-[#000000] font-bold text-lg leading-tight mb-1.5 uppercase truncate">
          {venue.name}
        </h3>

        {/* Location & Text */}
        <div className="flex items-center gap-1.5 mb-3 text-[#4A1D1A]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-4 h-4 shrink-0"
          >
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-bold uppercase tracking-wider truncate">
            {locationText}
          </p>
        </div>

        <p className="text-[#605F5F] text-sm mb-4 line-clamp-2">
          {venue.description || "No description available for this venue."}
        </p>

        <div className="mt-auto flex justify-between items-end">
          <p className="font-bold text-[#4A1D1A]">
            ${venue.price} <span className="text-xs text-[#605F5F] font-normal">/ night</span>
          </p>
          <p className="text-[#605F5F] font-bold text-sm">
            {venue.rating > 0 ? `${venue.rating} ★` : "New"}
          </p>
        </div>
      </div>
    </Link>
  );
}