import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage';
import { FeedbackPage } from '../pages/public/FeedbackPage';
import { RecipeDetailPage } from '../pages/public/RecipeDetailPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { announcementApi, feedbackApi, recipeApi, contestApi, tipApi, categoryApi } from '../services/api';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  announcementApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  feedbackApi: {
    getAll: vi.fn(),
    getByRecipe: vi.fn(),
    getByRecipeId: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  recipeApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getCategories: vi.fn(),
  },
  categoryApi: {
    getAll: vi.fn(),
  },
  contestApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getEntries: vi.fn(),
    selectWinner: vi.fn(),
  },
  tipApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  authApi: {
    getMe: vi.fn().mockResolvedValue({ data: { success: true, data: null } }),
  },
}));

describe('Functional Phase F4 - Announcements & Feedback Moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Contest Winner Announcements and Hall of Fame properly', async () => {
    announcementApi.getAll.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            announcementId: 101,
            title: 'Official Winner Declaration: Master Risotto Championship',
            content: 'Congratulations to our grand winner who demonstrated world-class emulsion!',
            winnerName: 'Chef Antoine Laurent',
            contestTitle: 'Autumn Risotto Challenge',
            publishedAt: '2026-10-30T10:00:00Z',
            authorName: 'Chef James Thew',
          },
          {
            announcementId: 102,
            title: 'Special Autumn Truffle Masterclass Schedule',
            content: 'Join Chef James this weekend for live masterclass demonstrations.',
            winnerName: null,
            contestTitle: null,
            publishedAt: '2026-10-29T10:00:00Z',
            authorName: 'Chef James Thew',
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AnnouncementsPage />
      </MemoryRouter>
    );

    // Verify Title and Hall of Fame header
    expect(await screen.findByText(/Winner Announcements & News/i)).toBeInTheDocument();

    // Verify Contest Winner card details
    expect(await screen.findByText('Official Winner Declaration: Master Risotto Championship')).toBeInTheDocument();
    expect(screen.getByText(/HONORED WINNER/i)).toBeInTheDocument();
    expect(screen.getByText('Chef Antoine Laurent')).toBeInTheDocument();
    expect(screen.getByText(/Competition: Autumn Risotto Challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/🏆 Contest Winner Announcement/i)).toBeInTheDocument();

    // Verify standard announcement
    expect(screen.getByText('Special Autumn Truffle Masterclass Schedule')).toBeInTheDocument();
    expect(screen.getByText(/📢 Official News/i)).toBeInTheDocument();
  });

  it('submits general website feedback on FeedbackPage for guests', async () => {
    feedbackApi.create.mockResolvedValueOnce({
      data: {
        success: true,
        data: { feedbackId: 1 },
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <FeedbackPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Website Feedback & Suggestions/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Gordon Ramsay/i);
    const emailInput = screen.getByPlaceholderText(/gordon@example.com/i);
    const commentInput = screen.getByPlaceholderText(/Tell us what you love/i);
    const submitBtn = screen.getByRole('button', { name: /Send Feedback to Chef James Thew/i });

    fireEvent.change(nameInput, { target: { value: 'Guest Gourmet' } });
    fireEvent.change(emailInput, { target: { value: 'gourmet@example.com' } });
    fireEvent.change(commentInput, { target: { value: 'Incredible platform and recipes!' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(feedbackApi.create).toHaveBeenCalledWith({
        recipeId: null,
        senderName: 'Guest Gourmet',
        senderEmail: 'gourmet@example.com',
        comment: 'Incredible platform and recipes!',
      });
    });

    expect(await screen.findByText(/Feedback Received!/i)).toBeInTheDocument();
  });

  it('submits inline recipe feedback on RecipeDetailPage', async () => {
    recipeApi.getById.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          recipeId: 201,
          title: 'Pan-Seared Duck Breast',
          categoryName: 'French Classics',
          authorName: 'Chef James Thew',
          isFree: true,
          ingredients: 'Duck breast, orange zest, thyme',
          cookingProcedure: 'Score duck skin, sear slowly until crispy, glaze with orange sauce.',
          createdAt: '2026-10-30T10:00:00Z',
        },
      },
    });

    feedbackApi.getByRecipe.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            feedbackId: 1,
            senderName: 'Julia Child',
            comment: 'Superb crispy skin technique!',
            createdAt: '2026-10-30T11:00:00Z',
          },
        ],
      },
    });

    feedbackApi.create.mockResolvedValueOnce({
      data: {
        success: true,
        data: { feedbackId: 2 },
      },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/201']}>
        <AuthProvider>
          <Routes>
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Pan-Seared Duck Breast')).toBeInTheDocument();
    expect(await screen.findByText('Superb crispy skin technique!')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Your Name \*/i);
    const emailInput = screen.getByPlaceholderText(/Your Email \*/i);
    const commentInput = screen.getByPlaceholderText(/Write your review or questions\.\.\./i);
    const postBtn = screen.getByRole('button', { name: /Post Feedback/i });

    fireEvent.change(nameInput, { target: { value: 'Guest Tester' } });
    fireEvent.change(emailInput, { target: { value: 'tester@example.com' } });
    fireEvent.change(commentInput, { target: { value: 'Turned out wonderfully!' } });

    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(feedbackApi.create).toHaveBeenCalledWith({
        recipeId: 201,
        senderName: 'Guest Tester',
        senderEmail: 'tester@example.com',
        comment: 'Turned out wonderfully!',
      });
    });

    expect(await screen.findByText(/Thank you! Your feedback has been posted\./i)).toBeInTheDocument();
  });

  it('allows Admin to filter and delete feedback in AdminDashboardPage', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    categoryApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    recipeApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    tipApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    contestApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    announcementApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });

    const mockFeedbacks = [
      {
        feedbackId: 501,
        senderName: 'Alice Reviewer',
        senderEmail: 'alice@example.com',
        recipeId: 10,
        recipeTitle: 'Truffle Tagliatelle',
        comment: 'Delicious recipe!',
        isGuest: false,
        createdAt: '2026-10-30T10:00:00Z',
      },
      {
        feedbackId: 502,
        senderName: 'Bob Visitor',
        senderEmail: 'bob@example.com',
        recipeId: null,
        recipeTitle: null,
        comment: 'Love the website design!',
        isGuest: true,
        createdAt: '2026-10-30T11:00:00Z',
      },
    ];

    feedbackApi.getAll.mockResolvedValue({
      data: {
        success: true,
        data: mockFeedbacks,
      },
    });

    feedbackApi.delete.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Feedback deleted successfully.',
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Navigate to Feedback Tab
    const feedbackTabBtn = await screen.findByRole('button', { name: /Feedbacks \(/i });
    fireEvent.click(feedbackTabBtn);

    // Verify both items rendered
    expect(await screen.findByText('Alice Reviewer')).toBeInTheDocument();
    expect(screen.getByText('Bob Visitor')).toBeInTheDocument();
    expect(screen.getByText('🍲 Recipe: Truffle Tagliatelle')).toBeInTheDocument();
    expect(screen.getByText('🌐 General Website')).toBeInTheDocument();

    // Test filter: Recipe Reviews
    const recipeReviewsFilterBtn = screen.getByRole('button', { name: /Recipe Reviews \(1\)/i });
    fireEvent.click(recipeReviewsFilterBtn);
    expect(screen.getByText('Alice Reviewer')).toBeInTheDocument();
    expect(screen.queryByText('Bob Visitor')).not.toBeInTheDocument();

    // Test filter: Website Feedback
    const websiteFilterBtn = screen.getByRole('button', { name: /Website Feedback \(1\)/i });
    fireEvent.click(websiteFilterBtn);
    expect(screen.queryByText('Alice Reviewer')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Visitor')).toBeInTheDocument();

    // Delete Bob's feedback
    const deleteBtn = screen.getByRole('button', { name: /Delete feedback/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(feedbackApi.delete).toHaveBeenCalledWith(502);
    });
  });
});
