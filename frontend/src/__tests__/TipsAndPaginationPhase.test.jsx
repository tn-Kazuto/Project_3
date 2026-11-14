import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecipesPage } from '../pages/public/RecipesPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Tips & Pagination Enhanced Frontend Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockTips = [
    {
      tipId: 501,
      authorId: 1,
      authorName: 'Chef James Thew',
      title: 'Knife Edge Honing Mastery',
      content: 'Always hold your honing steel at a precise 20-degree angle. Smooth strokes from heel to tip.',
      videoUrl: 'https://youtube.com/watch?v=mock-knife-honing',
      isFree: true,
      createdAt: '2026-11-01T00:00:00Z',
    },
    {
      tipId: 502,
      authorId: 2,
      authorName: 'Sous Chef Marco',
      title: 'Clarified Butter & Ghee Perfection',
      content: 'Simmer unsalted butter gently over low heat until milk solids turn golden brown.',
      isFree: true,
      createdAt: '2026-11-02T00:00:00Z',
    },
  ];

  it('TC_TIPS_1 - Cooking Tips tab renders tips and opening a tip card displays the technique modal', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { userId: 1, role: 'MEMBER' },
    });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.tipApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockTips } });

    render(
      <MemoryRouter>
        <RecipesPage initialTab="tips" />
      </MemoryRouter>
    );

    // Tip title should be rendered
    expect(await screen.findByText('Knife Edge Honing Mastery')).toBeInTheDocument();
    expect(screen.getByText('Clarified Butter & Ghee Perfection')).toBeInTheDocument();

    // Click on the tip to open the detail modal
    fireEvent.click(screen.getByText('Knife Edge Honing Mastery'));

    // Modal should show masterclass demonstration
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/Always hold your honing steel at a precise 20-degree angle/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Masterclass Video Demonstration/i)).toBeInTheDocument();

    // Close the modal
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('TC_PAGINATION_1 - Renders architectural pagination controls when items exceed pageSize', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { userId: 1, role: 'MEMBER' },
    });

    const mockManyRecipes = Array.from({ length: 25 }, (_, i) => ({
      recipeId: 200 + i,
      authorId: 1,
      authorName: 'Chef James',
      categoryId: 1,
      title: `Artisanal Dish ${i + 1}`,
      ingredients: 'Ingredients',
      cookingProcedure: 'Procedure',
      isFree: true,
      createdAt: '2026-11-01T00:00:00Z',
    }));

    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({
      data: {
        success: true,
        data: {
          items: mockManyRecipes.slice(0, 12),
          totalCount: 25,
          pageIndex: 1,
          pageSize: 12,
        },
      },
    });

    render(
      <MemoryRouter>
        <RecipesPage initialTab="recipes" />
      </MemoryRouter>
    );

    // Wait for recipes to load
    expect(await screen.findByText('Artisanal Dish 1')).toBeInTheDocument();

    // Pagination controls should appear
    expect(screen.getByRole('navigation', { name: /catalog pagination/i })).toBeInTheDocument();
    expect(screen.getByText(/PAGE 1 OF 3 \(25 ITEMS\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });
});
