import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Upgrade Phase U5 Tests - In-App Notification Bell & Real-time Alerts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSummary = {
    unreadCount: 2,
    recentNotifications: [
      {
        notificationId: 101,
        title: 'Welcome to Chef James Thew VIP Pass!',
        message: 'Your MONTHLY pass ($10.00) is activated. Enjoy unlimited access.',
        targetUrl: '/recipes',
        isRead: false,
        createdAt: '2026-10-25T10:00:00Z',
      },
      {
        notificationId: 102,
        title: 'Contest Winner Declared!',
        message: 'Chef James Thew has crowned Chef Laurent the grand winner!',
        targetUrl: '/announcements',
        isRead: true,
        createdAt: '2026-10-24T08:00:00Z',
      },
    ],
  };

  it('TC_U5_FE_1 - Navbar renders Notification Bell and unread badge count for authenticated user', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 42, username: 'member_chef', fullName: 'Chef Elena', role: 'MEMBER' },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      logout: vi.fn(),
    });

    vi.spyOn(apiModule.notificationApi, 'getSummary').mockResolvedValue({
      data: { success: true, data: mockSummary },
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Bell button should be present
    const bellBtn = await screen.findByRole('button', { name: /Notifications/i });
    expect(bellBtn).toBeInTheDocument();

    // Unread count badge should display 2
    const badge = await screen.findByTestId('unread-badge');
    expect(badge).toHaveTextContent('2');
  });

  it('TC_U5_FE_2 - Clicking Notification Bell opens dropdown listing recent alerts', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 42, username: 'member_chef', fullName: 'Chef Elena', role: 'MEMBER' },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      logout: vi.fn(),
    });

    vi.spyOn(apiModule.notificationApi, 'getSummary').mockResolvedValue({
      data: { success: true, data: mockSummary },
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const bellBtn = await screen.findByRole('button', { name: /Notifications/i });
    fireEvent.click(bellBtn);

    // Verify dropdown items
    expect(await screen.findByText(/Welcome to Chef James Thew VIP Pass!/i)).toBeInTheDocument();
    expect(screen.getByText(/Contest Winner Declared!/i)).toBeInTheDocument();
  });

  it('TC_U5_FE_3 - Clicking "Mark all as read" calls API and resets unread badge', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 42, username: 'member_chef', fullName: 'Chef Elena', role: 'MEMBER' },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      logout: vi.fn(),
    });

    vi.spyOn(apiModule.notificationApi, 'getSummary').mockResolvedValue({
      data: { success: true, data: mockSummary },
    });

    const markAllSpy = vi.spyOn(apiModule.notificationApi, 'markAllAsRead').mockResolvedValue({
      data: { success: true, message: 'All notifications marked as read.' },
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const bellBtn = await screen.findByRole('button', { name: /Notifications/i });
    fireEvent.click(bellBtn);

    const markAllBtn = await screen.findByRole('button', { name: /Mark all as read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(markAllSpy).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
    });
  });
});

