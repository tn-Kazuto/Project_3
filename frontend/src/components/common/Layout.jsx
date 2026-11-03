import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 luxury-shell">
      <Navbar />
      <main className="flex-grow-1 luxury-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
