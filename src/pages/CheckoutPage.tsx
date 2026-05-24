// This is the checkout page component for the Holidaze booking application. It handles the final steps of the booking process, including displaying a summary of the reservation, collecting contact and payment information from the user, and submitting the booking to the API. The component also includes validation to ensure that users agree to the terms and conditions and provide necessary contact information before confirming their reservation. Additionally, it displays details about the venue being booked, including images and owner information, to provide context for the user during checkout.
import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type CheckoutState } from "../types/booking";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Payment Method State to manage the user's selected payment option and conditionally render the appropriate input fields. This state allows the component to dynamically display different form fields based on whether the user chooses to pay by card, Klarna, or Vipps, enhancing the user experience by providing a tailored checkout form that matches their preferred payment method.
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Local state for contact & payment information collected during checkout. This state is used to manage the form inputs for the user's name, email, address, and payment details. It allows the component to capture and update this information as the user fills out the form, and it can be used to submit the booking data to the API when the user confirms their reservation. The state is initialized with default values based on the user's profile if they are logged in, providing a more seamless checkout experience by pre-filling known information.
  const [formData, setFormData] = useState({
    name: user?.name?.split(" ")[0] || "",
    surname: user?.name?.split(" ").slice(1).join(" ") || "",
    // The email will default to the user's email if logged in, but can be changed during checkout to allow for different contact information if needed. This flexibility is important for users who may want to use an alternative email address for booking confirmations or receipts, while still providing a convenient default based on their profile.
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    // Payment specific states are initialized as empty strings and will be conditionally required based on the selected payment method. This allows the form to adapt to different payment options while ensuring that all necessary information is collected for the chosen method.
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    klarnaId: "",
    vippsPhone: "",
  });

  const state = location.state as CheckoutState;
  if (!state || !state.venue) {
    return <Navigate to="/venues" />;
  }

  const { venue, bookingData } = state;
  // Format the check-in and check-out dates for display in the reservation summary. This code converts the ISO date strings from the booking data into a more user-friendly format using toLocaleDateString, which will display the dates in a readable format based on the user's locale settings. This enhances the user experience by providing clear and easily understandable date information during checkout.
  const checkInDate = new Date(bookingData.dateFrom).toLocaleDateString();
  const checkOutDate = new Date(bookingData.dateTo).toLocaleDateString();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmAndPay = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!agreed) {
      alert("You must agree to the terms & conditions to proceed.");
      return;
    }

    // Ensure they provided an email for the confirmation
    if (!formData.email) {
      alert("Please provide an email address for the booking confirmation.");
      return;
    }

    setIsProcessing(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${baseUrl}holidaze/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateFrom: bookingData.dateFrom,
          dateTo: bookingData.dateTo,
          guests: Number(bookingData.guests),
          venueId: venue.id,
        }),
      });

      if (response.ok) {
        // Pass the user's selected email to the confirmation page
        navigate("/booking-confirmation", {
          state: {
            venue: venue,
            bookingData: bookingData,
            contactEmail: formData.email,
          },
        });
      } else {
        const errData = await response.json();
        alert(
          `Booking failed: ${errData.errors?.[0]?.message || "Check login status."}`,
        );
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("A network error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="w-full flex-grow flex justify-center p-4 md:p-8 font-kadwa"
      aria-labelledby="checkout-heading"
    >
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 mt-4">
        {/* Checkout Form */}
        <div className="w-full lg:w-100 shrink-0">
          <form
            onSubmit={handleConfirmAndPay}
            aria-label="Checkout flow"
            className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 shadow-xl border border-[#FAF9F6]">
            
            {/* Reservation Summary */}
            <h3 id="reservation-heading" className="font-bold text-lg text-[#000000] mb-2 pl-1">
              Reservation
            </h3>
            <div 
              role="group"
              aria-labelledby="reservation-heading"
              className="border border-[#C5A059] rounded-xl flex flex-col mb-6 overflow-hidden bg-[#FAF9F6]"
            >
              <div className="grid grid-cols-2 divide-x divide-[#C5A059] border-b border-[#C5A059]">
                <div className="p-3 text-center flex flex-col justify-center">
                  <span className="text-xs font-bold text-[#605F5F] uppercase mb-1">
                    Check in
                  </span>
                  <span className="text-sm font-bold text-[#000000]">
                    {checkInDate}
                  </span>
                </div>
                <div className="p-3 text-center flex flex-col justify-center">
                  <span className="text-xs font-bold text-[#605F5F] uppercase mb-1">
                    Check out
                  </span>
                  <span className="text-sm font-bold text-[#000000]">
                    {checkOutDate}
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
                <span className="text-xs font-bold text-[#605F5F] uppercase block mb-1">
                  Guests
                </span>
                <span className="text-sm font-bold text-[#000000] block">
                  {bookingData.guests} guests
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <h3 id="contact-heading" className="font-bold text-lg text-[#000000] mb-2 pl-1">
              Contact Information
            </h3>
            <div 
              role="group"
              aria-labelledby="contact-heading"
              className="border border-[#C5A059] rounded-xl flex flex-col mb-8 overflow-hidden divide-y divide-[#C5A059]"
            >
              {/* Name & Surname */}
              <div className="grid grid-cols-2 divide-x divide-[#C5A059]">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  aria-label="First Name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                />
                <input
                  type="text"
                  name="surname"
                  placeholder="Surname"
                  aria-label="Surname"
                  required
                  value={formData.surname}
                  onChange={handleInputChange}
                  className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                />
              </div>

              {/* Address */}
              <input
                type="text"
                name="address"
                placeholder="Address"
                aria-label="Address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />

              {/* City & Postal Code */}
              <div className="grid grid-cols-2 divide-x divide-[#C5A059]">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  aria-label="City"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  aria-label="Postal Code"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                />
              </div>

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                aria-label="Phone Number"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email Address (For Receipt)"
                aria-label="Email Address for Receipt"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
              />
            </div>

            {/* Payment Method */}
            <h3 id="payment-heading" className="font-bold text-lg text-[#000000] mb-2 pl-1">
              Payment Method
            </h3>
            <div 
              role="group"
              aria-labelledby="payment-heading"
              className="flex flex-col space-y-3 mb-6"
            >
              {/* Credit Card Section */}
              <div
                className={`border rounded-xl transition-colors overflow-hidden ${paymentMethod === "card" ? "border-[3px] border-[#4A1D1A] bg-[#FAF9F6]" : "border-[#C5A059]"}`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  aria-expanded={paymentMethod === "card"}
                  aria-controls="card-payment-section"
                  className="w-full py-3 font-bold text-sm flex justify-center items-center gap-2">
                  <span aria-hidden="true">💳</span> Credit Or Debit Card
                </button>
                {paymentMethod === "card" && (
                  <div 
                    id="card-payment-section"
                    className="border border-[#C5A059] rounded-xl flex flex-col overflow-hidden divide-y divide-[#C5A059] bg-[#FFFFFF] mx-4 mb-4"
                  >
                    <input
                      type="text"
                      name="nameOnCard"
                      placeholder="Name on card"
                      aria-label="Name on card"
                      required={paymentMethod === "card"}
                      value={formData.nameOnCard}
                      onChange={handleInputChange}
                      className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                    />
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Card number"
                      aria-label="Card number"
                      required={paymentMethod === "card"}
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                    />
                    <div className="grid grid-cols-2 divide-x divide-[#C5A059]">
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        aria-label="Expiration Date (MM/YY)"
                        required={paymentMethod === "card"}
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                      />
                      <input
                        type="text"
                        name="cvc"
                        placeholder="CVC"
                        aria-label="CVC code"
                        required={paymentMethod === "card"}
                        maxLength={4}
                        value={formData.cvc}
                        onChange={handleInputChange}
                        className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Klarna Section */}
              <div
                className={`border rounded-xl transition-colors overflow-hidden ${paymentMethod === "klarna" ? "border-[3px] border-[#4A1D1A] bg-[#FAF9F6]" : "border-[#C5A059]"}`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("klarna")}
                  aria-expanded={paymentMethod === "klarna"}
                  aria-controls="klarna-payment-section"
                  className="w-full py-3 font-bold text-sm flex items-center justify-center gap-2">
                  <span className="text-[#FFB3C7]">Klarna.</span>
                </button>
                {paymentMethod === "klarna" && (
                  <div 
                    id="klarna-payment-section"
                    className="border border-[#C5A059] rounded-xl flex flex-col overflow-hidden bg-[#FFFFFF] mx-4 mb-4"
                  >
                    <input
                      type="text"
                      name="klarnaId"
                      placeholder="Birth Date (11 digits)"
                      aria-label="Klarna Identity Number (11 digits)"
                      required={paymentMethod === "klarna"}
                      pattern="\d{11}"
                      maxLength={11}
                      title="Please enter your 11 digit identity number"
                      value={formData.klarnaId}
                      onChange={handleInputChange}
                      className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Vipps Section */}
              <div
                className={`border rounded-xl transition-colors overflow-hidden ${paymentMethod === "vipps" ? "border-[3px] border-[#4A1D1A] bg-[#FAF9F6]" : "border-[#C5A059]"}`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vipps")}
                  aria-expanded={paymentMethod === "vipps"}
                  aria-controls="vipps-payment-section"
                  className="w-full py-3 font-bold text-sm flex items-center justify-center gap-2">
                  <span className="text-[#FF5B24]">vips</span>
                </button>
                {paymentMethod === "vipps" && (
                  <div 
                    id="vipps-payment-section"
                    className="border border-[#C5A059] rounded-xl flex flex-col overflow-hidden bg-[#FFFFFF] mx-4 mb-4"
                  >
                    <input
                      type="tel"
                      name="vippsPhone"
                      placeholder="Phone Number"
                      aria-label="Vipps Phone Number"
                      required={paymentMethod === "vipps"}
                      value={formData.vippsPhone}
                      onChange={handleInputChange}
                      className="w-full p-3 text-center text-sm font-bold text-[#000000] placeholder-[#605F5F] outline-none bg-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 mb-8 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                aria-required="true"
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 accent-[#C5A059] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#000000]">
                I have read and agree with the terms & conditions
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isProcessing}
                aria-busy={isProcessing}
                className="bg-[#4A1D1A] text-[#C5A059] font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#3A1412] disabled:opacity-70 transition-colors w-55">
                {isProcessing ? "Processing..." : "Confirm Reservation"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-[#000000] font-extrabold uppercase text-sm tracking-wider hover:text-[#4A1D1A] transition-colors">
                Cancel Booking
              </button>
            </div>
          </form>
        </div>

        {/* Venue Details Display */}
        <div className="w-full flex-grow flex flex-col pl-0 lg:pl-8 pt-4">
          <h1 id="checkout-heading" className="text-3xl md:text-5xl font-extrabold text-[#000000] uppercase tracking-wide mb-6">
            {venue.name}
          </h1>

          <div className="w-full bg-[#E5E5E5] aspect-video border border-[#C5A059]/30 mb-6 overflow-hidden">
            {venue.media && venue.media.length > 0 ? (
              <img
                src={venue.media[0].url}
                alt={venue.media[0].alt || `Image of ${venue.name}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center font-bold text-[#605F5F]"
                aria-label="No image available for this venue"
              >
                venue picture
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[#000000] font-bold text-sm md:text-base">
            <div className="flex items-center gap-3">
              <img
                src={venue.owner?.avatar?.url || "/ProfilePageGenericIcon.png"}
                alt={`Avatar of ${venue.owner?.name || "Unknown Owner"}`}
                className="w-12 h-12 rounded-full border-2 border-[#C5A059] object-cover bg-[#FAF9F6]"
                onError={(e) =>
                  (e.currentTarget.src = "/ProfilePageGenericIcon.png")
                }
              />
              <span>Venue owner: {venue.owner?.name || "Unknown"}</span>
            </div>
            <span>
              <span className="sr-only">Rating: </span>
              {venue.rating > 0 ? `${venue.rating} ★` : "Unrated"}
            </span>
            <span>
              <span className="sr-only">Price: </span>
              ${venue.price} / night
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}