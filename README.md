# Ember & Stone (Holidaze)

Ember & Stone is a premium accommodation booking platform designed for the discerning traveler. Built as the final Project Exam 2 (PE2) for Noroff, this application provides a seamless, luxury-themed interface for both customers looking to book their next adventure, and venue managers managing their high-end properties.

## Table of Contents

1. [Features](#-features)
2. [Built With](#-built-with)
3. [Getting Started](#-getting-started)
4. [Environment Variables](#-environment-variables)
5. [Testing & Validation](#-testing--validation)
6. [Author](#-author)


## Features

The application is built around the official Noroff Holidaze API and satisfies the following user stories:
### For All Users (Unregistered & Registered)
* **Browse & Search:** View a grid of available venues, search by name, and filter by price, guests, and amenities.
* **Detailed Venue View:** View specific venue details, image galleries, and host information.
* **Registration:** Secure registration for both Customers and Venue Managers (requires a valid `@stud.noroff.no` email address).
* **Availability Calendar:** View a dynamic calendar that visually blocks out dates that are already booked.

### For Registered Customers
* **Booking System:** Select check-in/check-out dates and guest counts to securely reserve a venue.
* **Profile Management:** Update personal bio, banner, and avatar images.
* **Trip Dashboard:** View a list of all upcoming and past booking reservations.

### For Venue Managers
* **Listing Management:** Create, edit, and delete venue listings, including dynamic image URLs, pricing, and nested location data.
* **Dashboard Overview:** View a dedicated dashboard to track personal properties and monitor incoming reservations from customers.

## 🛠 Built With

This project was built with a modern React tech stack, utilizing a strict design system (Custom Gold/Deep Red palette) to ensure a premium user experience.
* **[React](https://reactjs.org/)** - UI Library
* **[TypeScript](https://www.typescriptlang.org/)** - Type Safety
* **[Vite](https://vitejs.dev/)** - Build Tool & Bundler
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling & layout
* **[React Router v6](https://reactrouter.com/)** - Client-side routing
* **[React Datepicker](https://reactdatepicker.com/)** - Interactive calendar UI
* **[Noroff API](https://docs.noroff.dev/docs/v2/holidaze/profiles)** - Backend & Database

---

## Getting Started
To get a local copy up and running, follow these simple steps.

### Prerequisites
You will need Node.js and npm installed on your machine.
* npm
  ```
  npm install npm@latest -g
Installation

Clone the repository
```
git clone https://github.com/ReZvanYY/FED2-PE2-MeratR-NOROFF.git

Install NPM packages
```
npm install

Set up Environment Variables
To run this project locally, you must create a .env file in the root directory and add the following variables.
```
VITE_API_BASE_URL=" https://v2.api.noroff.dev/
VITE_API_KEY=c50f36d3-35fb-42fa-88de-2674d066c1c2"
```
I am providing this information only due to grading reasons. Would not share this otherwise.

Start the development server
```
npm run dev
Open your browser and visit http://localhost:5173

### Testing & Validation
This project has been manually tested against the PE2 user stories and validated using industry-standard tools to ensure high performance and accessibility:
- Lighthouse: Tested for Performance, Accessibility, Best Practices, and SEO.
- WAVE (Web Accessibility Evaluation Tool): Tested to ensure proper contrast ratios, ARIA labeling, and semantic HTML structure.
- W3C HTML Validator: Validated to ensure clean, error-free DOM rendering.

### Author
Merat Rezvany Hesary
GitHub: @ReZvanYY
Noroff Project Exam 2 - Front-End Development