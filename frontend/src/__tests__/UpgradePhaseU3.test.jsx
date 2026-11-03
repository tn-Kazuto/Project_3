import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Upgrade Phase U3 Tests - Media Feedback & Community Creations Gallery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockRecipe = {
    recipeId: 101,
    title: 'Opera Cake Haute Couture',
    categoryName: 'French Haute Cuisine',
    ingredients: 'Almond sponge, coffee syrup, ganache, chocolate glaze',
    cookingProcedure: 'Layer almond sponge with coffee buttercream and chocolate ganache.',
    isFree: true,
    authorName: 'Chef James Thew',
    shareCount: 8,
    createdAt: '2026-10-15T00:00:00Z',
  };

  const mockFeedbacks = [
    {
      feedbackId: 1,
      recipeId: 101,
      senderName: 'Claire Bennet',
      senderEmail: 'claire@example.com',
      comment: 'The chocolate glaze recipe produced a flawless mirror finish!',
      rating: 5,
      mediaUrl: 'https://images.unsplash.com/photo-opera-cake-claire.jpg',
      createdAt: '2026-10-18T10:00:00Z',
      isGuest: false,
    },
    {
      feedbackId: 2,
      recipeId: 101,
      senderName: 'Marcus Vance',
      senderEmail: 'marcus@example.com',
      comment: 'Very balanced coffee aroma throughout the sponge.',
      rating: 4,
      mediaUrl: null,
      createdAt: '2026-10-19T14:30:00Z',
      isGuest: true,
    },
  ];

  it('TC_U3_FE_1 - RecipeDetailPage renders interactive star rating and practiced dish media attachment input', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 42, username: 'patissier_fan' },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: mockRecipe },
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
      expect(screen.getByText(/Culinary Rating \*/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Attach Practiced Dish Photo/i)).toBeInTheDocument();
    });
  });

  it('TC_U3_FE_2 - Submitting feedback transmits Rating and MediaUrl to feedbackApi.create', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 42, username: 'patissier_fan' },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: mockRecipe },
    });

    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({
      data: { success: true, data: [] },
    });

    const createFeedbackSpy = vi.spyOn(apiModule.feedbackApi, 'create').mockResolvedValue({
      data: { success: true, data: mockFeedbacks[0] },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/write your review or questions/i)).toBeInTheDocument();
    });

    // Enter comment
    fireEvent.change(screen.getByPlaceholderText(/write your review or questions/i), {
      target: { value: 'My opera cake turned out stunning!' },
    });

    // Enter MediaUrl
    fireEvent.change(screen.getByPlaceholderText(/Attach Practiced Dish Photo/i), {
      target: { value: 'https://images.unsplash.com/photo-user-cake.jpg' },
    });

    // Select 4-star button
    const fourStarBtn = screen.getByLabelText('4 star');
    fireEvent.click(fourStarBtn);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Post Feedback/i }));

    await waitFor(() => {
      expect(createFeedbackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipeId: 101,
          comment: 'My opera cake turned out stunning!',
          rating: 4,
          mediaUrl: 'https://images.unsplash.com/photo-user-cake.jpg',
        })
      );
    });
  });

  it('TC_U3_FE_3 - RecipeDetailPage renders Average Rating Summary and community creations with photo gallery', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: mockRecipe },
    });

    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({
      data: { success: true, data: mockFeedbacks },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify Average rating ( (5 + 4) / 2 = 4.5 )
    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText(/Verified Community Atelier/i)).toBeInTheDocument();
    });

    // Verify feedback comments and practiced dish image
    expect(screen.getByText('Claire Bennet')).toBeInTheDocument();
    expect(screen.getByText(/flawless mirror finish/i)).toBeInTheDocument();
    expect(screen.getByAltText('Creation by Claire Bennet')).toBeInTheDocument();
  });
});

