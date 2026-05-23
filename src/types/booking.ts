import { type Venue } from "./Venue";

// This file defines the TypeScript interfaces for user-related data structures, including booking information and user profiles. 
export interface CheckoutState {
  venue: Venue;
  bookingData: {
    dateFrom: string;
    dateTo: string;
    guests: number;
  };
}
// The ConfirmationState interface extends the CheckoutState to include an optional contactEmail field. This allows for additional information to be captured during the booking confirmation process, such as the customer's email address for contact purposes. This interface can be used in components that handle the final steps of booking confirmation, ensuring that all necessary data is structured and available for processing.
export interface ConfirmationState {
  venue: Venue;
  bookingData: {
    dateFrom: string;
    dateTo: string;
    guests: number;
  };
  // Email for contact purposes during booking confirmation.
  contactEmail?: string;
}
