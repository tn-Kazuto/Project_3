import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ContestsPage } from '../pages/public/ContestsPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Functional Phase F3 Tests - Contests & Judging System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockContest = {
    contestId: 501,
    title: 'Autumn Risotto Challenge 2026',
    description: 'Create your most innovative autumn risotto dish.',
    contestType: 'RECIPE',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-11-30T00:00:00Z',
    isActive: true,
    creatorName: 'Chef James Thew',
    entryCount: 3,
  };

  const mockEntry = {
    entryId: 801,
    contestId: 501,
    contestTitle: 'Autumn Risotto Challenge 2026',
    contestType: 'RECIPE',
    userId: null,
    submitterName: 'Marco Rossi',
    submitterEmail: 'marco@example.com',
    isGuest: true,
    title: 'Porcini & Truffle Risotto',
    ingredients: 'Carnaroli, Porcini mushrooms, Black truffle butter, Parmigiano',
    cookingProcedure: 'Slow cook with vegetable broth and finish with truffle butter.',
    tipContent: null,
    submittedAt: '2026-10-15T00:00:00Z',
    isWinner: false,
  };

  it('TC_F3_FE_1 - ContestsPage opens entry modal and requires guest name/email for unauthenticated visitors', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false, user: null });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: [mockContest] },
    });

    render(
      <MemoryRouter>
        <ContestsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Autumn Risotto Challenge 2026')).toBeInTheDocument();
    });

    // Click "Submit Your Entry Now"
    const submitBtns = screen.getAllByRole('button', { name: /Submit Your Entry Now/i });
    fireEvent.click(submitBtns[0]);

    // Modal should be open
    await waitFor(() => {
      expect(screen.getByText(/Submit to: Autumn Risotto Challenge 2026/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    });
  });

  it('TC_F3_FE_2 - ContestsPage pre-fills submitter information for authenticated members', async () => {
    const memberUser = { fullName: 'Elena Rostova', email: 'elena@culinary.com' };
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true, user: memberUser });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: [mockContest] },
    });

    render(
      <MemoryRouter>
        <ContestsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Autumn Risotto Challenge 2026')).toBeInTheDocument();
    });

    const submitBtns = screen.getAllByRole('button', { name: /Submit Your Entry Now/i });
    fireEvent.click(submitBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Submit to: Autumn Risotto Challenge 2026/i)).toBeInTheDocument();
      expect(screen.getByText(/Submitting as registered member:/i)).toBeInTheDocument();
      expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    });
  });

  it('TC_F3_FE_3 - AdminDashboardPage displays contest entries and allows selecting a winner', async () => {
    const adminUser = { userId: 1, fullName: 'Chef James Thew', role: 'ADMIN' };
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true, isAdmin: true, user: adminUser });

    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.tipApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [mockContest] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.feedbackApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    vi.spyOn(apiModule.contestApi, 'getEntries').mockResolvedValue({
      data: { success: true, data: [mockEntry] },
    });
    const selectWinnerSpy = vi.spyOn(apiModule.contestApi, 'selectWinner').mockResolvedValue({
      data: { success: true, data: { ...mockEntry, isWinner: true } },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Chef James Thew Executive Dashboard')).toBeInTheDocument();
    });

    // Switch to Contests tab
    const contestsTabBtn = screen.getByRole('button', { name: /Contests/i });
    fireEvent.click(contestsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Autumn Risotto Challenge 2026')).toBeInTheDocument();
    });

    // Click "View Entries (3)"
    const viewEntriesBtn = screen.getByRole('button', { name: /View Entries/i });
    fireEvent.click(viewEntriesBtn);

    await waitFor(() => {
      expect(screen.getByText('Porcini & Truffle Risotto')).toBeInTheDocument();
    });

    expect(screen.getByText('Marco Rossi')).toBeInTheDocument();
    expect(screen.getByText('Guest')).toBeInTheDocument();

    // Click "Select Winner"
    const selectWinnerBtn = screen.getByRole('button', { name: /Select Winner/i });
    fireEvent.click(selectWinnerBtn);

    await waitFor(() => {
      expect(selectWinnerSpy).toHaveBeenCalledWith(801);
    });
  });

  it('TC_F3_FE_4 - Selecting winner opens Announcement modal with pre-populated content', async () => {
    const adminUser = { userId: 1, fullName: 'Chef James Thew', role: 'ADMIN' };
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: true, isAdmin: true, user: adminUser });

    vi.spyOn(apiModule.categoryApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.tipApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [mockContest] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.feedbackApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    vi.spyOn(apiModule.contestApi, 'getEntries').mockResolvedValue({
      data: { success: true, data: [mockEntry] },
    });
    vi.spyOn(apiModule.contestApi, 'selectWinner').mockResolvedValue({
      data: { success: true, data: { ...mockEntry, isWinner: true } },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    // Switch to Contests tab
    fireEvent.click(screen.getByRole('button', { name: /Contests/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Entries/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /View Entries/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Select Winner/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Select Winner/i }));

    // Announcement modal should pop up with pre-filled title
    await waitFor(() => {
      expect(screen.getByText('Publish Announcement')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Winner Declared: Autumn Risotto Challenge 2026!/i)).toBeInTheDocument();
    });
  });
});
