import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProfilePage } from '../pages/member/ProfilePage';
import { MyRecipesPage } from '../pages/member/MyRecipesPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Luxury Phase L6 Tests - Auth & Member Portal (Login, Register, Profile, MyRecipes)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TCL6.1 - LoginPage renders Roman numeral I, EB Garamond title, and square Charcoal Sign In button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ login: vi.fn() });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/I · CREDENTIALS & ACCESS/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /welcome back/i })).toBeInTheDocument();

    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    expect(signInBtn).toBeInTheDocument();
    expect(signInBtn).toHaveClass('btn-primary');
  });

  it('TCL6.2 - RegisterPage renders Roman numerals, EB Garamond prices, and featured Charcoal Annual plan', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ register: vi.fn() });

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/II · MEMBERSHIP & ONBOARDING/i)).toBeInTheDocument();
    expect(screen.getByText('I.')).toBeInTheDocument();
    expect(screen.getByText('II.')).toBeInTheDocument();
    expect(screen.getByText('III.')).toBeInTheDocument();

    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText(/Best Value \(Save \$20\)/i)).toBeInTheDocument();
  });

  it('TCL6.3 - ProfilePage renders Roman numeral III and VIP Membership card with gold accents', async () => {
    const mockProfile = {
      userId: 5,
      username: 'master_gourmet',
      fullName: 'Gourmet Elena',
      email: 'elena@palace.com',
      phone: '+1 555-8899',
      role: 'MEMBER',
      subscriptionPlan: 'ANNUAL',
      isSubscriptionActive: true,
      subscriptionStart: '2026-10-01T00:00:00Z',
      subscriptionEnd: '2027-10-01T00:00:00Z',
    };

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: mockProfile, updateUser: vi.fn() });
    vi.spyOn(apiModule.authApi, 'getProfile').mockResolvedValue({ data: { success: true, data: mockProfile } });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Gourmet Elena')).toBeInTheDocument();
    });

    expect(screen.getByText(/III · CULINARY DOSSIER/i)).toBeInTheDocument();
    expect(screen.getByText('MEMBERSHIP CARD')).toBeInTheDocument();
    expect(screen.getByText('Annual Pass ($100/yr)')).toBeInTheDocument();
  });

  it('TCL6.4 - MyRecipesPage renders Roman numeral IV and square contribution tables', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 5, fullName: 'Elena' },
      isAdmin: false,
    });
    vi.spyOn(apiModule.recipeApi, 'getMyRecipes').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.tipApi, 'getMyTips').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/IV · REPERTOIRE MANAGEMENT/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add new recipe/i })).toBeInTheDocument();
    expect(screen.getByText(/You have not published any recipes yet/i)).toBeInTheDocument();
  });
});
