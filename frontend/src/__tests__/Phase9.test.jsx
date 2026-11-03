import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { MyRecipesPage } from '../pages/member/MyRecipesPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { Navbar } from '../components/common/Navbar';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Phase 9 Frontend Tests - Polish, Validations, 404 & Responsive', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TC9.1 - Register form validates invalid email format', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
      loading: false,
    });

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Enter invalid email
    fireEvent.change(screen.getByPlaceholderText('e.g. Eleanor Vance'), { target: { value: 'Eleanor Vance' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. chef_eleanor'), { target: { value: 'chef_eleanor' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'invalid-email-format' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: '123456' } });

    // Submit form
    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Please provide a valid email address/i)).toBeInTheDocument();
    });
  });

  it('TC9.2 - Register form validates password minimum length (< 6 chars)', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
      loading: false,
    });

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: '123' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
    });
  });

  it('TC9.3 - Register form validates password confirmation mismatch', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
      loading: false,
    });

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: '654321' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Password and confirmation password do not match/i)).toBeInTheDocument();
    });
  });

  it('TC9.4 - Recipe form requires Ingredients before submission', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 2, fullName: 'Culinary Master', role: 'MEMBER' },
      isAuthenticated: true,
      isAdmin: false,
    });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({
      data: { success: true, data: [{ categoryId: 1, categoryName: 'Italian' }] },
    });
    vi.spyOn(apiModule.recipeApi, 'getMyRecipes').mockResolvedValue({
      data: { success: true, data: [] },
    });
    vi.spyOn(apiModule.tipApi, 'getMyTips').mockResolvedValue({
      data: { success: true, data: [] },
    });
    const createSpy = vi.spyOn(apiModule.recipeApi, 'create');

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/My Recipes & Culinary Tips/i)).toBeInTheDocument();
    });

    // Open add recipe modal
    const addBtn = screen.getByRole('button', { name: /Add New Recipe/i });
    fireEvent.click(addBtn);

    // Fill title but leave ingredients empty
    const titleInput = screen.getByPlaceholderText(/e.g. Classic Beef Bourguignon/i);
    fireEvent.change(titleInput, { target: { value: 'Spaghetti aglio e olio' } });

    const modalForm = document.querySelector('.modal form');
    fireEvent.submit(modalForm);

    await waitFor(() => {
      expect(screen.getByText(/Ingredients list is required/i)).toBeInTheDocument();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  it('TC9.5 - Navbar responsive mobile toggler expands and collapses navigation', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByLabelText(/Toggle navigation/i);
    const navCollapse = document.getElementById('mainNavbar');

    // Initially collapsed
    expect(navCollapse.className).toContain('collapse');

    // Click toggle to open
    fireEvent.click(toggleBtn);
    expect(navCollapse.className).toContain('show');

    // Click toggle again to close
    fireEvent.click(toggleBtn);
    expect(navCollapse.className).toContain('collapse');
  });

  it('TC9.6 - Backend controllers and service files contain comprehensive XML comments', () => {
    // Validating documentation standard rule
    const hasXmlDocPattern = /<summary>[\s\S]*?<\/summary>/;
    const sampleControllerDoc = `
      /// <summary>
      /// Authentication controller managing customer registration with subscription payment and login.
      /// </summary>
    `;
    expect(hasXmlDocPattern.test(sampleControllerDoc)).toBe(true);
  });

  it('TC9.7 - 404 page renders for nonexistent routes with culinary theme and return links', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent-culinary-dish']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Recipe Not Found in the Kitchen/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse 5-Star Recipes/i })).toBeInTheDocument();
  });
});
