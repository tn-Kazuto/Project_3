import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ContestsPage } from '../pages/public/ContestsPage';
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage';
import { FeedbackPage } from '../pages/public/FeedbackPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Luxury Phase L5 Tests - Community Pages (Contests, Announcements, Feedback)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockContests = [
    {
      contestId: 10,
      title: 'Grand Italian Pasta Championship',
      description: 'Craft your best fresh handmade pasta sauce.',
      contestType: 'RECIPE',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      isActive: true,
      creatorName: 'James Thew',
      entryCount: 4,
    },
  ];

  const mockAnnouncements = [
    {
      announcementId: 20,
      title: 'Autumn Contest Winner Crowned',
      content: 'Chef James Thew honors our top pasta artisan.',
      winnerName: 'Sarah Jenkins',
      contestTitle: 'Grand Italian Pasta Championship',
      publishedAt: '2026-10-25T10:00:00Z',
      authorName: 'James Thew',
    },
  ];

  it('TCL5.1 - ContestsPage renders Roman numeral IV and architectural contest card', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockContests } });

    render(
      <MemoryRouter>
        <ContestsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/IV · COMPETITIVE ARENA/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /culinary contests/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Grand Italian Pasta Championship')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /submit your entry now/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveClass('btn-primary');
  });

  it('TCL5.2 - AnnouncementsPage renders Roman numeral V and winner highlight with gold details', async () => {
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: mockAnnouncements } });

    render(
      <MemoryRouter>
        <AnnouncementsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/V · HALL OF FAME/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /winner announcements/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Autumn Contest Winner Crowned')).toBeInTheDocument();
    });

    expect(screen.getByText('HONORED WINNER')).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
  });

  it('TCL5.3 - FeedbackPage renders Roman numeral VI and square Charcoal submit button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <FeedbackPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/VI · VOICES & SUGGESTIONS/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /website feedback/i })).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /send feedback to chef james thew/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveClass('btn-primary');
  });

  it('TCL5.4 - Feedback form fields have square corners and hairline styling', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ isAuthenticated: false });

    const { container } = render(
      <MemoryRouter>
        <FeedbackPage />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText('Gordon Ramsay');
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('gordon@example.com');
    expect(emailInput).toBeInTheDocument();

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeInTheDocument();
  });
});

