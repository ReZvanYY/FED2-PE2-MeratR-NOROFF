// This file defines the TypeScript interfaces for authentication-related data structures, including user profiles and the authentication context. These interfaces provide a clear contract for how authentication data is structured and managed within the application, ensuring type safety and consistency across components that interact with user authentication and profile information.
export interface UserProfile {
  name: string;
  email: string;
  avatar?: {
    url: string;
    alt: string;
  };
  banner?: {
    url: string;
    alt: string;
  };
  venueManager: boolean;
}
// The AuthContextType interface defines the structure of the authentication context used in the application. It includes properties for the user's profile, access token, authentication status, and functions for logging in, logging out, and updating user data. This interface ensures that any component consuming the authentication context has a clear contract for what data and functions are available.
export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  venueManager: boolean;
  isAuthenticated: boolean;
  login: (token: string, profile: UserProfile, isManager: boolean) => void;
  logout: () => void;
  updateUserData: (data: {
    venueManager?: boolean;
    avatar?: { url: string; alt: string };
  }) => void;
}
