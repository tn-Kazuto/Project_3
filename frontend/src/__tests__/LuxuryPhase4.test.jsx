import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RecipesPage } from '../pages/public/RecipesPage';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Luxury Phase L4 Tests - Catalog Refinement (Recipes & Recipe Detail)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCategories = [
    { categoryId: 1, categoryName: 'Italian' },
  ];

  const mockRecipe = {
    recipeId: 201,
    authorId: 1,
    authorName: 'Chef James Thew',
    categoryId: 1,
    categoryName: 'Italian',
    title: 'Artisanal Saffron Risotto',
    ingredients: 'Carnaroli rice\nSaffron threads\nShallots\nDry white wine\nParmigiano Reggiano',
    cookingProcedure: 'Toast rice in copper pan.\nDeglaze with dry white wine.\nInfuse saffron broth gradually.',
    isFree: true,
    createdAt: '2026-10-30T00:00:00Z',
  };

  it('TCL4.1 - RecipesPage renders architectural catalog header with Roman numeral and tab switcher', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [mockRecipe] } });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/III · ARCHITECTURAL CATALOG/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /culinary library/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recipes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cooking tips/i })).toBeInTheDocument();
  });

  it('TCL4.2 - RecipesPage cards render with hairline styling and EB Garamond titles', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [mockRecipe] } });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Artisanal Saffron Risotto')).toBeInTheDocument();
    });

    const cardTitle = screen.getByText('Artisanal Saffron Risotto');
    expect(cardTitle).toHaveClass('brand-font');
    expect(screen.getByText('Free Access')).toBeInTheDocument();
  });

  it('TCL4.3 - RecipeDetailPage renders ingredients and cooking procedure with Roman numerals', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true, user: { fullName: 'James' } });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: mockRecipe } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/201']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Artisanal Saffron Risotto')).toBeInTheDocument();
    });

    expect(screen.getByText('COMPONENT LIST')).toBeInTheDocument();
    expect(screen.getByText('METHODOLOGY')).toBeInTheDocument();
    expect(screen.getByText('I.')).toBeInTheDocument();
    expect(screen.getByText('II.')).toBeInTheDocument();
    expect(screen.getByText('III.')).toBeInTheDocument();
  });

  it('TCL4.4 - RecipeDetailPage member gatekeeping renders Charcoal field with fine gold accent border', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.recipeApi, 'getById').mockRejectedValue({
      response: { status: 403, data: { message: 'Forbidden' } },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/201']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Member Exclusive Content')).toBeInTheDocument();
    });

    expect(screen.getByText('RESERVED ARCHIVE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /subscribe & unlock/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to recipes/i })).toBeInTheDocument();
  });
});

