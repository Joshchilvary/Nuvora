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
import WelcomeToDiscovery from "./pages/WelcomeToDiscovery.jsx";
import CustomerHub from "./pages/CustomerHub.jsx";
import CustomerOrders from "./pages/CustomerOrders.jsx";
import CustomerOrderDetails from "./pages/CustomerOrderDetails.jsx";
import CustomerWishlist from "./pages/CustomerWishlist.jsx";
import CustomerNotifications from "./pages/CustomerNotifications.jsx";
import CustomerSettings from "./pages/CustomerSettings.jsx";
import CustomerProfile from "./pages/CustomerProfile.jsx";
import CustomerReviews from "./pages/CustomerReviews.jsx";
import CustomerLayout from "./components/layout/CustomerLayout.jsx";
import SellerLaunchpad from "./pages/SellerLaunchpad.jsx";
import SellerIntelligence from "./pages/SellerIntelligence.jsx";
import SellerInventory from "./pages/SellerInventory.jsx";
import SellerAddProduct from "./pages/SellerAddProduct.jsx";
import SellerEditProduct from "./pages/SellerEditProduct.jsx";
import SellerOrders from "./pages/SellerOrders.jsx";
import SellerOrderDetails from "./pages/SellerOrderDetails.jsx";
import SellerAnalytics from "./pages/SellerAnalytics.jsx";
import SellerStore from "./pages/SellerStore.jsx";
import SellerPayouts from "./pages/SellerPayouts.jsx";
import SellerNotifications from "./pages/SellerNotifications.jsx";
import SellerSettings from "./pages/SellerSettings.jsx";
import SellerLayout from "./components/layout/SellerLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminSellers from "./pages/AdminSellers.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminReviews from "./pages/AdminReviews.jsx";
import AdminSecurity from "./pages/AdminSecurity.jsx";
import AdminAuditLogs from "./pages/AdminAuditLogs.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

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
      <Route path="/welcome" element={<WelcomeToDiscovery />} />
      <Route path="/customer" element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<CustomerHub />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="orders/:orderId" element={<CustomerOrderDetails />} />
        <Route path="wishlist" element={<CustomerWishlist />} />
        <Route path="notifications" element={<CustomerNotifications />} />
        <Route path="settings" element={<CustomerSettings />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="reviews" element={<CustomerReviews />} />
      </Route>
      <Route path="/seller/launchpad" element={<SellerLaunchpad />} />
      <Route path="/seller" element={<ProtectedRoute><SellerLayout /></ProtectedRoute>}>
        <Route index element={<SellerIntelligence />} />
        <Route path="inventory" element={<SellerInventory />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="orders/:orderId" element={<SellerOrderDetails />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="store" element={<SellerStore />} />
        <Route path="payouts" element={<SellerPayouts />} />
        <Route path="notifications" element={<SellerNotifications />} />
        <Route path="settings" element={<SellerSettings />} />
        <Route path="inventory/new" element={<SellerAddProduct />} />
        <Route path="inventory/:productId/edit" element={<SellerEditProduct />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sellers" element={<AdminSellers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
