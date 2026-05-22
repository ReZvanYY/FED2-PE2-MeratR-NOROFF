// This file defines TypeScript interfaces for user authentication and profile management. This will also be used to type the authentication context in a React application.
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
}
// The AuthContextType interface defines the shape of the authentication context, including user information, access token, and functions for login, logout, and updating user data.
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