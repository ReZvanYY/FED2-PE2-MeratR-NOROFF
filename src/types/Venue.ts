import { type Booking } from "./user";

// The VenueMeta interface defines the structure of the metadata object nested within a venue. It includes boolean properties for amenities such as wifi, parking, breakfast, and pet-friendliness. This allows for easy access to information about the venue's features and can be used for filtering or display purposes in the UI.
export interface VenueMeta {
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
}
// The VenueMedia interface defines the structure of media objects associated with a venue, including a URL for the media asset and alternative text for accessibility. This allows venues to have multiple images or media items that can be displayed in the UI, providing users with visual information about the venue.
export interface VenueMedia {
  url: string;
  alt: string;
}

// The VenueLocation interface defines the structure of the location object nested within a venue. It includes properties for address, city, zip code, country, continent, and geographical coordinates (latitude and longitude). This allows for detailed representation of a venue's physical location, which can be used for display purposes or for features like map integration and location-based filtering.
export interface VenueLocation {
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  continent: string | null;
  lat: number | null;
  lng: number | null;
}

// The Venue interface defines the structure of a venue object as returned by the Noroff API. It includes properties for basic information (name, description), media assets, pricing, capacity, ratings, timestamps, and nested objects for metadata and location. Additionally, it conditionally includes owner information and bookings based on specific query parameters used during fetching. This comprehensive typing allows for robust handling of venue data throughout the application, ensuring that components can safely access and display venue details while also accommodating variations in the API response based on different fetch options.
export interface Venue {
  id: string;
  name: string;
  description: string;
  media: VenueMedia[];
  price: number;
  maxGuests: number;
  rating: number;
  created: string;
  updated: string;
  meta: VenueMeta;
  location: VenueLocation;

  // Only included when fetching with the ?_owner=true flag
  owner?: {
    name: string;
    email: string;
    avatar: VenueMedia;
  };
    bookings?: Booking[];
}

// This interface defines the shape of the filter state used for filtering venues on the Home page. It includes criteria such as price range, guest capacity, rating, amenities, and location. This allows users to refine their search results based on their preferences and requirements when browsing available venues.

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  maxGuests: number;
  minRating: number;
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
  country: string;
  city: string;
}
