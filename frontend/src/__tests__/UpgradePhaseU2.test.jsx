import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RecipesPage } from '../pages/public/RecipesPage';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Upgrade Phase U2 Tests - Multimedia Content Hub & Facebook Share Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCategories = [
    { categoryId: 1, categoryName: 'French Haute Cuisine' },
    { categoryId: 2, categoryName: 'Italian Classics' },
  ];

  const mockRecipes = [
    {
      recipeId: 101,
      title: 'Truffle Risotto Masterclass',
      categoryName: 'Italian Classics',
      ingredients: 'Arborio rice, black truffle, vegetable broth, butter',
      cookingProcedure: 'Toast rice, slowly add broth, finish with black truffle and butter.',
      isFree: true,
      authorName: 'Chef James Thew',
      contentType: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      shareCount: 12,
      createdAt: '2026-10-15T00:00:00Z',
    },
    {
      recipeId: 102,
      title: 'Boeuf Bourguignon Classic',
      categoryName: 'French Haute Cuisine',
      ingredients: 'Beef chuck, red Burgundy wine, mushrooms, carrots',
      cookingProcedure: 'Sear beef, simmer gently in Burgundy wine for 3 hours.',
      isFree: true,
      authorName: 'Chef James Thew',
      contentType: 'ARTICLE',
      videoUrl: null,
      shareCount: 3,
      createdAt: '2026-10-16T00:00:00Z',
    },
  ];

  it('TC_U2_FE_1 - RecipesPage renders media format filters and requests contentType on click', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockCategories },
    });

    const getAllSpy = vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockRecipes },
    });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    // Verify format filter buttons exist
    await waitFor(() => {
      expect(screen.getByText('All Formats')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Video Masterclass')).toBeInTheDocument();
      expect(screen.getByText('Culinary Talkshows')).toBeInTheDocument();
      expect(screen.getByText('Live Shows')).toBeInTheDocument();
    });

    // Click 'Video Masterclass' filter
    fireEvent.click(screen.getByText('Video Masterclass'));

    await waitFor(() => {
      expect(getAllSpy).toHaveBeenCalledWith(
        expect.objectContaining({ contentType: 'VIDEO' })
      );
    });
  });

  it('TC_U2_FE_2 - RecipeDetailPage renders video broadcast iframe when videoUrl exists', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 1, username: 'guest' },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: mockRecipes[0] },
    });

    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({
      data: { success: true, data: [] },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Truffle Risotto Masterclass')).toBeInTheDocument();
    });

    // Check YouTube iframe embed
    const iframe = screen.getByTitle('Truffle Risotto Masterclass');
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(screen.getByText(/CHEF MASTERCLASS BROADCAST/i)).toBeInTheDocument();
  });

  it('TC_U2_FE_3 - RecipeDetailPage renders Facebook Share and Copy Link actions, and increments share count', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: mockRecipes[0] },
    });

    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({
      data: { success: true, data: [] },
    });

    const shareSpy = vi.spyOn(apiModule.recipeApi, 'share').mockResolvedValue({
      data: { success: true, data: 13 },
    });

    // Mock window.open
    const openSpy = vi.fn();
    window.open = openSpy;

    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Share on Facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy Link/i)).toBeInTheDocument();
    });

    // Test Facebook Share button click
    fireEvent.click(screen.getByText(/Share on Facebook/i));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php'),
      '_blank',
      expect.any(String)
    );
    expect(shareSpy).toHaveBeenCalledWith(101);

    // Test Copy Link button click
    fireEvent.click(screen.getByText(/Copy Link/i));
    await waitFor(() => {
      expect(screen.getByText(/Link Copied!/i)).toBeInTheDocument();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});

