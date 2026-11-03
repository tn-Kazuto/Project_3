import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from '../pages/member/ProfilePage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Functional Phase F1 Tests - Auth, Subscription & Profile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockMemberProfile = {
    userId: 42,
    username: 'sophie_gourmet',
    fullName: 'Sophie Laurent',
    email: 'sophie@example.com',
    phone: '+1 555 987 6543',
    role: 'MEMBER',
    subscriptionPlan: 'MONTHLY',
    subscriptionAmount: 10.0,
    subscriptionStart: '2026-10-01T00:00:00Z',
    subscriptionEnd: '2026-11-01T00:00:00Z',
    isSubscriptionActive: true,
    createdAt: '2026-10-01T00:00:00Z',
  };

  const setupAuthMocks = (profileData = mockMemberProfile) => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        userId: profileData.userId,
        username: profileData.username,
        role: profileData.role,
      },
      isAuthenticated: true,
      isAdmin: profileData.role === 'ADMIN',
      updateUser: vi.fn(),
      loading: false,
    });

    vi.spyOn(apiModule.authApi, 'getProfile').mockResolvedValue({
      data: { success: true, data: profileData },
    });
  };

  it('TC_F1_FE_1 - ProfilePage renders member details, active status, and Renew/Upgrade button', async () => {
    setupAuthMocks();

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
    });

    expect(screen.getByText('@sophie_gourmet')).toBeInTheDocument();
    expect(screen.getByText('Monthly Pass ($10/mo)')).toBeInTheDocument();
    expect(screen.getByText('Active Plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Renew or Upgrade Pass/i })).toBeInTheDocument();
  });

  it('TC_F1_FE_2 - Clicking Renew or Upgrade Pass opens the Atelier Subscription modal', async () => {
    setupAuthMocks();

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
    });

    const renewBtn = screen.getByRole('button', { name: /Renew or Upgrade Pass/i });
    fireEvent.click(renewBtn);

    expect(screen.getByText(/ATELIER SUBSCRIPTION/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: /Renew or Upgrade Pass/i })).toBeInTheDocument();
    expect(screen.getByText('Monthly Pass')).toBeInTheDocument();
    expect(screen.getByText('Annual Pass')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('4532 1234 5678 9012')).toBeInTheDocument();
  });

  it('TC_F1_FE_3 - Submitting valid renewal form calls authApi.renewSubscription and updates view', async () => {
    setupAuthMocks();

    const renewedData = {
      ...mockMemberProfile,
      subscriptionPlan: 'YEARLY',
      subscriptionAmount: 100.0,
      subscriptionEnd: '2027-11-01T00:00:00Z',
    };

    const renewSpy = vi.spyOn(apiModule.authApi, 'renewSubscription').mockResolvedValue({
      data: { success: true, data: renewedData },
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Renew or Upgrade Pass/i }));

    // Select Annual Pass
    fireEvent.click(screen.getByText('Annual Pass'));

    // Fill mock card details
    fireEvent.change(screen.getByPlaceholderText('4532 1234 5678 9012'), {
      target: { value: '4532 9999 8888 7777' },
    });
    fireEvent.change(screen.getByPlaceholderText('12/28'), {
      target: { value: '11/29' },
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '999' },
    });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Confirm & Pay \$100/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(renewSpy).toHaveBeenCalledWith({
        planType: 'YEARLY',
        cardHolderName: 'Sophie Laurent',
        cardNumber: '4532 9999 8888 7777',
        expiryDate: '11/29',
        cvv: '999',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Subscription pass successfully renewed!/i)).toBeInTheDocument();
    });
  });

  it('TC_F1_FE_4 - Updating profile information successfully calls authApi.updateProfile', async () => {
    setupAuthMocks();

    const updateProfileSpy = vi.spyOn(apiModule.authApi, 'updateProfile').mockResolvedValue({
      data: {
        success: true,
        data: {
          ...mockMemberProfile,
          fullName: 'Sophie Laurent-Dubois',
          phone: '+1 555 111 2222',
        },
      },
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Sophie Laurent')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Sophie Laurent');
    fireEvent.change(nameInput, { target: { value: 'Sophie Laurent-Dubois' } });

    const phoneInput = screen.getByDisplayValue('+1 555 987 6543');
    fireEvent.change(phoneInput, { target: { value: '+1 555 111 2222' } });

    const saveBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledWith({
        fullName: 'Sophie Laurent-Dubois',
        phone: '+1 555 111 2222',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Profile details updated successfully!')).toBeInTheDocument();
    });
  });
});
