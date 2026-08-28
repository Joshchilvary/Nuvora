import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../navigation/Navbar.jsx";
import Footer from "./Footer.jsx";
import Container from "./Container.jsx";

export default function PublicLayout() {
  return (
    <div className="flex min-h-full flex-col bg-obsidian">
      <Navbar />
      <main className="flex-1 pt-28">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
