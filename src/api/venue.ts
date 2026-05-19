// API v2 base URL and key from .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function fetchVenues() {
  try {
    // Fetch venues list from the endpoint
    const response = await fetch(`${BASE_URL}/holidaze/venues`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_KEY, 
      },
    });

    // Catch failed requests (e.g., 404, 401)
    if (!response.ok) {
      throw new Error(`Error fetching venues: ${response.statusText}`);
    }

    const result = await response.json();
    
    // API v2 wraps the response in a 'data' object. Returning just the array.
    return result.data; 

  } catch (error) {
    console.error("Failed to load venues:", error);
    return null; 
  }
}