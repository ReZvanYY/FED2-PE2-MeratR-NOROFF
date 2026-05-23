// This component manages user authentication. It handles credential submission, communicates with the Noroff API, and updates the global authentication context upon successful login. It also provides user feedback for loading states and errors, ensuring a smooth login experience.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  // Global Auth State: Extract the login action to update the app's session. This allows the component to update the global authentication context with the user's token, profile, and manager status upon successful login, enabling other parts of the app to react accordingly (e.g., showing user info, adjusting navigation options).
  const { login } = useAuth();

  // Local State: Tracks form inputs and UI feedback (errors, loading). This state management allows the component to handle user input for email and password, display server error messages, and show a loading indicator during the login process, enhancing the overall user experience.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Submit Handler: Orchestrates the login request and profile data retrieval. This function handles the form submission, sends the login request to the Noroff API, retrieves the user's profile to determine their manager status, and updates the global authentication context accordingly. It also manages error handling and loading states to provide feedback to the user throughout the process.
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setIsLoading(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      // Authenticate the user with the Noroff API using the provided email and password. This involves sending a POST request to the login endpoint, and if successful, receiving an access token and basic user information in the response.
      const response = await fetch(`${baseUrl}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.errors?.[0]?.message ||
            "Login failed. Please check your credentials.",
        );
      }

      // Fetch the user's profile to accurately determine venueManager status. The login endpoint alone does not always reflect the most up-to-date role.
      const profileResponse = await fetch(
        `${baseUrl}holidaze/profiles/${result.data.name}`,
        {
          headers: {
            Authorization: `Bearer ${result.data.accessToken}`,
            "X-Noroff-API-Key": import.meta.env.VITE_API_KEY,
          },
        },
      );
      // Handle potential errors from the profile fetch to ensure that we can provide feedback if there are issues retrieving the user's profile information, which is crucial for determining their permissions and updating the authentication context accurately.
      const profileResult = await profileResponse.json();
      const isManager = profileResult.data.venueManager;

      //Update the global AuthContext with the token, profile, and manager status to establish the user's authenticated session across the app. This allows other components to access the user's authentication state and profile information, enabling features like protected routes, personalized content, and role-based access control.
      login(
        result.data.accessToken,
        {
          name: result.data.name,
          email: result.data.email,
          avatar: result.data.avatar,
          venueManager: isManager,
        },
        isManager,
      );

      // Success: Route the user to the homepage after successful login to provide a seamless transition into the app's main interface, allowing them to immediately access features and content available to authenticated users.
      navigate("/");// Redirect to homepage on successful login
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center p-8 font-kadwa">
      {/* Ember & Stone Card Container */}
      <div className="bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl p-10 w-full max-w-md shadow-lg flex flex-col items-center">
        {/* Brand Logo */}
        <img
          src="/Logo.png"
          alt="Ember & Stone Logo"
          className="h-28 object-contain mb-6"
        />

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-bold text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@stud.noroff.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
              required
            />
          </div>

          {/* Submission Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#4A1D1A] text-[#C5A059] border border-[#C5A059] rounded-full px-12 py-2 text-lg font-bold hover:bg-[#3A1412] transition-colors disabled:opacity-70 flex items-center justify-center min-w-40 w-full">
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-[#C5A059]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Redirect to Register */}
        <p className="mt-6 text-center text-sm font-bold text-[#000000]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#4A1D1A] hover:text-[#C5A059] transition-colors underline decoration-2 underline-offset-2">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
