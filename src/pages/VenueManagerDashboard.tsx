// This page serves as the central hub for venue managers to oversee their venues and incoming bookings. It features two main sections: "Your Venues" on the left, where managers can view, edit, or delete their listed venues, and "Venue Requested" on the right, which displays upcoming bookings that require the manager's attention. The dashboard fetches all necessary data in a single API call to optimize performance and minimize load times. It also includes robust error handling and loading states to ensure a smooth user experience. Managers can easily navigate to edit their venues or review booking details directly from the dashboard, making it an efficient tool for managing their listings and customer interactions.
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Venue } from "../types/Venue";
import { type Booking } from "../types/user";

// The DashboardBooking interface extends the basic Booking structure to include additional details about the venue associated with each booking. This includes the venue's name, price, media (for displaying images), and location information. This enriched data structure allows the dashboard to present a more comprehensive view of each booking, making it easier for venue managers to quickly assess and manage their incoming reservations without needing to make additional API calls for venue details.
export interface DashboardBooking extends Booking {
  venueName: string;
  venuePrice: number;
  venueMedia: { url: string; alt: string }[];
  venueLocation?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
}

export default function DashboardPage() {
  const { user, accessToken, isAuthenticated, venueManager } = useAuth();

  // Core state for the dashboard arrays and UI states for loading, errors, and forced re-renders
  const [venues, setVenues] = useState<Venue[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<DashboardBooking[]>(
    [],
  );

  // UI states for loading, errors, and forced re-renders to ensure the dashboard reflects the most current data after actions like declining bookings or deleting venues.
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !!(isAuthenticated && venueManager),
  );

  // Fetches the manager's venues (with bookings and customer details included)
  // every time the component loads or the refreshTrigger is updated.
  useEffect(() => {
    const fetchDashboardContent = async () => {
      if (!isAuthenticated || !venueManager || !user?.name || !accessToken) {
        setIsLoading(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        const response = await fetch(
          `${baseUrl}/holidaze/profiles/${user.name}/venues?_bookings=true&_customer=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to load dashboard data.");

        const jsonResponse = await response.json();
        const activeVenues: Venue[] = jsonResponse.data;
        setVenues(activeVenues);

        // Flatten the nested bookings into a single array and attach necessary venue data to each booking for display in the "Venue Requested" section. This allows the dashboard to present all upcoming bookings in a single list, sorted chronologically, without needing to navigate into each venue to see its bookings. Only bookings that have not yet expired (dateTo in the future) are included to ensure the manager's focus is on actionable items.
        const extracted: DashboardBooking[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        activeVenues.forEach((venue) => {
          if (venue.bookings && venue.bookings.length > 0) {
            venue.bookings.forEach((booking) => {
              // Only push bookings that haven't expired yet for the "Venue Requested" column
              if (new Date(booking.dateTo) >= today) {
                extracted.push({
                  ...booking,
                  venueName: venue.name,
                  venuePrice: venue.price,
                  venueMedia: venue.media,
                  venueLocation: venue.location,
                } as DashboardBooking);
              }
            });
          }
        });

        // Chronological sort: closest upcoming bookings appear at the top
        extracted.sort(
          (a, b) =>
            new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime(),
        );
        setUpcomingBookings(extracted);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardContent();
  }, [user?.name, accessToken, isAuthenticated, venueManager, refreshTrigger]);

  // Cancels a booking via the API and refreshes the dashboard UI instantly.
  const handleDeclineBooking = async (bookingId: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to decline this booking?",
    );
    if (!isConfirmed || !accessToken) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${baseUrl}/holidaze/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        },
      );

      if (!response.ok) throw new Error("Could not drop the booking.");

      alert("Booking declined successfully.");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline booking.");
      setIsLoading(false);
    }
  };

  // Deletes an entire venue via the API and refreshes the dashboard UI instantly.
  const handleDeleteVenue = async (venueId: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this venue? This action cannot be undone.",
    );
    if (!isConfirmed || !accessToken) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/holidaze/venues/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0]?.message || "Could not delete the venue.",
        );
      }

      alert("Venue deleted successfully.");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete venue.");
      setIsLoading(false);
    }
  };

  // Helper function to calculate nights between check-in and check-out
  const calculateNights = (from: string, to: string) => {
    const diffTime = Math.abs(
      new Date(to).getTime() - new Date(from).getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Guard Clauses to protect the dashboard route: if the user is not authenticated, send them to login; if they are authenticated but not a venue manager, send them to their profile page. This ensures that only users with the appropriate permissions can access the dashboard, while others are guided to the correct sections of the app based on their authentication and role status.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  if (isLoading) {
    return (
      <div className="w-full flex-grow flex justify-center items-center font-kadwa">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex-grow bg-[#FAF9F6] font-kadwa p-4 md:p-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-[#000000] mb-12 tracking-wide">
        Venue Dashboard
      </h1>

      {error && (
        <div className="max-w-7xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8 text-center font-bold">
          {error}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Your Venues */}
        <div className="bg-[#FFFFFF] border border-[#C5A059] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-extrabold text-[#000000]">
              Your Venues
            </h2>
            <Link
              to="/create-venue"
              className="text-[#C5A059] hover:opacity-70 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10">
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          <div className="flex flex-col gap-5 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {venues.length > 0 ? (
              venues.map((venue) => {
                const venueLocationText =
                  [venue.location?.city, venue.location?.country]
                    .filter(Boolean)
                    .join(", ") || "Location unlisted";

                return (
                  <div
                    key={venue.id}
                    className="border border-[#C5A059] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 bg-[#FFFFFF] shadow-sm relative pt-14 md:pt-4">
                    {/* Venue Image */}
                    <div className="w-full md:w-32 h-32 shrink-0 border border-[#C5A059]/40 rounded-xl overflow-hidden bg-[#FAF9F6]">
                      {venue.media && venue.media.length > 0 ? (
                        <img
                          src={venue.media[0].url}
                          alt={venue.media[0].alt || venue.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#605F5F] uppercase text-center p-2">
                          Venue Image
                        </div>
                      )}
                    </div>

                    {/* Venue Details & Buttons */}
                    <div className="flex-grow flex flex-col items-center md:items-start w-full">
                      <div className="absolute top-4 left-4 md:static flex flex-col items-start w-full">
                        <h3 className="font-bold text-lg text-[#000000] truncate max-w-50">
                          {venue.name}
                        </h3>
                        {/* Location Icon & Text */}
                        <div className="flex items-center gap-1.5 text-[#4A1D1A] mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3.5 h-3.5 shrink-0">
                            <path
                              fillRule="evenodd"
                              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-xs font-bold uppercase tracking-wider truncate max-w-55">
                            {venueLocationText}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: Edit and Delete stacked */}
                      <div className="mt-8 md:mt-auto md:ml-auto w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                        <Link
                          to={`/edit-venue/${venue.id}`}
                          className="bg-[#4A1D1A] text-[#C5A059] border-2 border-[#4A1D1A] font-bold py-2 px-8 rounded-full shadow-md hover:bg-[#3A1412] transition-colors text-sm text-center w-full md:w-auto">
                          Edit Venue
                        </Link>
                        <button
                          onClick={() => handleDeleteVenue(venue.id)}
                          className="text-[#000000] font-extrabold text-[10px] hover:text-red-700 transition-colors uppercase tracking-widest mt-1">
                          Delete Venue
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[#605F5F] text-center py-8 font-bold">
                You haven't added any venues yet.
              </p>
            )}
          </div>
        </div>

        {/* Venue Requested (Bookings) */}
        <div className="bg-[#FFFFFF] border border-[#C5A059] rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#000000] mb-8">
            Venue Requested
          </h2>

          <div className="flex flex-col gap-5 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => {
                const nights = calculateNights(
                  booking.dateFrom,
                  booking.dateTo,
                );
                const bookingLocationText =
                  [booking.venueLocation?.city, booking.venueLocation?.country]
                    .filter(Boolean)
                    .join(", ") || "Location unlisted";

                return (
                  <div
                    key={booking.id}
                    className="border border-[#C5A059] rounded-2xl p-4 flex flex-col lg:flex-row gap-6 bg-[#FFFFFF] shadow-sm relative pt-14 lg:pt-4">
                    {/* Booking Venue Image */}
                    <div className="w-full lg:w-32 h-32 shrink-0 border border-[#C5A059]/40 rounded-xl overflow-hidden bg-[#FAF9F6]">
                      {booking.venueMedia && booking.venueMedia.length > 0 ? (
                        <img
                          src={booking.venueMedia[0].url}
                          alt={booking.venueName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#605F5F] uppercase text-center p-2">
                          Venue Image
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-grow flex flex-col justify-center">
                      <div className="absolute top-4 left-4 lg:static flex flex-col items-start w-full mb-2">
                        <h3 className="font-bold text-lg text-[#000000] truncate max-w-50">
                          {booking.venueName}
                        </h3>
                        {/* Location Icon & Text */}
                        <div className="flex items-center gap-1.5 text-[#4A1D1A] mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3.5 h-3.5 shrink-0">
                            <path
                              fillRule="evenodd"
                              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-xs font-bold uppercase tracking-wider truncate max-w-55">
                            {bookingLocationText}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row justify-between w-full mt-8 lg:mt-0 items-center lg:items-start">
                        <div className="text-sm font-bold text-[#000000] space-y-1 mb-4 lg:mb-0 text-center lg:text-left">
                          <p>
                            Staying for: {nights} night{nights !== 1 ? "s" : ""}
                          </p>
                          <p>Guests: {booking.guests}</p>
                          <p>Price: {booking.venuePrice} per night</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col items-center gap-2">
                          <Link
                            to={`/venues/${booking.venue?.id || ""}`}
                            className="bg-[#4A1D1A] text-[#C5A059] border-2 border-[#4A1D1A] font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#3A1412] transition-colors text-sm w-44 text-center">
                            Review Booking
                          </Link>
                          <button
                            onClick={() => handleDeclineBooking(booking.id)}
                            className="text-[#000000] font-extrabold text-[10px] hover:text-red-700 transition-colors uppercase tracking-widest mt-1">
                            Decline booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[#605F5F] text-center py-8 font-bold">
                No incoming venue requests.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
