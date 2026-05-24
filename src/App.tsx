import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Register from "./pages/RegisterPage";
import Login from "./pages/LoginPage";
import Home from "./pages/HomePage";
import DetailedVenuePage from "./pages/DetailedVenuePage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import ProfilePage from "./pages/ProfilePage";
import BecomeVenueManager from "./pages/BecomeVenueManager";
import VenueManagerDashboard from "./pages/VenueManagerDashboard";
import CreateVenuePage from "./pages/CreateVenuePage";
import EditVenuePage from "./pages/EditVenuePage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import TermsAndConditionsPage from "./pages/UserTerms";
import HostTermsPage from "./pages/HostsTerms";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import ReviewBookingPage from "./pages/ReviewBookingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/venues/:id" element={<DetailedVenuePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/become-a-venue-manager" element={<BecomeVenueManager />}/>
          <Route path="/dashboard" element={<VenueManagerDashboard />}/>
          <Route path="/create-venue" element={<CreateVenuePage />}/>
          <Route path="/edit-venue/:id" element={<EditVenuePage />}/>
          <Route path="/contact" element={<ContactPage />}/>
          <Route path="/about" element={<AboutPage />}/>
          <Route path="/user-terms" element={<TermsAndConditionsPage />}/>
          <Route path="/host-terms" element={<HostTermsPage />}/>
          <Route path="/privacy" element={<PrivacyPolicyPage />}/>
          <Route path="/review-booking/:id" element={<ReviewBookingPage />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
