import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/public/HomePage';
import * as AuthContextModule from '../context/AuthContext';

// Helper to wrap components with Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Phase 5 Frontend Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TC5.1 - Guest sees correct public navigation menu items', () => {
    // Mock AuthContext for unauthenticated Guest
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    // Public links must be present
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^recipes & tips$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^contests$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^announcements$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^feedback$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^faq's$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^log in$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^subscribe & register$/i })).toBeInTheDocument();

    // Authenticated-only links must be absent
    expect(screen.queryByText(/my recipes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  it('TC5.2 - Member sees member navigation menu items and Login/Register is hidden', () => {
    // Mock AuthContext for Member
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        userId: 2,
        username: 'gourmet_sarah',
        fullName: 'Sarah Jenkins',
        role: 'MEMBER',
        subscriptionPlan: 'MONTHLY',
      },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    // Member navigation
    expect(screen.getByRole('link', { name: /^my recipes & tips$/i })).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();

    // Login/Register buttons must be hidden for logged-in members
    expect(screen.queryByRole('link', { name: /^log in$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^subscribe & register$/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
  });

  it('TC5.3 - Admin sees Admin Dashboard and ADMIN badge in navigation', () => {
    // Mock AuthContext for Admin (James Thew)
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        userId: 1,
        username: 'james',
        fullName: 'James Thew',
        role: 'ADMIN',
      },
      isAuthenticated: true,
      isAdmin: true,
      isMember: false,
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByRole('link', { name: /admin dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getAllByText('James Thew').length).toBeGreaterThanOrEqual(1);
  });

  it('TC5.4 - RegisterPage provides plan selection ($10/$100) and mock payment fields', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
    });

    renderWithRouter(<RegisterPage />);

    // Subscription options
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText(/Best Value \(Save \$20\)/i)).toBeInTheDocument();

    // Mock payment fields
    expect(screen.getByPlaceholderText(/name as it appears on card/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/4000 1234 5678 9010/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mm\/yy/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument();

    // Account fields
    expect(screen.getByPlaceholderText(/eleanor vance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  it('TC5.5 - LoginPage renders credentials inputs and sign in button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
    });

    renderWithRouter(<LoginPage />);

    expect(screen.getByPlaceholderText(/e\.g\. james or you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have a membership yet\?/i)).toBeInTheDocument();
  });

  it('TC5.6 - HomePage renders Chef James Thew banner, weekend classes, and highlights', () => {
    renderWithRouter(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: /chef james thew/i })).toBeInTheDocument();
    expect(screen.getByText(/weekend culinary academy/i)).toBeInTheDocument();
    expect(screen.getByText(/saturday & sunday/i)).toBeInTheDocument();
    expect(screen.getByText(/latest free recipes/i)).toBeInTheDocument();
    expect(screen.getByText(/culinary contests/i)).toBeInTheDocument();
    expect(screen.getByText(/contest winner announcements/i)).toBeInTheDocument();
  });
});
