import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Layout } from '../components/common/Layout';
import * as AuthContextModule from '../context/AuthContext';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Luxury Phase L2 Tests - Architectural Shell (Navbar, Footer, Layout)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TCL2.1 - Navbar applies luxury architectural styling, brand logo, and tracked uppercase links', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      logout: vi.fn(),
    });

    const { container } = renderWithRouter(<Navbar />);

    const navElement = container.querySelector('nav');
    expect(navElement).toHaveClass('luxury-navbar');

    const brandTitle = container.querySelector('.navbar-brand-title');
    expect(brandTitle).toBeInTheDocument();
    expect(brandTitle).toHaveTextContent('James Thew');

    const homeLink = screen.getByRole('link', { name: /^home$/i });
    expect(homeLink).toHaveClass('nav-link');
  });

  it('TCL2.2 - Footer applies luxury charcoal field styling and editorial typography', () => {
    const { container } = renderWithRouter(<Footer />);

    const footerElement = container.querySelector('footer');
    expect(footerElement).toHaveClass('luxury-footer');

    const chefTitle = container.querySelector('h4.brand-font');
    expect(chefTitle).toBeInTheDocument();
    expect(chefTitle).toHaveTextContent(/Chef James Thew/i);

    expect(screen.getByText(/Architectural Luxury Design System/i)).toBeInTheDocument();
  });

  it('TCL2.3 - Layout wraps page with luxury architectural shell and renders Navbar, main, and Footer', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      logout: vi.fn(),
    });

    const { container } = renderWithRouter(<Layout />);

    const shell = container.querySelector('.luxury-shell');
    expect(shell).toBeInTheDocument();

    const main = container.querySelector('main.luxury-main');
    expect(main).toBeInTheDocument();

    expect(container.querySelector('nav.luxury-navbar')).toBeInTheDocument();
    expect(container.querySelector('footer.luxury-footer')).toBeInTheDocument();
  });
});

