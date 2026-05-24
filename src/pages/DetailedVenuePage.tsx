// This page displays detailed information about a specific venue, including images, description, amenities, and a booking form. It fetches the venue details from the API using the venue ID from the URL parameters and handles loading and error states gracefully. The booking form allows users to select check-in and check-out dates, specify the number of guests, and navigate to the checkout page with the booking details when they submit the form. The date picker also excludes dates that are already booked for the venue to prevent double bookings.
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 
import { type Venue } from "../types/Venue";

// This code defines a React component for a detailed venue page. It uses the useParams hook to extract the venue ID from the URL, and the useNavigate hook to programmatically navigate to the checkout page after booking. The component manages local state for the venue details, loading status, error messages, and booking data (check-in/check-out dates and number of guests). It fetches the venue details from the API when the component mounts, and handles form submission to navigate to the checkout page with the booking information. The date picker component is configured to exclude dates that are already booked for the venue, ensuring that users cannot select unavailable dates for their reservation.
export default function SpecificVenuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Local state for venue details, loading status, error messages, and booking data. This state management allows the component to handle the asynchronous fetching of venue details, display loading indicators and error messages as needed, and manage the user's input for booking dates and guest count in a controlled manner.
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking data state to capture user input for check-in/check-out dates and number of guests. This state is used to manage the booking form inputs and to prepare the data for navigation to the checkout page when the user submits their reservation.
  const [bookingData, setBookingData] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    guests: 1,
  });
  // Fetches venue details from the API when the component mounts. This effect runs once when the component is first rendered, and it makes an API call to retrieve the details of the venue based on the ID from the URL. It handles loading and error states to provide feedback to the user while the data is being fetched, and it updates the local state with the retrieved venue information once the API call is successful.
  useEffect(() => {
    const fetchVenueDetails = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${baseUrl}/holidaze/venues/${id}?_owner=true&_bookings=true`, // Fetch venue details with owner and bookings data to display on the page and to determine excluded dates for the date picker.
          {
            headers: {
              "X-Noroff-API-Key": apiKey,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch venue details");

        const data = await response.json();
        setVenue(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchVenueDetails();
    }
  }, [id]);
  // Helper function to calculate excluded dates for the date picker based on existing bookings. This function iterates through the venue's bookings and generates an array of Date objects representing all the dates that are already booked. These dates are then passed to the date picker component to prevent users from selecting unavailable dates for their reservation.
  const getExcludedDates = () => {
    if (!venue?.bookings || venue.bookings.length === 0) return [];
    
    const excludedDates: Date[] = [];
    venue.bookings.forEach((booking) => {
      const start = new Date(booking.dateFrom);
      const end = new Date(booking.dateTo);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        excludedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return excludedDates;
  };
  // Handles the booking form submission. This function validates the user's input for check-in and check-out dates, ensuring that both dates are selected before proceeding. It then formats the booking data and uses the navigate function to route the user to the checkout page, passing the venue details and booking information in the state. This allows the checkout page to access the necessary data to complete the reservation process.
  const handleBooking = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!bookingData.dateFrom || !bookingData.dateTo) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    // Format the booking data to match the expected structure for the checkout page. This includes converting the Date objects to ISO strings, which can be easily parsed on the checkout page to display the selected dates and calculate the total price based on the number of nights and guests.
    const formattedBookingData = {
      dateFrom: bookingData.dateFrom.toISOString(),
      dateTo: bookingData.dateTo.toISOString(),
      guests: bookingData.guests,
    };

    navigate("/checkout", {
      state: {
        venue: venue,
        bookingData: formattedBookingData,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex-grow flex justify-center items-center h-64 font-kadwa" aria-live="polite" aria-busy="true">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]" role="status" aria-label="Loading venue details"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="w-full flex-grow flex justify-center items-center font-kadwa p-8">
        <div className="text-center text-[#4A1D1A] font-bold text-xl" role="alert" aria-live="assertive">
          {error || "Venue not found."}
        </div>
      </div>
    );
  }
  // Safely extract the main image and sub-images from the venue's media array. This code checks if the media array exists and has enough items before trying to access the URLs, preventing potential errors if the media data is missing or incomplete. The main image is used for the large display at the top of the page, while the sub-images are used for the smaller displays on the side.
  const mainImage = venue.media?.[0]?.url;
  const subImage1 = venue.media?.[1]?.url;
  const subImage2 = venue.media?.[2]?.url;
  const excludedDates = getExcludedDates();

  return (
    <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col p-8 font-kadwa">
      <h1 className="text-4xl md:text-5xl font-bold text-[#000000] mb-6 uppercase tracking-wide">
        {venue.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-75 md:h-125">
        <div className="md:col-span-2 bg-[#FAF9F6] border border-[#C5A059]/30 overflow-hidden h-full">
          {mainImage ? (
            <img
              src={mainImage}
              alt={`Main view of ${venue.name}`}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#605F5F] font-bold" aria-label="No main image available">
              No Image Available
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="bg-[#FAF9F6] border border-[#C5A059]/30 h-1/2 overflow-hidden">
            {subImage1 ? (
              <img
                src={subImage1}
                alt={`Additional view 1 of ${venue.name}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#605F5F]/50 text-sm" aria-label="No additional image available">
                Venue Picture
              </div>
            )}
          </div>
          <div className="bg-[#FAF9F6] border border-[#C5A059]/30 h-1/2 overflow-hidden">
            {subImage2 ? (
              <img
                src={subImage2}
                alt={`Additional view 2 of ${venue.name}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#605F5F]/50 text-sm" aria-label="No additional image available">
                Venue Picture
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col">
          {/* OWNER INFO SECTION */}
          <div className="flex items-center gap-6 mb-8 border-b border-[#C5A059]/30 pb-8">
            <img
              src={venue.owner?.avatar?.url || "/ProfilePageGenericIcon.png"}
              alt={`Avatar for host ${venue.owner?.name || "Unknown Owner"}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C5A059]"
              onError={(e) =>
                (e.currentTarget.src = "/ProfilePageGenericIcon.png")
              }
            />
            <div>
              <p className="font-bold text-xl text-[#000000]">
                Hosted by {venue.owner?.name || "Unknown Owner"}
              </p>
              <p className="text-[#605F5F] font-bold" aria-label={`Venue rating: ${venue.rating > 0 ? venue.rating + ' out of 5 stars' : 'Unrated'}`}>
                Venue rating:{" "}
                <span aria-hidden="true">{venue.rating > 0 ? `${venue.rating} ★` : "Unrated"}</span>
              </p>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-[#000000] leading-relaxed whitespace-pre-line text-lg">
              {venue.description || "No description provided for this venue."}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#000000] mb-4">
              Venue Amenities
            </h3>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-8 text-[#000000] font-bold" aria-label="List of venue amenities">
              <li className="flex items-center gap-3">
                <span className="text-[#C5A059] text-xl" aria-hidden="true">
                  {venue.meta.wifi ? "✓" : "✕"}
                </span>
                {venue.meta.wifi ? "Wi-Fi" : "No Wi-Fi"}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#C5A059] text-xl" aria-hidden="true">
                  {venue.meta.parking ? "✓" : "✕"}
                </span>
                {venue.meta.parking ? "Free Parking" : "No Parking"}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#C5A059] text-xl" aria-hidden="true">
                  {venue.meta.breakfast ? "✓" : "✕"}
                </span>
                {venue.meta.breakfast ? "Breakfast Included" : "No Breakfast"}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#C5A059] text-xl" aria-hidden="true">
                  {venue.meta.pets ? "✓" : "✕"}
                </span>
                {venue.meta.pets ? "Pets Allowed" : "No Pets"}
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <form
            onSubmit={handleBooking}
            aria-label="Venue booking form"
            className="bg-[#FFFFFF] border-[3px] border-[#FAF9F6] rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] sticky top-24">
            <h2 className="text-2xl font-bold text-[#000000] mb-2">
              Book Me Now
            </h2>
            <p className="text-[#4A1D1A] font-bold text-xl mb-6" aria-label={`Price per night: $${venue.price}`}>
              ${venue.price}{" "}
              <span className="text-[#605F5F] text-sm font-normal" aria-hidden="true">
                / night
              </span>
            </p>

            <div className="border border-[#C5A059] rounded-xl overflow-visible mb-8 relative z-10 bg-[#FFFFFF]">
              <div className="grid grid-cols-2 border-b border-[#C5A059] divide-x divide-[#C5A059]">
                <div className="p-3 flex flex-col">
                  <label htmlFor="dateFrom" className="text-xs font-bold text-[#000000] uppercase mb-1">
                    Check in
                  </label>
                  <DatePicker
                    id="dateFrom"
                    selected={bookingData.dateFrom}
                    onChange={(date: Date | null) => 
                      setBookingData({ ...bookingData, dateFrom: date })
                    }
                    selectsStart
                    startDate={bookingData.dateFrom}
                    endDate={bookingData.dateTo}
                    minDate={new Date()}
                    excludeDates={excludedDates}
                    placeholderText="Select Date"
                    aria-label="Select check in date"
                    className="w-full text-sm text-[#605F5F] outline-none bg-transparent cursor-pointer font-bold"
                  />
                </div>
                <div className="p-3 flex flex-col">
                  <label htmlFor="dateTo" className="text-xs font-bold text-[#000000] uppercase mb-1">
                    Check out
                  </label>
                  <DatePicker
                    id="dateTo"
                    selected={bookingData.dateTo}
                    onChange={(date: Date | null) => 
                      setBookingData({ ...bookingData, dateTo: date })
                    }
                    selectsEnd
                    startDate={bookingData.dateFrom}
                    endDate={bookingData.dateTo}
                    minDate={bookingData.dateFrom || new Date()}
                    excludeDates={excludedDates}
                    placeholderText="Select Date"
                    aria-label="Select check out date"
                    className="w-full text-sm text-[#605F5F] outline-none bg-transparent cursor-pointer font-bold"
                  />
                </div>
              </div>
              <div className="p-3 flex flex-col">
                <label
                  htmlFor="guestCount"
                  className="text-xs font-bold text-[#000000] uppercase">
                  Guests
                </label>
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  max={venue.maxGuests}
                  placeholder={`Max ${venue.maxGuests} guests`}
                  required
                  aria-required="true"
                  aria-label={`Number of guests, maximum ${venue.maxGuests}`}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      guests: parseInt(e.target.value),
                    })
                  }
                  className="w-full text-sm text-[#605F5F] font-bold outline-none bg-transparent mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              aria-label="Reserve venue"
              className="w-full bg-[#4A1D1A] text-[#C5A059] font-bold text-lg py-3 rounded-full hover:bg-[#3A1412] transition-colors relative z-0">
              Reserve
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}