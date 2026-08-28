import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Route>
    </Routes>
  );
}
