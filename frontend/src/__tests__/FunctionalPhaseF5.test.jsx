import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import {
  recipeApi,
  tipApi,
  categoryApi,
  contestApi,
  announcementApi,
  feedbackApi,
  authApi,
} from '../services/api';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  categoryApi: {
    getAll: vi.fn(),
  },
  recipeApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  tipApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  contestApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    getEntries: vi.fn(),
    selectWinner: vi.fn(),
  },
  announcementApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  feedbackApi: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
  authApi: {
    getMe: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { userId: 1, username: 'james', role: 'ADMIN', fullName: 'Chef James Thew' },
      },
    }),
  },
}));

describe('Functional Phase F5 - Executive Admin Hub & Comprehensive Final Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Executive Atelier Architecture & System Metrics in Overview tab', async () => {
    categoryApi.getAll.mockResolvedValue({
      data: { success: true, data: [{ categoryId: 1, categoryName: 'Classic French' }] },
    });

    recipeApi.getAll.mockResolvedValue({
      data: {
        success: true,
        data: [
          { recipeId: 1, title: 'Duck Confit', isFree: true, categoryName: 'Classic French', authorName: 'James' },
          { recipeId: 2, title: 'Black Truffle Risotto', isFree: false, categoryName: 'Classic French', authorName: 'James' },
        ],
      },
    });

    tipApi.getAll.mockResolvedValue({
      data: {
        success: true,
        data: [
          { tipId: 10, title: 'Sharpening Damascus Knives', isFree: false, authorName: 'James' },
        ],
      },
    });

    contestApi.getAll.mockResolvedValue({
      data: {
        success: true,
        data: [
          { contestId: 100, title: 'Risotto Challenge', isActive: true, entryCount: 5 },
        ],
      },
    });

    announcementApi.getAll.mockResolvedValue({
      data: {
        success: true,
        data: [
          { announcementId: 1, title: 'Winner Declared', publishedAt: '2026-10-30T10:00:00Z' },
        ],
      },
    });

    feedbackApi.getAll.mockResolvedValue({
      data: {
        success: true,
        data: [
          { feedbackId: 1, comment: 'Great platform', recipeId: null },
          { feedbackId: 2, comment: 'Delicious dish', recipeId: 1 },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify Executive Title and Badge
    expect(await screen.findByText('Chef James Thew Executive Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/100% Operational Integrity/i)).toBeInTheDocument();

    // Verify Architecture Metrics
    expect(screen.getByText('3 Master Items')).toBeInTheDocument(); // 2 recipes + 1 tip
    expect(screen.getByText('2 VIP Reserved')).toBeInTheDocument(); // 1 paid recipe + 1 paid tip
    expect(screen.getByText('5 Submissions')).toBeInTheDocument(); // 5 contest entries
    expect(screen.getByText('2 Reviews')).toBeInTheDocument(); // 2 feedbacks
  });

  it('triggers Quick Action modals properly for Recipe, Tip, Contest, and Announcement', async () => {
    categoryApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    recipeApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    tipApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    contestApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    announcementApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    feedbackApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Chef James Thew Executive Dashboard')).toBeInTheDocument();

    // Test New Recipe modal
    const newRecipeBtn = screen.getByRole('button', { name: /New Recipe/i });
    fireEvent.click(newRecipeBtn);
    expect(await screen.findByText('Add New Master Recipe')).toBeInTheDocument();
    const cancelRecipeModal = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelRecipeModal);

    // Test New Cooking Tip modal
    const newTipBtn = screen.getByRole('button', { name: /New Cooking Tip/i });
    fireEvent.click(newTipBtn);
    expect(await screen.findByText('Add New Culinary Tip')).toBeInTheDocument();
    const cancelTipModal = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelTipModal);

    // Test Launch Contest modal
    const launchContestBtn = screen.getByRole('button', { name: /Launch Contest/i });
    fireEvent.click(launchContestBtn);
    expect(await screen.findByText('Launch New Culinary Contest')).toBeInTheDocument();
    const cancelContestModal = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelContestModal);

    // Test Publish Announcement modal
    const publishAnnBtn = screen.getByRole('button', { name: /Publish Announcement/i });
    fireEvent.click(publishAnnBtn);
    expect(await screen.findByText('Publish Official Announcement')).toBeInTheDocument();
  });

  it('switches seamlessly across all executive administration tabs', async () => {
    categoryApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    recipeApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    tipApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    contestApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    announcementApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    feedbackApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Chef James Thew Executive Dashboard')).toBeInTheDocument();

    // Switch to Recipes Tab
    fireEvent.click(screen.getByRole('button', { name: /Recipes \(/i }));
    expect(await screen.findByText('Recipes Catalog Management')).toBeInTheDocument();

    // Switch to Tips Tab
    fireEvent.click(screen.getByRole('button', { name: /Cooking Tips \(/i }));
    expect(await screen.findByText('Cooking Tips Management')).toBeInTheDocument();

    // Switch to Contests Tab
    fireEvent.click(screen.getByRole('button', { name: /Contests \(/i }));
    expect(await screen.findByText('Culinary Contests Management')).toBeInTheDocument();

    // Switch to Announcements Tab
    fireEvent.click(screen.getByRole('button', { name: /Announcements \(/i }));
    expect(await screen.findByText('Announcements Management')).toBeInTheDocument();

    // Switch to Feedback Tab
    fireEvent.click(screen.getByRole('button', { name: /Feedbacks \(/i }));
    expect(await screen.findByText('User Reviews & Feedback')).toBeInTheDocument();
  });
});
