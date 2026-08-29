import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../navigation/Navbar.jsx";
import Footer from "./Footer.jsx";
import Container from "./Container.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function PublicLayout() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28">
        <Container>
          <ScrollToTop />
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
