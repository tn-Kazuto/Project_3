import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Luxury Phase L7 Tests - Admin Dashboard & 404 Not Found Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockAdminUser = {
    userId: 1,
    username: 'jamesthew',
    fullName: 'Chef James Thew',
    email: 'james@jamesthew.com',
    role: 'ADMIN',
  };

  const setupAdminMocks = () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
    });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.tipApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.feedbackApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
  };

  it('TCL7.1 - AdminDashboardPage renders Roman numeral and EB Garamond executive title', async () => {
    setupAdminMocks();

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/EXECUTIVE · ADMINISTRATIVE NEXUS/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Chef James Thew Executive Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Master Chef Administration/i)).toBeInTheDocument();
  });

  it('TCL7.2 - AdminDashboardPage renders Pale Taupe and featured Charcoal overview stat cards', async () => {
    setupAdminMocks();

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Recipes')).toBeInTheDocument();
    });

    expect(screen.getByText('Cooking Tips')).toBeInTheDocument();
    expect(screen.getByText('Culinary Contests')).toBeInTheDocument();
    expect(screen.getByText('Feedbacks & Reviews')).toBeInTheDocument();
  });

  it('TCL7.3 - NotFoundPage renders prominent EB Garamond 404 and rectangular actions', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/VACANT REPERTOIRE/i)).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Recipe Not Found in the Kitchen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse 5-Star Recipes/i })).toBeInTheDocument();
  });
});

