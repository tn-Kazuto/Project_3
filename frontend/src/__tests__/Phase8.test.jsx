import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Phase 8 Frontend Tests - Admin Dashboard', () => {
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
      title: 'Truffle Tagliatelle',
      authorId: 1,
      authorName: 'James Thew',
      categoryId: 3,
      categoryName: 'Italian',
      ingredients: 'Tagliatelle, Butter, Truffle',
      cookingProcedure: 'Cook pasta, toss with truffle butter.',
      isFree: true,
      createdAt: '2026-10-30T00:00:00Z',
    },
  ];

  const mockTips = [
    {
      tipId: 201,
      title: 'Knife Sharpening Mastery',
      authorId: 1,
      authorName: 'James Thew',
      categoryId: 1,
      categoryName: 'Juices',
      content: 'Maintain a 15-degree angle with a whetstone.',
      isFree: false,
      createdAt: '2026-10-30T00:00:00Z',
    },
  ];

  const mockContests = [
    {
      contestId: 1,
      title: 'Mediterranean Seafood Championship',
      description: 'Create the best seafood recipe.',
      contestType: 'RECIPE',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      isActive: true,
      entryCount: 1,
    },
  ];

  const mockContestEntries = [
    {
      entryId: 501,
      contestId: 1,
      contestTitle: 'Mediterranean Seafood Championship',
      contestType: 'RECIPE',
      userId: 2,
      submitterName: 'Marco Polo',
      submitterEmail: 'marco@example.com',
      isGuest: false,
      title: 'Grilled Sea Bass with Salsa Verde',
      ingredients: 'Sea bass, parsley, capers, olive oil',
      cookingProcedure: 'Grill fish skin-side down for 5 mins.',
      isWinner: false,
    },
  ];

  const mockAnnouncements = [
    {
      announcementId: 301,
      title: 'Grand Welcome to James Thew Platform',
      content: 'Welcome all culinary lovers!',
      winnerName: null,
      contestTitle: null,
      publishedAt: '2026-10-25T00:00:00Z',
    },
  ];

  const mockFeedbacks = [
    {
      feedbackId: 401,
      recipeId: 101,
      recipeTitle: 'Truffle Tagliatelle',
      senderName: 'Foodie Fan',
      senderEmail: 'fan@example.com',
      comment: 'Absolutely heavenly recipe!',
      createdAt: '2026-10-29T00:00:00Z',
      isGuest: false,
    },
    {
      feedbackId: 402,
      recipeId: null,
      recipeTitle: null,
      senderName: 'Guest Reviewer',
      senderEmail: 'guest@example.com',
      comment: 'Love the new website design and easy navigation!',
      createdAt: '2026-10-29T00:00:00Z',
      isGuest: true,
    },
  ];

  const mockAdminUser = {
    userId: 1,
    username: 'jamesthew',
    fullName: 'James Thew',
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
    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockCategories } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockRecipes } });
    vi.spyOn(apiModule.tipApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockTips } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockContests } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockAnnouncements } });
    vi.spyOn(apiModule.feedbackApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockFeedbacks } });
  };

  it('TC8.1 - Regular Member visiting /admin is redirected away', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 2, fullName: 'Regular Member', role: 'MEMBER' },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Public Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // ProtectedRoute should redirect to /
    expect(screen.getByText('Public Home Page')).toBeInTheDocument();
    expect(screen.queryByText(/Chef James Thew Executive Dashboard/i)).not.toBeInTheDocument();
  });

  it('TC8.2 - Admin can toggle recipe access tier (Free vs Member-only) and delete recipe', async () => {
    setupAdminMocks();
    const updateSpy = vi.spyOn(apiModule.recipeApi, 'update').mockResolvedValue({ data: { success: true } });
    const deleteSpy = vi.spyOn(apiModule.recipeApi, 'delete').mockResolvedValue({ data: { success: true } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chef James Thew Executive Dashboard/i)).toBeInTheDocument();
    });

    // Switch to Recipes tab
    const recipesTab = screen.getByRole('button', { name: /Recipes \(1\)/i });
    fireEvent.click(recipesTab);

    // Verify recipe is shown
    expect(screen.getByText('Truffle Tagliatelle')).toBeInTheDocument();

    // Click "Set Member-only" button to toggle IsFree
    const toggleBtn = screen.getByRole('button', { name: /Set Member-only/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(101, expect.objectContaining({ isFree: false }));
    });

    // Click delete button
    const deleteBtn = screen.getByTitle('Delete Recipe');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(101);
    });
  });

  it('TC8.3 - Admin can launch a new contest', async () => {
    setupAdminMocks();
    const createContestSpy = vi.spyOn(apiModule.contestApi, 'create').mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chef James Thew Executive Dashboard/i)).toBeInTheDocument();
    });

    // Switch to Contests tab
    fireEvent.click(screen.getByRole('button', { name: /Contests \(1\)/i }));

    // Open Create Contest Modal
    fireEvent.click(screen.getByRole('button', { name: /Create Contest/i }));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/e.g. Master Chef Mediterranean/i), {
      target: { value: 'Global Truffle Challenge' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Explain contest challenge/i), {
      target: { value: 'Create the best seasonal truffle delight.' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Launch Contest/i }));

    await waitFor(() => {
      expect(createContestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Global Truffle Challenge',
          description: 'Create the best seasonal truffle delight.',
        })
      );
    });
  });

  it('TC8.4 - Admin can view contest entries', async () => {
    setupAdminMocks();
    const getEntriesSpy = vi.spyOn(apiModule.contestApi, 'getEntries').mockResolvedValue({
      data: { success: true, data: mockContestEntries },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chef James Thew Executive Dashboard/i)).toBeInTheDocument();
    });

    // Switch to Contests tab
    fireEvent.click(screen.getByRole('button', { name: /Contests \(1\)/i }));

    // Click View Entries button
    const viewEntriesBtn = screen.getByRole('button', { name: /View Entries/i });
    fireEvent.click(viewEntriesBtn);

    await waitFor(() => {
      expect(getEntriesSpy).toHaveBeenCalledWith(1);
      expect(screen.getByText('Submissions for: Mediterranean Seafood Championship')).toBeInTheDocument();
      expect(screen.getByText('Grilled Sea Bass with Salsa Verde')).toBeInTheDocument();
      expect(screen.getByText('Marco Polo')).toBeInTheDocument();
    });
  });

  it('TC8.5 - Admin selects winner and seamlessly publishes announcement', async () => {
    setupAdminMocks();
    vi.spyOn(apiModule.contestApi, 'getEntries').mockResolvedValue({
      data: { success: true, data: mockContestEntries },
    });
    const winnerSpy = vi.spyOn(apiModule.contestApi, 'selectWinner').mockResolvedValue({
      data: { success: true },
    });
    const announcementSpy = vi.spyOn(apiModule.announcementApi, 'create').mockResolvedValue({
      data: { success: true },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chef James Thew Executive Dashboard/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Contests \(1\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /View Entries/i }));

    await waitFor(() => {
      expect(screen.getByText('Grilled Sea Bass with Salsa Verde')).toBeInTheDocument();
    });

    // Click Select Winner button
    const selectWinnerBtn = screen.getByRole('button', { name: /Select Winner/i });
    fireEvent.click(selectWinnerBtn);

    await waitFor(() => {
      expect(winnerSpy).toHaveBeenCalledWith(501);
      // Announcement modal opens pre-filled
      expect(screen.getByText('Publish Official Announcement')).toBeInTheDocument();
    });

    // Publish announcement
    fireEvent.click(screen.getByRole('button', { name: /Publish Announcement/i }));

    await waitFor(() => {
      expect(announcementSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          contestId: 1,
          winnerEntryId: 501,
        })
      );
    });
  });

  it('TC8.6 - Admin views all feedbacks with recipe vs general filters', async () => {
    setupAdminMocks();

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chef James Thew Executive Dashboard/i)).toBeInTheDocument();
    });

    // Click Feedbacks tab
    fireEvent.click(screen.getByRole('button', { name: /Feedbacks \(2\)/i }));

    // Both feedbacks should be listed initially
    expect(screen.getByText('Absolutely heavenly recipe!')).toBeInTheDocument();
    expect(screen.getByText('Love the new website design and easy navigation!')).toBeInTheDocument();

    // Filter by Recipe Reviews
    fireEvent.click(screen.getByRole('button', { name: /Recipe Reviews/i }));
    expect(screen.getByText('Absolutely heavenly recipe!')).toBeInTheDocument();
    expect(screen.queryByText('Love the new website design and easy navigation!')).not.toBeInTheDocument();

    // Filter by General Website
    fireEvent.click(screen.getByRole('button', { name: /Website Feedback/i }));
    expect(screen.getByText('Love the new website design and easy navigation!')).toBeInTheDocument();
    expect(screen.queryByText('Absolutely heavenly recipe!')).not.toBeInTheDocument();
  });

  it('TC8.7 - Admin manages cooking tips (toggle access & delete)', async () => {
    setupAdminMocks();
    const updateSpy = vi.spyOn(apiModule.tipApi, 'update').mockResolvedValue({ data: { success: true } });
    const deleteSpy = vi.spyOn(apiModule.tipApi, 'delete').mockResolvedValue({ data: { success: true } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chef James Thew Executive Dashboard/i)).toBeInTheDocument();
    });

    // Switch to Tips tab
    fireEvent.click(screen.getByRole('button', { name: /Cooking Tips \(1\)/i }));

    expect(screen.getByText('Knife Sharpening Mastery')).toBeInTheDocument();

    // Toggle to Free
    const toggleBtn = screen.getByRole('button', { name: /Set Free/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(201, expect.objectContaining({ isFree: true }));
    });

    // Delete Tip
    const deleteBtn = screen.getByTitle('Delete Tip');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(201);
    });
  });
});

