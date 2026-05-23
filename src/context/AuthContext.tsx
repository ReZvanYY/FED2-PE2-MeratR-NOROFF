// This file defines the AuthContext and its provider component for managing user authentication state in a React application. It includes functions for logging in, logging out, and updating user data, as well as a custom hook for consuming the context safely. The context is designed to persist authentication state across page reloads using localStorage, ensuring a seamless user experience.
import { createContext, useContext, useState, type ReactNode } from "react";
import { type UserProfile, type AuthContextType } from "../types/auth";

// Initialize the context container. It starts as undefined to ensure that components consuming the context are wrapped in the provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component manages global authentication state. It wraps around parts of the app that need access to auth data and functions.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage to persist sessions across page reloads. This allows users to stay logged in even if they refresh the page or close and reopen the browser.
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );

  // The user state holds the authenticated user's profile information, which can be used throughout the app for personalization and access control. The venueManager status indicates whether the authenticated user has special permissions, and is now stored safely INSIDE this user object as the single source of truth.
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("userProfile");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Derived state to quickly check if a user is currently logged in. This is a simple boolean that can be used throughout the app to conditionally render components or redirect users based on their authentication status.
  const isAuthenticated = !!accessToken;

  // Handles successful authentication by updating local state and persisting to localStorage. This function is typically called after a user successfully logs in, and it ensures that the app's UI updates to reflect the new authentication state while also saving the session data for future visits.
  const login = (token: string, profile: UserProfile) => {
    // Ensure we explicitly capture the boolean inside the profile, defaulting to false if missing from the payload
    const userWithManagerStatus = {
      ...profile,
      venueManager: profile.venueManager ?? false,
    };

    // Update React state to trigger UI re-renders
    setAccessToken(token);
    setUser(userWithManagerStatus);

    // Store session data in the browser to persist across page reloads and browser sessions
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userProfile", JSON.stringify(userWithManagerStatus));
  };

  // Clears all authentication data, effectively ending the user's session. This function is typically called when a user logs out, and it ensures that both the app's state and the browser's storage are cleared of any sensitive information, preventing unauthorized access in future sessions.
  const logout = () => {
    // Reset React state to reflect that the user is no longer authenticated and to trigger UI updates accordingly.
    setAccessToken(null);
    setUser(null);

    // Remove session data from the browser
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userProfile");
  };

  // Allows partial updates to the user's profile and permissions, enabling features like avatar changes or role updates.
  const updateUserData = (data: Partial<UserProfile>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      // Process venue manager status updates and avatar updates by merging the new data with the old user data.
      // This allows the app to dynamically adjust the user's permissions, UI, and personalization based on changes to their profile.
      const updatedUser = { ...prevUser, ...data };

      // Ensures that the updated information is reflected in the browser's storage for persistence.
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // The provider component wraps its children with the AuthContext, making the authentication state and functions available to any nested components that consume the context. This allows for a centralized management of authentication logic and state across the entire application.
  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        venueManager: !!user?.venueManager,
        login,
        logout,
        updateUserData,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the AuthContext safely. This hook abstracts away the useContext logic and provides a clear API for components to access authentication data and functions. It also includes a guard clause to ensure that it is only used within the AuthProvider, preventing potential errors.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  // Guard clause to prevent the hook from being used outside of the AuthProvider. This ensures that any component trying to access the authentication context is properly wrapped in the provider, which is essential for maintaining the integrity of the app's state and preventing runtime errors.
  if (context === undefined) {
    throw new Error(
      "useAuth must be called from within an <AuthProvider> tree.",
    );
  }

  return context;
}
