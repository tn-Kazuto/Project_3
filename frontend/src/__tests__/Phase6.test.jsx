import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RecipesPage } from '../pages/public/RecipesPage';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import { MyRecipesPage } from '../pages/member/MyRecipesPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Phase 6 Frontend Tests - Recipes & Tips', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCategories = [
    { categoryId: 1, categoryName: 'Juices' },
    { categoryId: 2, categoryName: 'Vegetarian' },
    { categoryId: 3, categoryName: 'Italian' },
  ];

  const mockRecipes = [
    {
      recipeId: 101,
      authorId: 1,
      authorName: 'Chef James',
      categoryId: 1,
      categoryName: 'Juices',
      title: 'Citrus Mint Refresher',
      ingredients: 'Oranges, Fresh mint, Lemon, Crushed ice',
      cookingProcedure: 'Juice citrus fruits, muddle mint, mix and serve chilled.',
      isFree: true,
      createdAt: '2026-10-30T00:00:00Z',
    },
    {
      recipeId: 102,
      authorId: 1,
      authorName: 'Chef James',
      categoryId: 3,
      categoryName: 'Italian',
      title: 'Secret Truffle Tagliatelle',
      ingredients: 'Tagliatelle, Black truffle, Butter, Parmigiano Reggiano',
      cookingProcedure: 'Cook pasta al dente, emulsify with truffle butter.',
      isFree: false,
      createdAt: '2026-10-30T00:00:00Z',
    },
  ];

  it('TC6.1 - Renders badges for Free Access and Members Only recipes', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockRecipes } });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Citrus Mint Refresher')).toBeInTheDocument();
      expect(screen.getByText('Secret Truffle Tagliatelle')).toBeInTheDocument();
    });

    expect(screen.getByText('Free Access')).toBeInTheDocument();
    expect(screen.getByText(/Members Only/i)).toBeInTheDocument();
  });

  it('TC6.2 - Guest clicking on a Members Only recipe redirects to Register', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockRecipes } });

    render(
      <MemoryRouter initialEntries={['/recipes']}>
        <Routes>
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/register" element={<div>Register Redirect Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Truffle Tagliatelle')).toBeInTheDocument();
    });

    // Click on the paid recipe
    fireEvent.click(screen.getByText('Secret Truffle Tagliatelle'));

    await waitFor(() => {
      expect(screen.getByText('Register Redirect Page')).toBeInTheDocument();
    });
  });

  it('TC6.3 - Member clicking on recipe navigates to recipe detail', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockRecipes } });

    render(
      <MemoryRouter initialEntries={['/recipes']}>
        <Routes>
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<div>Recipe Detail Destination</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Truffle Tagliatelle')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Secret Truffle Tagliatelle'));

    await waitFor(() => {
      expect(screen.getByText('Recipe Detail Destination')).toBeInTheDocument();
    });
  });

  it('TC6.4 - Search bar updates search query and triggers fetch', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    const spy = vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search recipes by dish name/i);
    fireEvent.change(searchInput, { target: { value: 'chicken' } });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ search: 'chicken' }));
    });
  });

  it('TC6.5 - Category filter buttons filter by selected category', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    const spy = vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Italian' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Italian' }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 3 }));
    });
  });

  it('TC6.8 & TC6.9 - Recipe detail renders ingredients, cooking procedure, and embedded feedback form', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Member Reviewer' },
      isAuthenticated: true,
    });

    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: mockRecipes[0] },
    });

    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            feedbackId: 1,
            senderName: 'Alice Foodie',
            comment: 'Super refreshing summer drink!',
            createdAt: '2026-10-30T00:00:00Z',
          },
        ],
      },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify Recipe Info
    await waitFor(() => {
      expect(screen.getByText('Citrus Mint Refresher')).toBeInTheDocument();
    });

    // Verify Ingredients and Procedure headers
    expect(screen.getByRole('heading', { name: /^ingredients$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^cooking procedure$/i })).toBeInTheDocument();

    // Verify Feedback section
    expect(screen.getByText(/Recipe Feedback & Reviews/i)).toBeInTheDocument();
    expect(screen.getByText('Alice Foodie')).toBeInTheDocument();
    expect(screen.getByText('Super refreshing summer drink!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write your review or questions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post feedback/i })).toBeInTheDocument();
  });

  it('TC6.6 & TC6.7 - MyRecipesPage renders user submissions and provides edit & delete buttons', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 2, fullName: 'Author User', role: 'MEMBER' },
      isAdmin: false,
    });

    vi.spyOn(apiModule.recipeApi, 'getMyRecipes').mockResolvedValue({
      data: { success: true, data: [mockRecipes[0]] },
    });
    vi.spyOn(apiModule.tipApi, 'getMyTips').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Citrus Mint Refresher')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add new recipe/i })).toBeInTheDocument();
    expect(screen.getByTitle(/edit recipe/i)).toBeInTheDocument();
    expect(screen.getByTitle(/delete recipe/i)).toBeInTheDocument();
  });

  it('TC6.10 - Admin sees Free/Member-only visibility toggle in creation modal', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 1, fullName: 'James Thew', role: 'ADMIN' },
      isAdmin: true,
    });

    vi.spyOn(apiModule.recipeApi, 'getMyRecipes').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.tipApi, 'getMyTips').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add new recipe/i })).toBeInTheDocument();
    });

    // Open creation modal
    fireEvent.click(screen.getByRole('button', { name: /add new recipe/i }));

    // Visibility toggle must be present for Admin
    expect(screen.getByText(/Free Public Access/i)).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});

