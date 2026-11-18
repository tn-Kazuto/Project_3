import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Prevent browser from restoring old scroll position on refresh
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return (
    <div className="d-flex flex-column min-vh-100 luxury-shell">
      <a href="#main-content" className="skip-to-content visually-hidden-focusable">
        Skip to Culinary Content
      </a>
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-grow-1 luxury-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
