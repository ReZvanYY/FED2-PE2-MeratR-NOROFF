// This page allows a logged-in user to become a venue manager by accepting the terms and conditions. It includes guard clauses to ensure only eligible users can access the page, and it handles the API request to update the user's profile status. The UI is designed with a dark theme and provides feedback on the process, including error handling and loading states.
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BecomeVenueManager() {
  const { user, isAuthenticated, accessToken, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard Clause: Only logged-in users can access this page to become venue managers. If a user is not authenticated, they are immediately redirected to the login page. This ensures that only users with an active session can attempt to become venue managers, maintaining the integrity of the user flow and preventing unauthorized access to the manager onboarding process.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Guard Clause: If they are already a manager, send them to the dashboard instead of showing the agreement page. This prevents users who have already completed the process from unnecessarily going through the agreement again, and it provides a seamless experience by directing them to the appropriate section of the app based on their current status.
  if (user.venueManager) {
    return <Navigate to="/dashboard" />;
  }

  const handleBecomeManager = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!agreed) {
      setError("You must accept the terms and conditions to proceed.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      const response = await fetch(`${baseUrl}holidaze/profiles/${user.name}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        // The API requires us to send the venueManager boolean to update the profile status to true. This request updates the user's profile on the server to reflect their new status as a venue manager, which is essential for granting them access to manager-specific features and sections of the app. The response from this request will determine whether the update was successful or if there were any issues that need to be addressed.
        body: JSON.stringify({
          venueManager: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0]?.message || "Failed to update profile status.",
        );
      }

      // If successful, update the global context so the header/footer links change instantly without needing to refresh or re-login. This ensures that the user's new status as a venue manager is immediately reflected in the app's UI and functionality, providing a seamless transition to their new role without any additional steps required on their part.
      if (updateUserData) {
        updateUserData({ venueManager: true });
      }

      // Redirect the user directly to their new dashboard after successfully becoming a manager to provide a smooth onboarding experience, allowing them to immediately access the tools and features available to venue managers without having to navigate manually from the profile page.
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="w-full flex-grow flex items-center justify-center p-4 bg-[#222222] font-kadwa min-h-[calc(100vh-200px)]"
      aria-labelledby="manager-heading"
    >
      <div className="w-full max-w-2xl flex flex-col">
        {/* Module Header Text */}
        <p className="text-[#888888] text-sm mb-2 ml-2" aria-hidden="true">
          venue manager - agreement module
        </p>

        {/* Main Dark Modal */}
        <div 
          className="bg-[#2E1311] border border-[#4A1D1A] shadow-2xl rounded-sm p-10 md:p-16 flex flex-col items-center"
          role="region"
          aria-labelledby="manager-heading"
        >
          <h1 
            id="manager-heading"
            className="text-2xl md:text-3xl font-bold text-[#C5A059] mb-12 text-center"
          >
            Becoming a venue manager
          </h1>

          {error && (
            <div 
              id="manager-error"
              role="alert"
              aria-live="assertive"
              className="mb-8 w-full max-w-md p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-200 text-sm font-bold text-center"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleBecomeManager}
            aria-labelledby="manager-heading"
            className="w-full max-w-lg flex flex-col items-center">
            {/* Custom Checkbox Layout */}
            <label className="flex items-start gap-4 mb-16 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (error) setError(null); // Clear error when they check the box
                  }}
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? "manager-error" : undefined}
                  className="peer appearance-none w-6 h-6 md:w-8 md:h-8 bg-[#FAF9F6] rounded-sm cursor-pointer checked:bg-[#FAF9F6] transition-all"
                />
                {/* Checkmark that appears when peer is checked */}
                <svg
                  aria-hidden="true"
                  className="absolute w-4 h-4 md:w-6 md:h-6 text-[#4A1D1A] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span className="text-[#FAF9F6] font-bold text-lg md:text-xl leading-relaxed">
                I have read and accept the terms & conditions{" "}
                <br className="hidden md:block" aria-hidden="true" />
                for becoming a venue manager.
              </span>
            </label>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isProcessing}
              aria-busy={isProcessing}
              className="bg-[#3A1412] text-[#C5A059] border-2 border-[#C5A059] rounded-full px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-bold hover:bg-[#C5A059] hover:text-[#3A1412] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {isProcessing ? "Processing..." : "Become a venue manager"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}