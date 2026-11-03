import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ContestsPage } from '../pages/public/ContestsPage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Upgrade Phase U4 Tests - Community Contest Voting System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockContests = [
    {
      contestId: 501,
      title: 'Grand Truffle Showdown',
      description: 'Master the art of black and white truffles.',
      contestType: 'RECIPE',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
      creatorName: 'Chef James Thew',
      entryCount: 2,
    },
  ];

  const mockEntries = [
    {
      entryId: 9001,
      contestId: 501,
      title: 'Aged Parmigiano Truffle Risotto',
      ingredients: 'Carnaroli rice, Norcia black truffle, 36-month Parmigiano-Reggiano',
      cookingProcedure: 'Slowly hydrate rice with simmering capon broth; finish with cold butter emulsion.',
      tipContent: null,
      participantName: 'Chef Laurent',
      voteCount: 14,
      hasUserVoted: false,
    },
    {
      entryId: 9002,
      contestId: 501,
      title: 'Truffle-Infused Handcrafted Tagliolini',
      ingredients: 'Duck egg yolks, 00 flour, freshly shaved white truffle',
      cookingProcedure: 'Roll pasta sheet to 1mm thickness, cut thin ribbons, toss in truffle butter.',
      tipContent: null,
      guestName: 'Guest Sophie',
      voteCount: 9,
      hasUserVoted: false,
    },
  ];

  it('TC_U4_FE_1 - ContestsPage renders "View Entries & Vote" button and loads voting arena modal', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockContests },
    });

    vi.spyOn(apiModule.contestApi, 'getCommunityEntries').mockResolvedValue({
      data: { success: true, data: mockEntries },
    });

    render(
      <MemoryRouter initialEntries={['/contests']}>
        <Routes>
          <Route path="/contests" element={<ContestsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify contest title is rendered
    expect(await screen.findByText('Grand Truffle Showdown')).toBeInTheDocument();

    // Verify "View Entries & Vote" button is rendered
    const viewEntriesBtn = screen.getByText(/View Entries & Vote/i);
    expect(viewEntriesBtn).toBeInTheDocument();

    // Click to open modal
    fireEvent.click(viewEntriesBtn);

    // Verify modal header and loaded entries
    expect(await screen.findByText(/COMMUNITY ARENA/i)).toBeInTheDocument();
    expect(screen.getByText('Aged Parmigiano Truffle Risotto')).toBeInTheDocument();
    expect(screen.getByText('Truffle-Infused Handcrafted Tagliolini')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText(/Community Favorite/i)).toBeInTheDocument();
  });

  it('TC_U4_FE_2 - Authenticated member votes directly without guest modal and increments vote tally', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 77, fullName: 'Julian Culinarian', email: 'julian@example.com' },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockContests },
    });

    vi.spyOn(apiModule.contestApi, 'getCommunityEntries').mockResolvedValue({
      data: { success: true, data: mockEntries },
    });

    const voteSpy = vi.spyOn(apiModule.contestApi, 'voteEntry').mockResolvedValue({
      data: {
        success: true,
        message: 'Vote registered successfully.',
        data: { entryId: 9001, newVoteCount: 15 },
      },
    });

    render(
      <MemoryRouter initialEntries={['/contests']}>
        <Routes>
          <Route path="/contests" element={<ContestsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const viewEntriesBtn = await screen.findByText(/View Entries & Vote/i);
    fireEvent.click(viewEntriesBtn);

    const voteButtons = await screen.findAllByRole('button', { name: /Vote for Entry/i });
    expect(voteButtons.length).toBeGreaterThan(0);

    // Vote for first entry
    fireEvent.click(voteButtons[0]);

    await waitFor(() => {
      expect(voteSpy).toHaveBeenCalledWith(9001, {});
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText(/✓ You Voted/i)).toBeInTheDocument();
    });
  });

  it('TC_U4_FE_3 - Guest user is prompted for email before casting a verified community vote', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockContests },
    });

    vi.spyOn(apiModule.contestApi, 'getCommunityEntries').mockResolvedValue({
      data: { success: true, data: mockEntries },
    });

    const voteSpy = vi.spyOn(apiModule.contestApi, 'voteEntry').mockResolvedValue({
      data: {
        success: true,
        message: 'Vote registered successfully.',
        data: { entryId: 9002, newVoteCount: 10 },
      },
    });

    render(
      <MemoryRouter initialEntries={['/contests']}>
        <Routes>
          <Route path="/contests" element={<ContestsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const viewEntriesBtn = await screen.findByText(/View Entries & Vote/i);
    fireEvent.click(viewEntriesBtn);

    const voteButtons = await screen.findAllByRole('button', { name: /Vote for Entry/i });
    // Click second entry vote
    fireEvent.click(voteButtons[1]);

    // Modal prompt appears
    expect(await screen.findByText(/Confirm Guest Vote/i)).toBeInTheDocument();

    // Fill in guest email
    const emailInput = screen.getByPlaceholderText('e.g. guest@example.com');
    fireEvent.change(emailInput, { target: { value: 'epicurean_guest@gastronomy.org' } });

    // Submit guest vote
    const castBtn = screen.getByRole('button', { name: /Cast My Vote/i });
    fireEvent.click(castBtn);

    await waitFor(() => {
      expect(voteSpy).toHaveBeenCalledWith(9002, { guestEmail: 'epicurean_guest@gastronomy.org' });
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/Your guest vote has been verified and recorded/i)).toBeInTheDocument();
    });
  });
});

