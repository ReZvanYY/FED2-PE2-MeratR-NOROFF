import { useState, useRef, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  // Pull authentication data
  const { isAuthenticated, user, logout } = useAuth();

  // State for the interactive profile dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // The main container forces a minimum height of the screen and uses flexbox
    // to push the footer to the bottom if the content is short.
    <div className="min-h-screen flex flex-col font-kadwa bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-[#4A1D1A] text-[#C49A5A] flex items-center justify-between px-8 py-3 shrink-0">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              src="/Logo.png"
              alt="Ember & Stone Logo"
              className="h-16 object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-8 font-bold text-sm tracking-wider">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>

          {/* Only show Register and Sign In if the user is NOT logged in */}
          {!isAuthenticated && (
            <>
              <Link
                to="/register"
                className="hover:text-white transition-colors">
                Register
              </Link>
              <Link to="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </>
          )}
        </nav>

        {/* Profile & Auth */}
        <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
          {isAuthenticated ? (
            // --- LOGGED IN VIEW ---
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center focus:outline-none">
                {/* Show their avatar if they have one, otherwise fallback to the generic icon */}
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="h-12 w-12 rounded-full border-2 border-[#C49A5A] object-cover hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/ProfilePageGenericIcon.png";
                    }}
                  />
                ) : (
                  <img
                    src="/ProfilePageGenericIcon.png"
                    alt="Profile"
                    className="h-16 w-24 object-contain hover:opacity-80 transition-opacity"
                  />
                )}
              </button>

              {/* The Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#FAF9F6] border-2 border-[#C49A5A] rounded-xl shadow-xl py-2 flex flex-col z-50">
                  <div className="px-4 py-3 border-b border-[#C49A5A]/30 mb-2">
                    <p className="text-sm font-bold text-[#4A1D1A] truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-[#4A1D1A]/70 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-[#4A1D1A] hover:bg-[#C49A5A]/20 transition-colors">
                    Profile
                  </Link>

                  {/* DYNAMIC MANAGER LINK IN DROPDOWN */}
                  {user?.venueManager ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-4 py-2 text-sm font-bold text-[#4A1D1A] hover:bg-[#C49A5A]/20 transition-colors">
                      Venue Manager Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/become-a-venue-manager"
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-4 py-2 text-sm font-bold text-[#4A1D1A] hover:bg-[#C49A5A]/20 transition-colors">
                      Become a Venue Manager
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="px-4 py-3 text-sm font-bold text-red-700 hover:bg-[#C49A5A]/20 transition-colors text-left w-full mt-1 border-t border-[#C49A5A]/30">
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            // --- LOGGED OUT VIEW ---
            <Link to="/login">
              <img
                src="/ProfilePageGenericIcon.png"
                alt="Sign In"
                className="h-16 w-24 object-contain hover:opacity-80 transition-opacity"
              />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#4A1D1A] text-[#C49A5A] flex items-center justify-between px-4 py-4">
        {/* Links */}
        <div className="flex flex-col space-y-1 font-bold text-sm tracking-wide">
          <Link to="/about" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/user-terms" className="hover:text-white transition-colors">
            User Terms & Conditions
          </Link>
          <Link to="/host-terms" className="hover:text-white transition-colors">
            Host Terms & Conditions
          </Link>

          {/* DYNAMIC MANAGER LINK IN FOOTER */}
          {user?.venueManager ? (
            <Link
              to="/dashboard"
              className="hover:border-2 hover:px-2 border-[#C49A5A] hover:text-white transition-colors">
              Venue Manager Dashboard
            </Link>
          ) : (
            <Link
              to="/become-a-venue-manager"
              className="hover:border-2 hover:px-2 border-[#C49A5A] hover:text-white transition-colors">
              Become a Venue Manager
            </Link>
          )}
        </div>

        {/* Social Icons */}
        <div className="flex space-x-2">
          <a href="https://x.com" target="_blank" rel="noreferrer">
            <img
              src="/XIcon.png"
              alt="X social media icon"
              className="h-8 w-8 hover:opacity-80 transition-opacity"
            />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <img
              src="/FaceBookIcon.png"
              alt="Facebook social media icon"
              className="h-8 w-8 hover:opacity-80 transition-opacity"
            />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <img
              src="/InstagramIcon.png"
              alt="Instagram social media icon"
              className="h-8 w-8 hover:opacity-80 transition-opacity"
            />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">
            <img
              src="/TikTokIcon.png"
              alt="TikTok social media icon"
              className="h-8 w-8 hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
