import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RecipesPage } from '../pages/public/RecipesPage';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Functional Phase F2 Tests - Recipe Catalog, Print & Gatekeeping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCategories = [
    { categoryId: 1, categoryName: 'Italian' },
    { categoryId: 2, categoryName: 'Juices' },
  ];

  const mockFreeRecipe = {
    recipeId: 101,
    title: 'Heirloom Tomato Tart',
    authorName: 'Chef James Thew',
    categoryName: 'Italian',
    ingredients: 'Puff pastry\nHeirloom tomatoes\nFresh basil\nExtra virgin olive oil',
    cookingProcedure: 'Preheat oven to 200C.\nRoll out pastry.\nArrange tomatoes and bake for 25 minutes.',
    isFree: true,
    createdAt: '2026-10-30T00:00:00Z',
  };

  it('TC_F2_FE_1 - RecipesPage renders Access Tier buttons and allows filtering by Free and Member Reserved', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    const getRecipesSpy = vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({
      data: { success: true, data: [mockFreeRecipe] },
    });

    render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('All Repertoire')).toBeInTheDocument();
    });

    expect(screen.getByText('Free Access Only')).toBeInTheDocument();
    expect(screen.getByText('Member Reserved')).toBeInTheDocument();

    // Click "Free Access Only" button
    const freeTierBtn = screen.getByText('Free Access Only');
    fireEvent.click(freeTierBtn);

    await waitFor(() => {
      expect(getRecipesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isFreeOnly: true })
      );
    });

    // Click "Member Reserved" button
    const memberTierBtn = screen.getByText('Member Reserved');
    fireEvent.click(memberTierBtn);

    await waitFor(() => {
      expect(getRecipesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isFreeOnly: false })
      );
    });
  });

  it('TC_F2_FE_2 - RecipeDetailPage renders Print Culinary Card button and triggers window.print', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true, user: { fullName: 'Chef Member' } });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: mockFreeRecipe } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    const printSpy = vi.fn();
    window.print = printSpy;

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Heirloom Tomato Tart')).toBeInTheDocument();
    });

    const printBtn = screen.getByRole('button', { name: /Print Culinary Card/i });
    expect(printBtn).toBeInTheDocument();

    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('TC_F2_FE_3 - RecipeDetailPage renders printable archival dossier watermark', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true, user: { fullName: 'Chef Member' } });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: mockFreeRecipe } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/101']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/CHEF JAMES THEW · 5-STAR CULINARY ATELIER/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Official Culinary Dossier')).toBeInTheDocument();
    expect(screen.getByText('Archival Kitchen Edition')).toBeInTheDocument();
  });

  it('TC_F2_FE_4 - RecipeDetailPage renders Member Exclusive gatekeeping card on 403 Forbidden', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.recipeApi, 'getById').mockRejectedValue({
      response: { status: 403, data: { message: 'MEMBERS_ONLY' } },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/999']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Member Exclusive Content')).toBeInTheDocument();
    });

    expect(screen.getByText('RESERVED ARCHIVE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Subscribe & Unlock/i })).toBeInTheDocument();
  });

  it('TC_F2_FE_5 - RecipeDetailPage renders 50% preview steps, blurred teaser, and Atelier VIP CTA Card for guest preview', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    const mockPreviewRecipe = {
      recipeId: 202,
      title: 'Pan-Seared Duck Breast with Cherry Port Jus',
      authorName: 'Chef James Thew',
      categoryName: 'French',
      isFree: false,
      accessLevel: 'PREVIEW',
      ingredients: 'Duck breast\nPort wine\nBing cherries\nButter',
      cookingProcedure: 'Score duck skin in diamond pattern.\nSear skin side down over medium-low heat.\nFlip and baste with aromatic butter.\nRest meat for 10 minutes before carving.',
      createdAt: '2026-11-01T00:00:00Z',
    };
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: mockPreviewRecipe } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/202']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pan-Seared Duck Breast with Cherry Port Jus')).toBeInTheDocument();
    });

    // 50% preview badge & explanation
    expect(screen.getByText(/50% Exclusive Recipe Preview/i)).toBeInTheDocument();

    // First 50% steps are rendered (2 out of 4 steps)
    expect(screen.getByText('Score duck skin in diamond pattern.')).toBeInTheDocument();
    expect(screen.getByText('Sear skin side down over medium-low heat.')).toBeInTheDocument();

    // CTA Banner
    expect(screen.getByText(/50% COMPLIMENTARY PREVIEW REACHED/i)).toBeInTheDocument();
    expect(screen.getByText(/Khám Phá Trọn Vẹn Công Thức & Video Masterclass/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đăng Ký Thành Viên VIP/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đã Có Tài Khoản\? Đăng Nhập/i })).toBeInTheDocument();
  });

  it('TC_F2_FE_6 - RecipeDetailPage renders locked Masterclass broadcast frame for VIP video recipes in guest preview', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    const mockVipVideoRecipe = {
      recipeId: 203,
      title: 'Artisanal Hand-Rolled Sourdough Masterclass',
      authorName: 'Chef James Thew',
      categoryName: 'Bakery',
      isFree: false,
      accessLevel: 'PREVIEW',
      contentType: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      ingredients: 'Flour\nWater\nSalt\nSourdough starter',
      cookingProcedure: 'Autolyse flour and water.\nIncorporate active starter and salt.',
      createdAt: '2026-11-01T00:00:00Z',
    };
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: mockVipVideoRecipe } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/203']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Artisanal Hand-Rolled Sourdough Masterclass')).toBeInTheDocument();
    });

    // Locked video stream broadcast poster
    expect(screen.getByText(/LOCKED STREAM/i)).toBeInTheDocument();
    expect(screen.getByText(/Video Masterclass Độc Quyền Hội Viên VIP/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mở Khóa Video/i })).toBeInTheDocument();
  });
});

