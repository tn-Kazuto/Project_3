import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
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
