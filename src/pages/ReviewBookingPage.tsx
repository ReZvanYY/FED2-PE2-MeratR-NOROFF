// Review booking page for venue managers to review and accept or cancel incoming bookings. This page fetches the booking details, including the associated venue and customer information, and provides a clear interface for decision-making. The manager can accept the booking by acknowledging the terms or cancel it, which will delete the reservation from the system.
import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Booking } from "../types/user";

// Extended interface to handle the API response when fetching a booking with _venue and _customer flags to include the related venue and customer data in the same response, simplifying state management and rendering logic on this page.
interface ReviewBooking extends Booking {
  venue: {
    id: string;
    name: string;
    price: number;
    description: string;
    maxGuests: number;
    media: { url: string; alt: string }[];
    meta: {
      wifi: boolean;
      parking: boolean;
      breakfast: boolean;
      pets: boolean;
    };
    location: { address?: string; city?: string; country?: string };
  };
  customer: {
    name: string;
    email: string;
    avatar: { url: string; alt: string };
  };
}
// This page is protected and only accessible to authenticated venue managers. It includes guard clauses to redirect unauthorized users to the login page or their profile if they are not managers, ensuring that only the intended audience can access the booking review functionality.
export default function ReviewBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, venueManager } = useAuth();
  // Local state to manage booking details, loading and error states, agreement checkbox, and processing state for actions. This allows the component to handle the asynchronous data fetching and user interactions smoothly, providing feedback during loading and error conditions, and ensuring that the manager acknowledges the terms before accepting a booking.
  const [booking, setBooking] = useState<ReviewBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch the specific booking details, including the venue and customer data in one request using the Noroff API's ability to include related data with the _venue and _customer query parameters. This simplifies the data management on the frontend and ensures that all necessary information is available for rendering the booking review page without needing multiple API calls.
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id || !accessToken) return;
      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${baseUrl}/holidaze/bookings/${id}?_venue=true&_customer=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
            },
          },
        );

        if (!response.ok) throw new Error("Could not load booking details.");

        const data = await response.json();
        setBooking(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, accessToken]);

  // Handle "Accept Booking" (Checks agreement and routes to dashboard) This function checks if the manager has agreed to the terms and conditions by verifying the state of the agreement checkbox. If they have not agreed, it alerts them to check the box.
  const handleAcceptBooking = () => {
    if (!agreed) {
      alert(
        "You must check the terms and conditions box to accept this booking.",
      );
      return;
    }
    alert("Booking formally accepted and acknowledged!");
    navigate("/dashboard");
  };

  // Handle "Cancel Booking". This function prompts the manager for confirmation before sending a DELETE request to the Noroff API to cancel the booking. It manages the processing state to provide feedback during the cancellation process and handles any errors that may occur, ensuring that the manager is informed of the outcome of their action.
  const handleCancelBooking = async () => {
    if (!id || !accessToken) return;

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this guest's booking? This cannot be undone.",
    );
    if (!confirmCancel) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsProcessing(true);
      const response = await fetch(`${baseUrl}/holidaze/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      });

      if (!response.ok) throw new Error("Failed to cancel the booking.");

      alert("Booking has been successfully canceled.");
      navigate("/dashboard");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred during cancellation.",
      );
      setIsProcessing(false);
    }
  };

  // Guard Clauses to protect the page and ensure only authenticated venue managers can access it. If the user is not authenticated, they are redirected to the login page. If they are authenticated but not a venue manager, they are redirected to their profile page, ensuring that only the intended audience can access the booking review functionality.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  if (isLoading) {
    return (
      <div
        className="w-full flex-grow flex justify-center items-center font-kadwa bg-[#FAF9F6] min-h-screen"
        role="status"
        aria-live="polite">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]"
          aria-label="Loading booking details"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div
        className="w-full flex-grow flex justify-center items-center font-kadwa bg-[#FAF9F6] p-8"
        role="alert"
        aria-live="assertive">
        <div className="text-center text-[#4A1D1A] font-bold text-xl">
          {error || "Booking not found."}
          <br />
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="Return to your dashboard"
            className="text-[#C5A059] hover:underline mt-4 text-sm uppercase">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Derived calculations for the UI to determine the number of nights and total price based on the booking dates and venue price. This ensures that the payment information displayed to the manager is accurate and reflects the details of the booking they are reviewing.
  const checkIn = new Date(booking.dateFrom);
  const checkOut = new Date(booking.dateTo);
  const nights =
    Math.ceil(
      Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    ) || 1;
  const totalPrice = nights * booking.venue.price;

  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10 min-w-75">
      <h1 className="text-2xl md:text-4xl font-extrabold text-center text-[#000000] mb-8 md:mb-12 tracking-wide">
        Review Requested Booking
      </h1>

      {/* Main Outer Container */}
      <div className="w-full max-w-6xl mx-auto bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl md:rounded-[3rem] p-5 md:p-10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/*Venue Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#000000] uppercase tracking-wide truncate">
              {booking.venue.name}
            </h2>

            {/* Venue Image */}
            <div className="w-full aspect-video border border-[#C5A059]/40 rounded-2xl overflow-hidden shadow-sm bg-[#E5E5E5]">
              {booking.venue.media && booking.venue.media.length > 0 ? (
                <img
                  src={booking.venue.media[0].url}
                  alt={`Image of venue: ${booking.venue.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-image.jpg";
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-[#605F5F] uppercase text-sm"
                  aria-hidden="true">
                  VENUE IMAGE
                </div>
              )}
            </div>

            {/* Venue Amenities & Bio */}
            <div
              className="w-full border border-[#C5A059]/40 rounded-2xl p-6 shadow-sm min-h-50 flex flex-col"
              aria-label="Venue Description and Amenities">
              <h3 className="font-bold text-[#4A1D1A] uppercase text-sm mb-2">
                Venue Description
              </h3>
              <p className="text-sm text-[#605F5F] mb-6 line-clamp-4">
                {booking.venue.description || "No description provided."}
              </p>

              <h3 className="font-bold text-[#4A1D1A] uppercase text-sm mb-2 mt-auto">
                Amenities
              </h3>
              <ul
                className="grid grid-cols-2 gap-2 text-sm font-bold text-[#000000]"
                aria-label="List of amenities">
                <li className="flex items-center gap-2">
                  <span className="text-[#C5A059]" aria-hidden="true">
                    {booking.venue.meta.wifi ? "✓" : "✕"}
                  </span>
                  {booking.venue.meta.wifi ? "Wi-Fi" : "No Wi-Fi"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C5A059]" aria-hidden="true">
                    {booking.venue.meta.parking ? "✓" : "✕"}
                  </span>
                  {booking.venue.meta.parking ? "Parking" : "No Parking"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C5A059]" aria-hidden="true">
                    {booking.venue.meta.breakfast ? "✓" : "✕"}
                  </span>
                  {booking.venue.meta.breakfast ? "Breakfast" : "No Breakfast"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C5A059]" aria-hidden="true">
                    {booking.venue.meta.pets ? "✓" : "✕"}
                  </span>
                  {booking.venue.meta.pets ? "Pets allowed" : "No Pets"}
                </li>
              </ul>
            </div>
          </div>

          {/* Reservation & Action Panel */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="w-full border border-[#C5A059]/50 rounded-4xl p-6 md:p-8 shadow-sm flex flex-col h-full bg-[#FFFFFF]">
              {/* Reservation Information */}
              <div className="mb-8" aria-labelledby="reservation-info-heading">
                <h3
                  id="reservation-info-heading"
                  className="text-lg md:text-xl font-extrabold text-[#000000] uppercase tracking-wide mb-4">
                  Reservation Information
                </h3>
                <div className="space-y-2 text-sm md:text-base text-[#000000] flex flex-col">
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Contact person:</span>
                    <span
                      className="text-right ml-2 truncate max-w-37.5 md:max-w-50"
                      aria-label={`Customer name: ${booking.customer.name}`}>
                      {booking.customer.name}
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Phone number:</span>
                    <span className="text-right text-[#605F5F]">
                      Not provided
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Booking start:</span>
                    <span className="text-right">
                      {checkIn.toLocaleDateString()}
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Booking End:</span>
                    <span className="text-right">
                      {checkOut.toLocaleDateString()}
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Guests:</span>
                    <span className="text-right">{booking.guests}</span>
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-8" aria-labelledby="payment-info-heading">
                <h3
                  id="payment-info-heading"
                  className="text-lg md:text-xl font-extrabold text-[#000000] uppercase tracking-wide mb-4">
                  Payment Information
                </h3>
                <div className="space-y-2 text-sm md:text-base text-[#000000] flex flex-col">
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Total nights stayed:</span>
                    <span className="text-right">
                      {nights} Night{nights !== 1 ? "s" : ""}
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Price per night:</span>
                    <span className="text-right">${booking.venue.price}</span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Total amount payed:</span>
                    <span className="text-right">${totalPrice}</span>
                  </p>
                  <p className="flex justify-between border-b border-[#C5A059]/20 pb-1">
                    <span className="font-bold">Payment method:</span>
                    <span className="text-right">Card payment</span>
                  </p>
                </div>
              </div>

              {/* Actions Area */}
              <div className="mt-auto pt-6 flex flex-col items-center gap-6">
                <label
                  htmlFor="terms-checkbox"
                  className="flex items-start gap-3 w-full cursor-pointer">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#C5A059] shrink-0 cursor-pointer"
                    aria-required="true"
                  />
                  <span className="text-xs md:text-sm font-bold text-[#000000] leading-snug">
                    I have read and accept the terms & conditions as a HOST for
                    this venue.
                  </span>
                </label>

                <div className="w-full flex flex-col items-center gap-4">
                  <button
                    onClick={handleAcceptBooking}
                    disabled={isProcessing}
                    aria-busy={isProcessing}
                    className="w-full md:w-3/4 bg-[#4A1D1A] text-[#C5A059] font-bold text-lg py-3 rounded-full shadow-lg border-[3px] border-[#4A1D1A] hover:bg-[#3A1412] hover:border-[#C5A059] transition-all disabled:opacity-50 uppercase tracking-widest">
                    Accept Booking
                  </button>

                  <button
                    onClick={handleCancelBooking}
                    disabled={isProcessing}
                    aria-busy={isProcessing}
                    className="font-extrabold text-[#000000] text-sm uppercase tracking-widest hover:text-red-700 transition-colors disabled:opacity-50">
                    {isProcessing ? "Processing..." : "Cancel Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
