import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import Discover from "./pages/Discover.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
      </Route>
    </Routes>
  );
}
