// This page is the profile page. It displays the user's profile information, including their avatar, banner, bio, and a list of their bookings. The user can also update their profile information and manage their bookings from this page. The page is protected and requires authentication to access. It uses the AuthContext to get the current user's information and to handle profile updates. The page also includes a tabbed interface for viewing upcoming bookings, past bookings, and updating profile information. If the user is a venue manager, they can also view their listed venues from this page.
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Booking, type FullProfileData } from "../types/user";

export default function ProfilePage() {
  const { user, isAuthenticated, accessToken, updateUserData } = useAuth();

  // Profile Data State - Manages the user's profile information, including their bio, avatar, banner, and bookings. This state is initialized as null and is populated with data fetched from the API when the component mounts. It allows the component to display the user's profile information and to update it when changes are made.
  const [profile, setProfile] = useState<FullProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI & Tab State - Manages the active tab and form inputs for updating the profile. This state allows the component to track which tab is currently active (upcoming bookings, past bookings, update profile, or venues) and to handle user input for updating their bio, avatar URL, and banner URL. It also manages the state of the booking edit modal, including the selected booking and the form inputs for editing a reservation.
  const [activeTab, setActiveTab] = useState("upcoming");

  // Update Form State - Tracks user input for profile updates, including avatar and banner URLs, and bio. This state is used to manage the form inputs for updating the user's profile information. It allows the user to enter new values for their avatar, banner, and bio, which can then be submitted to the API to update their profile. The state is initialized with empty strings for the URLs and the current bio from the profile data once it is loaded.
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Booking Modal State - Manages the state of the booking edit modal, including the selected booking and form inputs for editing a reservation. This state allows the user to select a booking from their list of upcoming reservations and open a modal to edit the details of that booking, such as the check-in and check-out dates and the number of guests. The state tracks which booking is currently selected for editing, as well as the form inputs for the new dates and guest count. It also manages a processing state to provide feedback while the update or cancellation is being processed.
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editDateFrom, setEditDateFrom] = useState("");
  const [editDateTo, setEditDateTo] = useState("");
  const [editGuests, setEditGuests] = useState(1);
  const [isModalProcessing, setIsModalProcessing] = useState(false);

  // Refreshes the user's profile data from the API. This function is used to fetch the most up-to-date profile information after the user makes changes to their profile or bookings. It sends a GET request to the API to retrieve the user's profile data, including their bookings and venues, and updates the local state with the new data. This ensures that the UI reflects the latest information after any updates are made.
  const refreshProfileData = async () => {
    if (!user?.name || !accessToken) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      const response = await fetch(
        `${baseUrl}holidaze/profiles/${user.name}?_bookings=true&_venues=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (err) {
      console.error("Failed to refresh profile content:", err);
    }
  };

  // Initial data load on mount to fetch the user's profile information, including their bookings and venues. This effect runs when the component first mounts and whenever the user's name or access token changes. It sends a GET request to the API to retrieve the user's profile data, which includes their bio, avatar, banner, bookings, and venues. The retrieved data is then stored in the local state to be displayed on the profile page. If there is an error during the fetch process, it sets an error message in the state to inform the user.
  useEffect(() => {
    const loadInitialProfile = async () => {
      if (!user?.name || !accessToken) return;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        const response = await fetch(
          `${baseUrl}holidaze/profiles/${user.name}?_bookings=true&_venues=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch profile data");

        const data = await response.json();
        setProfile(data.data);
        setBio(data.data.bio || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProfile();
  }, [user?.name, accessToken]);

  // Handle Profile Update (Bio, Avatar, and Banner)
  const handleUpdateProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user?.name || !accessToken) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    // Construct dynamic payload to avoid overwriting existing media with empty strings
    const payload: {
      bio: string;
      avatar?: { url: string; alt: string };
      banner?: { url: string; alt: string };
    } = {
      bio: bio,
    };

    if (avatarUrl.trim() !== "") {
      payload.avatar = { url: avatarUrl, alt: `${user.name}'s avatar` };
    }

    if (bannerUrl.trim() !== "") {
      payload.banner = { url: bannerUrl, alt: `${user.name}'s banner` };
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`${baseUrl}holidaze/profiles/${user.name}`, {
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
        throw new Error(
          errorData.errors?.[0]?.message || "Failed to update profile",
        );
      }

      await refreshProfileData();

      // Update global context so header avatar updates instantly
      if (avatarUrl.trim() !== "") {
        updateUserData({
          avatar: { url: avatarUrl, alt: `${user.name}'s avatar` },
        });
      }

      setAvatarUrl("");
      setBannerUrl("");
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Pre-fill modal data when editing a reservation
  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditDateFrom(booking.dateFrom.split("T")[0]);
    setEditDateTo(booking.dateTo.split("T")[0]);
    setEditGuests(booking.guests);
  };

  // Modify an existing reservation
  const handleSaveBookingChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedBooking || !accessToken) return;

    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const originalDateFrom = selectedBooking.dateFrom.split("T")[0];
    const originalDateTo = selectedBooking.dateTo.split("T")[0];
    const isDateChanged =
      editDateFrom !== originalDateFrom || editDateTo !== originalDateTo;
    const hasBegun = originalDateFrom <= todayStr;

    if (hasBegun && isDateChanged) {
      alert("You cannot change the dates of a booking that has already begun.");
      return;
    }
    if (!hasBegun && isDateChanged && editDateFrom < todayStr) {
      alert("You cannot select a new check-in date in the past.");
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsModalProcessing(true);
      const response = await fetch(
        `${baseUrl}holidaze/bookings/${selectedBooking.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateFrom: editDateFrom,
            dateTo: editDateTo,
            guests: Number(editGuests),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0]?.message || "Failed to modify reservation.",
        );
      }

      await refreshProfileData();
      setSelectedBooking(null);
      alert("Reservation updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsModalProcessing(false);
    }
  };

  // Delete a reservation
  const handleCancelBooking = async () => {
    if (!selectedBooking || !accessToken) return;

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking reservation?",
    );
    if (!confirmCancel) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsModalProcessing(true);
      const response = await fetch(
        `${baseUrl}holidaze/bookings/${selectedBooking.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        },
      );

      if (!response.ok)
        throw new Error("Could not drop the booking reservation.");

      await refreshProfileData();
      setSelectedBooking(null);
      alert("Booking canceled successfully.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to cancel reservation.",
      );
    } finally {
      setIsModalProcessing(false);
    }
  };

  // Guard Clauses - Redirect to login if not authenticated, show loading spinner while fetching data, and handle error states with user-friendly messages. These guard clauses ensure that the user experience is smooth and informative, providing feedback on the current state of the application and guiding the user appropriately based on their authentication status and any issues that may arise during data fetching.
  if (!isAuthenticated) return <Navigate to="/login" />;

  if (isLoading) {
    return (
      <div className="w-full flex-grow flex justify-center items-center font-kadwa" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]" aria-label="Loading profile data"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full flex-grow flex justify-center items-center font-kadwa" role="alert" aria-live="assertive">
        <div className="text-center text-[#4A1D1A] font-bold text-xl">
          {error || "Profile not found."}
          <br />
          <Link
            to="/"
            className="text-[#C5A059] hover:underline mt-2 block text-sm">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter Bookings into Upcoming and Past based on the current date. This logic takes the user's bookings and separates them into two categories: upcoming bookings that have a check-out date in the future, and past bookings that have already ended. This allows the profile page to display these two categories in separate tabs, providing a clear organization of the user's reservation history and upcoming plans.
  const todayDateObj = new Date();
  const upcoming: Booking[] =
    profile.bookings?.filter((b) => new Date(b.dateTo) >= todayDateObj) || [];
  const past: Booking[] =
    profile.bookings?.filter((b) => new Date(b.dateTo) < todayDateObj) || [];

  // Determine if the current modal booking is locked (already started)
  let isModalLocked = false;
  if (selectedBooking) {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    isModalLocked = selectedBooking.dateFrom.split("T")[0] <= todayStr;
  }

  return (
    <div className="w-full flex-grow flex flex-col font-kadwa">
      {/* Dynamic Profile Banner */}
      <div className="w-full h-48 md:h-64 bg-[#E5E5E5] overflow-hidden border-b border-[#C5A059]/30">
        {profile.banner?.url ? (
          <img
            src={profile.banner.url}
            alt="Profile Banner"
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-[#605F5F] text-xl tracking-widest uppercase" aria-hidden="true">
            Profile Banner
          </div>
        )}
      </div>

      {/* Avatar & Basic Info Overlap */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 relative -mt-16 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <img
          src={profile.avatar?.url || "/ProfilePageGenericIcon.png"}
          alt={`${profile.name}'s avatar`}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#FAF9F6] shadow-md bg-[#FFFFFF]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/ProfilePageGenericIcon.png";
          }}
        />
        <div className="pb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#000000] uppercase tracking-wider">
            {profile.name}
          </h1>
          <p className="text-xs font-bold text-[#4A1D1A] uppercase tracking-widest mt-1 mb-1" aria-hidden="true">
            Bio
          </p>
          <p className="text-[#605F5F] text-sm max-w-lg leading-relaxed" aria-label="User biography">
            {profile.bio || "No bio provided yet."}
          </p>
        </div>
      </div>

      {/* Main Interactive Container (Wireframe White Box) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl p-6 md:p-10 shadow-lg min-h-125">
          {/* Top Pill Navigation */}
          <div role="tablist" aria-label="Profile sections" className="flex flex-wrap justify-center gap-4 mb-10 border-b border-[#C5A059]/20 pb-8">
            <button
              id="tab-upcoming"
              role="tab"
              aria-selected={activeTab === "upcoming"}
              aria-controls="tabpanel-upcoming"
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${activeTab === "upcoming" ? "bg-[#4A1D1A] text-[#C5A059] border-[#4A1D1A] shadow-md" : "bg-transparent text-[#4A1D1A] border-[#C5A059] hover:bg-[#C5A059]/10"}`}>
              My Bookings
            </button>
            <button
              id="tab-past"
              role="tab"
              aria-selected={activeTab === "past"}
              aria-controls="tabpanel-past"
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${activeTab === "past" ? "bg-[#4A1D1A] text-[#C5A059] border-[#4A1D1A] shadow-md" : "bg-transparent text-[#4A1D1A] border-[#C5A059] hover:bg-[#C5A059]/10"}`}>
              Previous Bookings
            </button>
            <button
              id="tab-update"
              role="tab"
              aria-selected={activeTab === "update"}
              aria-controls="tabpanel-update"
              onClick={() => setActiveTab("update")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${activeTab === "update" ? "bg-[#4A1D1A] text-[#C5A059] border-[#4A1D1A] shadow-md" : "bg-transparent text-[#4A1D1A] border-[#C5A059] hover:bg-[#C5A059]/10"}`}>
              Update Profile
            </button>
            {profile.venueManager && (
              <button
                id="tab-venues"
                role="tab"
                aria-selected={activeTab === "venues"}
                aria-controls="tabpanel-venues"
                onClick={() => setActiveTab("venues")}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${activeTab === "venues" ? "bg-[#4A1D1A] text-[#C5A059] border-[#4A1D1A] shadow-md" : "bg-transparent text-[#4A1D1A] border-[#C5A059] hover:bg-[#C5A059]/10"}`}>
                My Venues
              </button>
            )}
          </div>

          {/* TAB CONTENT AREA */}
          <div className="w-full">
            {/* 1. UPCOMING BOOKINGS */}
            {activeTab === "upcoming" && (
              <div id="tabpanel-upcoming" role="tabpanel" aria-labelledby="tab-upcoming" className="space-y-6">
                {upcoming.length > 0 ? (
                  upcoming.map((b) => (
                    <div
                      key={b.id}
                      className="border-2 border-[#C5A059]/40 rounded-2xl flex flex-col md:flex-row overflow-hidden bg-[#FAF9F6]">
                      <div className="w-full md:w-1/3 h-48 md:h-auto bg-[#E5E5E5]">
                        <img
                          src={b.venue?.media[0]?.url || "/fallback-image.jpg"}
                          className="w-full h-full object-cover"
                          alt={`Venue: ${b.venue?.name}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-between w-full">
                        <div>
                          <h3 className="text-xl font-bold text-[#000000] uppercase mb-1">
                            {b.venue?.name}
                          </h3>
                          <p className="text-[#4A1D1A] font-bold text-sm mb-4" aria-label={`Dates: ${new Date(b.dateFrom).toLocaleDateString()} to ${new Date(b.dateTo).toLocaleDateString()}`}>
                            {new Date(b.dateFrom).toLocaleDateString()} —{" "}
                            {new Date(b.dateTo).toLocaleDateString()}
                          </p>
                          <p className="text-[#605F5F] text-sm" aria-label={`Number of guests: ${b.guests}`}>
                            Guests: {b.guests}
                          </p>
                        </div>
                        <div className="flex gap-4 mt-6">
                          <Link
                            to={`/venues/${b.venue?.id}`}
                            aria-label={`View details for ${b.venue?.name}`}
                            className="bg-[#4A1D1A] text-[#C5A059] px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#3A1412] transition-colors">
                            Venue Details
                          </Link>
                          <button
                            onClick={() => openEditModal(b)}
                            aria-label={`Edit or cancel booking for ${b.venue?.name}`}
                            className="border-2 border-[#C5A059] text-[#4A1D1A] px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059]/10 transition-colors">
                            Edit / Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center font-bold text-[#605F5F] py-12">
                    No upcoming bookings scheduled.
                  </p>
                )}
              </div>
            )}

            {/* 2. PAST BOOKINGS */}
            {activeTab === "past" && (
              <div id="tabpanel-past" role="tabpanel" aria-labelledby="tab-past" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {past.length > 0 ? (
                  past.map((b) => (
                    <Link
                      to={`/venues/${b.venue?.id}`}
                      key={b.id}
                      aria-label={`Past booking at ${b.venue?.name} on ${new Date(b.dateFrom).toLocaleDateString()}`}
                      className="border border-[#C5A059]/40 rounded-xl flex overflow-hidden hover:shadow-md transition-all bg-[#FAF9F6] h-28">
                      <img
                        src={b.venue?.media[0]?.url || "/fallback-image.jpg"}
                        className="w-1/3 h-full object-cover"
                        alt={`Venue: ${b.venue?.name}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/fallback-image.jpg";
                        }}
                      />
                      <div className="p-4 flex flex-col justify-center">
                        <h4 className="font-bold text-[#000000] uppercase text-sm truncate w-full">
                          {b.venue?.name}
                        </h4>
                        <p className="text-xs font-bold text-[#605F5F] mt-1" aria-hidden="true">
                          {new Date(b.dateFrom).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center font-bold text-[#605F5F] py-12">
                    No previous bookings found.
                  </p>
                )}
              </div>
            )}

            {/* 3. UPDATE PROFILE FORM */}
            {activeTab === "update" && (
              <form
                id="tabpanel-update"
                role="tabpanel"
                aria-labelledby="tab-update"
                onSubmit={handleUpdateProfile}
                className="max-w-2xl mx-auto flex flex-col gap-6">
                <div>
                  <label htmlFor="avatarUrl" className="text-sm font-bold text-[#000000] uppercase tracking-wider mb-2 block">
                    Avatar Image URL
                  </label>
                  <input
                    id="avatarUrl"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Leave blank to keep current avatar"
                    className="w-full border-b-2 border-[#C5A059]/50 py-2 outline-none focus:border-[#C5A059] bg-transparent text-[#000000]"
                  />
                </div>
                <div>
                  <label htmlFor="bannerUrl" className="text-sm font-bold text-[#000000] uppercase tracking-wider mb-2 block">
                    Banner Image URL
                  </label>
                  <input
                    id="bannerUrl"
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="Leave blank to keep current banner"
                    className="w-full border-b-2 border-[#C5A059]/50 py-2 outline-none focus:border-[#C5A059] bg-transparent text-[#000000]"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="text-sm font-bold text-[#000000] uppercase tracking-wider mb-2 block">
                    Biography
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself..."
                    className="w-full border-2 border-[#C5A059]/50 rounded-xl p-4 outline-none focus:border-[#C5A059] bg-transparent text-[#000000] h-32 resize-none"
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    aria-busy={isUpdating}
                    className="bg-[#4A1D1A] text-[#C5A059] px-12 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#3A1412] disabled:opacity-50 transition-colors">
                    {isUpdating ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            )}

            {/* 4. MY VENUES (Only visible to managers) */}
            {activeTab === "venues" && profile.venueManager && (
              <div id="tabpanel-venues" role="tabpanel" aria-labelledby="tab-venues" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.venues && profile.venues.length > 0 ? (
                  profile.venues.map((v) => (
                    <Link
                      to={`/venues/${v.id}`}
                      key={v.id}
                      aria-label={`Manage venue ${v.name}`}
                      className="border-2 border-[#C5A059]/30 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-70">
                      <img
                        src={v.media[0]?.url || "/fallback-image.jpg"}
                        alt={`Thumbnail of ${v.name}`}
                        className="w-full h-40 object-cover bg-[#E5E5E5]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/fallback-image.jpg";
                        }}
                      />
                      <div className="p-4 flex-grow flex flex-col justify-between bg-[#FAF9F6]">
                        <h4 className="font-bold text-[#000000] uppercase truncate">
                          {v.name}
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#4A1D1A]" aria-label={`Price: ${v.price} dollars per night`}>
                            ${v.price}/nt
                          </span>
                          <span className="text-xs font-bold text-[#605F5F] bg-[#E5E5E5] px-2 py-1 rounded" aria-hidden="true">
                            Manage
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center font-bold text-[#605F5F] py-12">
                    You haven't created any venues yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- EDIT / CANCEL BOOKING MODAL --- */}
      {selectedBooking && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 bg-[#000000]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#4A1D1A] p-6 flex justify-between items-center border-b border-[#C5A059]">
              <div>
                <h3 id="modal-title" className="text-lg font-bold text-[#C5A059] uppercase tracking-wider">
                  Manage Reservation
                </h3>
                <p className="text-xs font-bold text-[#FAF9F6] truncate max-w-62.5" aria-label={`Venue: ${selectedBooking.venue?.name}`}>
                  {selectedBooking.venue?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close manage reservation modal"
                className="text-[#C5A059] text-2xl hover:text-[#FFFFFF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBookingChange} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="editCheckIn" className="text-xs font-bold text-[#000000] uppercase mb-1">
                    Check-in{" "}
                    {isModalLocked && (
                      <span className="text-red-600" aria-label="(This date is locked)">(Locked)</span>
                    )}
                  </label>
                  <input
                    id="editCheckIn"
                    type="date"
                    disabled={isModalLocked}
                    aria-disabled={isModalLocked}
                    required
                    value={editDateFrom}
                    onChange={(e) => setEditDateFrom(e.target.value)}
                    className={`w-full border-b-2 py-2 outline-none text-sm font-bold ${isModalLocked ? "border-[#E5E5E5] text-[#605F5F] cursor-not-allowed" : "border-[#C5A059]/50 focus:border-[#C5A059] text-[#000000] bg-transparent"}`}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="editCheckOut" className="text-xs font-bold text-[#000000] uppercase mb-1">
                    Check-out{" "}
                    {isModalLocked && (
                      <span className="text-red-600" aria-label="(This date is locked)">(Locked)</span>
                    )}
                  </label>
                  <input
                    id="editCheckOut"
                    type="date"
                    disabled={isModalLocked}
                    aria-disabled={isModalLocked}
                    required
                    value={editDateTo}
                    onChange={(e) => setEditDateTo(e.target.value)}
                    className={`w-full border-b-2 py-2 outline-none text-sm font-bold ${isModalLocked ? "border-[#E5E5E5] text-[#605F5F] cursor-not-allowed" : "border-[#C5A059]/50 focus:border-[#C5A059] text-[#000000] bg-transparent"}`}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="editGuests" className="text-xs font-bold text-[#000000] uppercase mb-1">
                  Guests
                </label>
                <input
                  id="editGuests"
                  type="number"
                  min="1"
                  max={selectedBooking.venue?.maxGuests || 99}
                  required
                  value={editGuests}
                  onChange={(e) => setEditGuests(parseInt(e.target.value) || 1)}
                  className="w-full border-b-2 border-[#C5A059]/50 py-2 outline-none focus:border-[#C5A059] text-sm font-bold text-[#000000] bg-transparent"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isModalProcessing}
                  aria-busy={isModalProcessing}
                  className="w-full bg-[#C5A059] text-[#4A1D1A] font-bold py-3 rounded-full text-sm uppercase tracking-wider hover:bg-[#E5C282] transition-colors disabled:opacity-50">
                  {isModalProcessing ? "Saving..." : "Save Date Changes"}
                </button>
                <button
                  type="button"
                  disabled={isModalProcessing}
                  aria-busy={isModalProcessing}
                  onClick={handleCancelBooking}
                  className="w-full border-2 border-red-800 text-red-800 font-bold py-3 rounded-full text-sm uppercase tracking-wider hover:bg-red-50 transition-colors disabled:opacity-50">
                  {isModalProcessing
                    ? "Processing..."
                    : "Cancel Booking Entirely"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}