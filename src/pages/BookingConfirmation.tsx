// This page is for displaying the booking confirmation details after a successful reservation. It retrieves the booking information from the location state, calculates the total price based on the selected dates and venue price, and presents a summary of the booking along with important information for the user. If the required booking data is not present in the location state, it redirects the user back to the home page to prevent access to this page without a valid booking context.
import { useLocation, Link, Navigate } from "react-router-dom";
import { type ConfirmationState } from "../types/booking";

export default function BookingConfirmationPage() {
  const location = useLocation();

  // Redirect to venues if no booking state is present
  const state = location.state as ConfirmationState;
  if (!state || !state.venue) {
    return <Navigate to="/" />;
  }
  // Destructure the necessary data from the location state for use in the component. This includes the venue details, booking data (dates and number of guests), and the contact email for confirmation. This data is essential for displaying the booking summary and important information to the user on this confirmation page.
  const { venue, bookingData, contactEmail } = state;

  // Price Calculation: Determine total cost based on the date range and venue price
  const checkIn = new Date(bookingData.dateFrom);
  const checkOut = new Date(bookingData.dateTo);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = diffDays * venue.price;

  return (
    <div 
      className="w-full flex-grow flex flex-col items-center p-4 md:p-8 font-kadwa"
      aria-labelledby="confirmation-page-title"
    >
      {/* Page Header */}
      <div className="w-full max-w-6xl mb-8 text-center md:text-left mt-4">
        <h1 
          id="confirmation-page-title"
          className="text-3xl md:text-5xl font-extrabold text-[#000000] uppercase tracking-wide"
        >
          Booking Confirmed
        </h1>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Success Confirmation & Info */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl p-8 md:p-10 shadow-xl relative overflow-hidden flex-grow">

            <div className="absolute top-0 left-0 w-3 h-full bg-[#C5A059]" aria-hidden="true"></div>

            <div className="pl-4 md:pl-6">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-[#000000] mb-2 uppercase tracking-wide">
                  Thank you!
                </h2>
                <p className="text-xl font-bold text-[#4A1D1A]">
                  Your adventure is officially booked.
                </p>
              </div>

              <div role="region" aria-labelledby="important-info-heading">
                <h3 
                  id="important-info-heading"
                  className="text-xl font-bold text-[#000000] mb-6 border-b border-[#C5A059]/30 pb-2"
                >
                  Important Information
                </h3>
                <ul className="space-y-8">
                  <li className="flex items-start gap-4">
                    <span className="text-[#C5A059] text-3xl leading-none" aria-hidden="true">
                      ✉️
                    </span>
                    <p className="text-[#605F5F] leading-relaxed">
                      A detailed confirmation email and receipt has been sent to
                      <br aria-hidden="true" />
                      <span className="font-bold text-[#000000] text-lg">
                        {contactEmail || "your registered email"}
                      </span>
                    </p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[#C5A059] text-3xl leading-none" aria-hidden="true">
                      👤
                    </span>
                    <p className="text-[#605F5F] leading-relaxed mt-1">
                      You can manage, review, or cancel this booking at any time
                      by visiting your user profile.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Receipt */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div 
            className="bg-[#4A1D1A] border-[3px] border-[#C5A059] rounded-4xl shadow-xl overflow-hidden flex-grow flex flex-col"
            role="region"
            aria-labelledby="receipt-heading"
          >
            <div className="p-6 text-center border-b border-[#C5A059]/30">
              <h2 
                id="receipt-heading"
                className="text-2xl font-bold text-[#C5A059] uppercase tracking-widest"
              >
                Official Receipt
              </h2>
            </div>

            {/* Venue Image */}
            <div className="w-full h-48 border-b border-[#C5A059]/30 bg-[#FAF9F6]">
              <img
                src={venue.media[0]?.url || "/fallback-image.jpg"}
                alt={`Image of ${venue.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback-image.jpg";
                }}
              />
            </div>

            <div className="p-8 flex flex-col flex-grow space-y-5">
              <div className="text-center mb-4">
                <span className="text-[#C5A059] text-sm uppercase tracking-wider font-bold block mb-1" aria-hidden="true">
                  Destination
                </span>
                <span className="font-bold text-[#FAF9F6] text-xl uppercase tracking-wide truncate block">
                  <span className="sr-only">Destination: </span>{venue.name}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#C5A059] font-bold uppercase tracking-wider">
                  Guests:
                </span>
                <span className="font-bold text-[#FAF9F6]">
                  {bookingData.guests}{" "}
                  {bookingData.guests === 1 ? "Guest" : "Guests"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#C5A059] font-bold uppercase tracking-wider">
                  Dates:
                </span>
                <span className="font-bold text-[#FAF9F6]">
                  {checkIn.toLocaleDateString()} -{" "}
                  {checkOut.toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#C5A059] font-bold uppercase tracking-wider">
                  Rate:
                </span>
                <span className="font-bold text-[#FAF9F6]">
                  ${venue.price} / nt
                </span>
              </div>

              {/* Total Price Section */}
              <div className="flex justify-between items-center border-t border-[#C5A059]/30 pt-6 mt-4 mb-8">
                <span className="text-lg font-bold text-[#C5A059] uppercase tracking-wider">
                  Total Paid:
                </span>
                <span className="text-3xl font-bold text-[#FAF9F6]">
                  ${totalPrice}
                </span>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                <Link
                  to="/"
                  className="block w-full text-center bg-[#C5A059] text-[#4A1D1A] font-bold text-lg py-3 rounded-full hover:bg-[#FFFFFF] transition-colors shadow-lg"
                  aria-label="Return to the home page"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}