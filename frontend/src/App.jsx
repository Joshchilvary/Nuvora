import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import Discover from "./pages/Discover.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmed from "./pages/OrderConfirmed.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import OurStory from "./pages/OurStory.jsx";
import FAQ from "./pages/FAQ.jsx";
import SupportCenter from "./pages/SupportCenter.jsx";
import Careers from "./pages/Careers.jsx";
import ApiDevelopers from "./pages/ApiDevelopers.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import SellOnNuvora from "./pages/SellOnNuvora.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PasswordRecovery from "./pages/PasswordRecovery.jsx";
import PhoneVerification from "./pages/PhoneVerification.jsx";
import AuthStates from "./pages/AuthStates.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmed" element={<OrderConfirmed />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<SupportCenter />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/developers" element={<ApiDevelopers />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/sell" element={<SellOnNuvora />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<PasswordRecovery />} />
        <Route path="/verify-phone" element={<PhoneVerification />} />
        <Route path="/auth-states" element={<AuthStates />} />
      </Route>
    </Routes>
  );
}
