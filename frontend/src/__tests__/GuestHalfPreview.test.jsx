import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import { RecipesPage } from '../pages/public/RecipesPage';
import { HomePage } from '../pages/public/HomePage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Members 50% Preview & Free 100% Access Flow (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const freeVideoRecipe = {
    recipeId: 301,
    title: 'Sicilian Saffron Arancini',
    authorName: 'Chef James Thew',
    categoryName: 'Italian',
    isFree: true,
    accessLevel: 'FULL',
    contentType: 'VIDEO',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ingredients: 'Carnaroli rice\nSaffron threads\nFresh mozzarella\nPanko breadcrumbs',
    cookingProcedure: 'Simmer saffron broth and toast Carnaroli rice.\nChill risotto thoroughly on a sheet pan.\nStuff rice spheres with fresh mozzarella cubes.\nBread in panko and fry until golden crisp.',
    createdAt: '2026-11-15T00:00:00Z',
  };

  const membersOnlyFullPayload = {
    recipeId: 302,
    title: 'Porcini Tagliatelle Masterclass',
    authorName: 'Chef James Thew',
    categoryName: 'Italian',
    isFree: false,
    accessLevel: 'PREVIEW',
    contentType: 'VIDEO',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ingredients: '300g Tipo 00 Flour, 3 Farm Eggs, 40g Black Truffle, 150g Porcini Mushrooms',
    cookingProcedure: 'Mound flour on wooden board and knead eggs for 10 minutes until silky. Roll dough paper thin and toss with seared porcini butter glaze.',
    createdAt: '2026-11-15T00:00:00Z',
  };

  const membersServerTruncatedPayload = {
    recipeId: 303,
    title: 'Salt-Baked Heritage Beetroot',
    authorName: 'Chef James Thew',
    categoryName: 'Vegetarian',
    isFree: false,
    accessLevel: 'PREVIEW',
    isContentTruncated: true,
    ingredients: '4 Golden Beetroots\n1kg Rock Salt',
    cookingProcedure: 'Mix coarse rock salt with egg whites.\nEncase unpeeled washed beetroots completely.',
    createdAt: '2026-11-15T00:00:00Z',
  };

  const freeTip = {
    tipId: 701,
    authorName: 'Chef James Thew',
    title: 'Cold-Press Citrus Tip',
    content: 'Use chilled organic produce for brighter juice flavor. Strain through fine chinois before serving.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFree: true,
    createdAt: '2026-11-12T00:00:00Z',
  };

  const membersTip = {
    tipId: 702,
    authorName: 'Chef James Thew',
    title: 'Pasta Water Emulsification Mastery',
    content: 'Never discard starchy pasta cooking water down the drain. Reserve one ladle to whisk vigorously with cold cultured butter off heat until glossy.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFree: false,
    accessLevel: 'PREVIEW',
    createdAt: '2026-11-12T00:00:00Z',
  };

  it('Unregistered guest viewing a Free recipe sees 100% of ingredients, steps, video iframe, and Print button', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: freeVideoRecipe } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/301']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Panko breadcrumbs')).toBeInTheDocument();
    });

    expect(screen.getByText('Bread in panko and fry until golden crisp.')).toBeInTheDocument();
    expect(screen.getByTitle('Sicilian Saffron Arancini')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print Culinary Card/i })).toBeInTheDocument();
    expect(screen.queryByText(/50% COMPLIMENTARY PREVIEW REACHED/i)).not.toBeInTheDocument();
  });

  it('Unregistered guest viewing a Members Only recipe only sees 50% of ingredients and steps, locked video, and registration CTA', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: membersOnlyFullPayload } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/302']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Porcini Tagliatelle Masterclass')).toBeInTheDocument();
    });

    // Comma-separated ingredients split cleanly to first 2 of 4; 4th item must remain hidden
    expect(screen.getByText('300g Tipo 00 Flour')).toBeInTheDocument();
    expect(screen.getByText('3 Farm Eggs')).toBeInTheDocument();
    expect(screen.queryByText('150g Porcini Mushrooms')).not.toBeInTheDocument();

    // Single paragraph procedure split at first sentence (~50%)
    expect(screen.getByText('Mound flour on wooden board and knead eggs for 10 minutes until silky.')).toBeInTheDocument();

    // Hero image must be blurred with lock overlay & Register link
    const heroImg = screen.getByAltText('Porcini Tagliatelle Masterclass');
    expect(heroImg.style.filter).toContain('blur(');
    expect(screen.getByText(/EXCLUSIVE · PREVIEW 50%/i)).toBeInTheDocument();

    // Video & Print are gated behind registration
    expect(screen.getByText(/LOCKED STREAM/i)).toBeInTheDocument();
    expect(screen.queryByTitle('Porcini Tagliatelle Masterclass')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Print Culinary Card/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register to Print Full Card/i })).toBeInTheDocument();

    // English Registration prompts appear and point to /register
    expect(screen.getByText(/Showing 2 of 4 ingredients \(50%\)\. Want to see the rest\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Want to See More\? Register to Unlock/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /Want to Continue\? Register to Unlock \(\$10\/mo\)/i })).toHaveAttribute('href', '/register');
  });

  it('Unregistered guest does not get double-sliced when backend already sent isContentTruncated=true', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({ data: { success: true, data: membersServerTruncatedPayload } });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/303']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Salt-Baked Heritage Beetroot')).toBeInTheDocument();
    });

    // Both server-provided 50% steps & ingredients must be preserved intact (not cut down to 25%)
    expect(screen.getByText('4 Golden Beetroots')).toBeInTheDocument();
    expect(screen.getByText('1kg Rock Salt')).toBeInTheDocument();
    expect(screen.getByText('Mix coarse rock salt with egg whites.')).toBeInTheDocument();
    expect(screen.getByText('Encase unpeeled washed beetroots completely.')).toBeInTheDocument();
    expect(screen.getByText(/50% COMPLIMENTARY PREVIEW REACHED/i)).toBeInTheDocument();
  });

  it('Authenticated member sees 100% of Members Only recipe content, unlocked video, and Print button', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { userId: 5, fullName: 'Registered Member', role: 'MEMBER' },
    });
    vi.spyOn(apiModule.recipeApi, 'getById').mockResolvedValue({
      data: { success: true, data: { ...membersOnlyFullPayload, accessLevel: 'FULL' } },
    });
    vi.spyOn(apiModule.feedbackApi, 'getByRecipe').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter initialEntries={['/recipes/302']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Porcini Tagliatelle Masterclass')).toBeInTheDocument();
    });

    expect(screen.getByText('150g Porcini Mushrooms')).toBeInTheDocument();
    expect(screen.getByTitle('Porcini Tagliatelle Masterclass')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print Culinary Card/i })).toBeInTheDocument();
    expect(screen.queryByText(/50% COMPLIMENTARY PREVIEW REACHED/i)).not.toBeInTheDocument();
  });

  it('Guest on RecipesPage passes includePreviews=true, sees Members Only previews, and sees 50% modal for Members Tip vs 100% for Free Tip', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    const recipeGetAllSpy = vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({
      data: { success: true, data: [freeVideoRecipe, membersOnlyFullPayload] },
    });
    const tipGetAllSpy = vi.spyOn(apiModule.tipApi, 'getAll').mockResolvedValue({
      data: { success: true, data: [freeTip, membersTip] },
    });

    render(
      <MemoryRouter initialEntries={['/recipes']}>
        <RecipesPage initialTab="recipes" />
      </MemoryRouter>
    );

    expect(await screen.findByText('Porcini Tagliatelle Masterclass')).toBeInTheDocument();
    expect(recipeGetAllSpy).toHaveBeenCalledWith(expect.objectContaining({ includePreviews: true }));
    expect(screen.getAllByText(/Preview 50%/i).length).toBeGreaterThanOrEqual(1);

    // Members card image must be blurred while Free recipe image remains unblurred
    expect(screen.getByAltText('Porcini Tagliatelle Masterclass').style.filter).toContain('blur(');
    expect(screen.getByAltText('Sicilian Saffron Arancini').style.filter).toBe('');

    // Switch to Cooking Tips tab
    fireEvent.click(screen.getByRole('button', { name: /Cooking Tips/i }));
    await waitFor(() => {
      expect(tipGetAllSpy).toHaveBeenCalledWith(expect.objectContaining({ includePreviews: true }));
    });

    // Click Free Tip -> sees 100% content + unlocked video link
    const freeTipHeading = await screen.findByText('Cold-Press Citrus Tip');
    fireEvent.click(freeTipHeading);
    const freeDialog = await screen.findByRole('dialog');
    expect(within(freeDialog).getByText(freeTip.content)).toBeInTheDocument();
    expect(within(freeDialog).getByRole('link', { name: /Open Video Demonstration/i })).toBeInTheDocument();
    fireEvent.click(within(freeDialog).getAllByRole('button', { name: /Close/i })[0]);

    // Click Members Only Tip -> sees 50% preview + locked video + Registration CTA
    const membersTipHeading = await screen.findByText('Pasta Water Emulsification Mastery');
    fireEvent.click(membersTipHeading);
    const membersDialog = await screen.findByRole('dialog');
    expect(within(membersDialog).getByText('50% PREVIEW')).toBeInTheDocument();
    expect(within(membersDialog).getByText('Never discard starchy pasta cooking water down the drain.')).toBeInTheDocument();
    expect(within(membersDialog).getByText(/Want to See the Full Technique\? Register to Unlock/i)).toBeInTheDocument();
    expect(within(membersDialog).queryByRole('link', { name: /Open Video Demonstration/i })).not.toBeInTheDocument();
    expect(within(membersDialog).getByRole('link', { name: /Want to Continue\? Register to Unlock \(\$10\/mo\)/i })).toHaveAttribute('href', '/register');
  });

  it('HomePage displays Exclusive Member Recipes with blurred image and without 50% preview text', async () => {
    vi.spyOn(AuthContextModule, 'useOptionalAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockImplementation(({ isFreeOnly } = {}) => {
      if (isFreeOnly === false) {
        return Promise.resolve({ data: { success: true, data: [membersOnlyFullPayload] } });
      }
      return Promise.resolve({ data: { success: true, data: [freeVideoRecipe] } });
    });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Sicilian Saffron Arancini')).toBeInTheDocument();
    expect(await screen.findByText('Exclusive Member Recipes')).toBeInTheDocument();
    expect(screen.queryByText(/50% preview/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/50% SNEAK PEEK/i)).not.toBeInTheDocument();
    expect(screen.getByText('Porcini Tagliatelle Masterclass')).toBeInTheDocument();
    expect(screen.getByAltText('Porcini Tagliatelle Masterclass').style.filter).toContain('blur(');
    const links = screen.getAllByRole('link', { name: /View Recipe/i });
    expect(links.some((link) => link.getAttribute('href') === '/recipes/302')).toBe(true);
  });

  it('RegisterPage displays contextual gate message when redirected from preview CTA', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ register: vi.fn() });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/register',
            state: { message: 'Register for a membership to unlock the complete recipe.' },
          },
        ]}
      >
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Register for a membership to unlock the complete recipe.')).toBeInTheDocument();
  });
});
