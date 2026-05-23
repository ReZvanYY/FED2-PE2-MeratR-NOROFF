import { type Venue } from "./Venue";

// This file defines the TypeScript interfaces for user-related data structures, including booking information and user profiles.
export interface BookingCustomer {
  name: string;
  email: string;
  avatar?: {
    url: string;
    alt: string;
  };
}
// The UserProfile interface represents the basic information about a user, including their name, email, and avatar. The avatar is optional and includes a URL and alt text for accessibility. This interface can be used throughout the application to ensure consistent handling of user data.
export interface Booking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  venue?: {
    id: string;
    name: string;
    media: { url: string; alt: string }[];
    maxGuests: number;
  };
  customer?: BookingCustomer;
}
// The FullProfileData interface extends the basic user profile to include additional details such as a bio, banner image, and flags for whether the user is a venue manager. It also includes optional arrays for bookings and venues, allowing for a comprehensive view of the user's interactions with the platform. This interface is particularly useful for displaying detailed user profiles and managing user-related data in the application.
export interface FullProfileData {
  name: string;
  email: string;
  bio: string;
  avatar: {
    url: string;
    alt: string;
  };
  banner: {
    url: string;
    alt: string;
  };
  venueManager: boolean;
  bookings?: Booking[];
  venues?: Venue[];
}

// The BecomeAHostProps interface defines the properties for a component that allows users to become hosts on the platform. It includes an optional onSuccess callback function that can be executed after a user successfully becomes a host. This interface helps ensure that the component receives the necessary props and can handle the success scenario appropriately.
export interface BecomeAHostProps {
  onSuccess?: () => void;
}
