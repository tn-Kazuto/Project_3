import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminRevenueMetrics } from '../pages/admin/components/AdminRevenueMetrics';
import * as apiModule from '../services/api';

describe('AdminRevenueMetrics - Executive Treasury & Subscription Revenue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockRevenueData = {
    totalRevenue: 440.0,
    monthlyRevenue: 40.0,
    yearlyRevenue: 400.0,
    totalTransactions: 8,
    monthlyTransactionsCount: 4,
    yearlyTransactionsCount: 4,
    activeSubscribersCount: 6,
    expiredSubscribersCount: 2,
    totalMembersCount: 9,
    monthlyPlanPrice: 10.0,
    yearlyPlanPrice: 100.0,
    recentTransactions: [
      {
        paymentId: 4002,
        userId: 4002,
        userName: 'sophia',
        fullName: 'Steph Sophia',
        email: 'sophia123@gmail.com',
        planType: 'YEARLY',
        amount: 100.0,
        paymentDate: '2026-11-15T18:30:22.087Z',
        status: 'COMPLETED',
      },
      {
        paymentId: 2002,
        userId: 2002,
        userName: 'ngotrangvinh2308',
        fullName: 'Ngô Tràng Vinh',
        email: 'ngotrangvinh23@gmail.com',
        planType: 'MONTHLY',
        amount: 10.0,
        paymentDate: '2026-11-08T17:50:44.356Z',
        status: 'COMPLETED',
      },
    ],
  };

  it('renders loading skeleton and then renders financial metrics on success', async () => {
    vi.spyOn(apiModule.adminUsersApi, 'getRevenueStats').mockResolvedValue({
      data: {
        success: true,
        data: mockRevenueData,
      },
    });

    render(<AdminRevenueMetrics />);

    // Initially or during load
    expect(screen.getByText(/V. EXECUTIVE TREASURY & SUBSCRIBER REVENUE/i)).toBeInTheDocument();

    // After success state settles
    await waitFor(() => {
      expect(screen.getByText('$440.00')).toBeInTheDocument();
    });

    expect(screen.getByText('$40.00')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // activeSubscribersCount
    expect(screen.getByText(/Steph Sophia/i)).toBeInTheDocument();
    expect(screen.getByText(/Ngô Tràng Vinh/i)).toBeInTheDocument();
    expect(screen.getByText('#PAY-04002')).toBeInTheDocument();
    expect(screen.getByText('#PAY-02002')).toBeInTheDocument();
  });

  it('renders empty state when totalTransactions is 0', async () => {
    vi.spyOn(apiModule.adminUsersApi, 'getRevenueStats').mockResolvedValue({
      data: {
        success: true,
        data: {
          totalRevenue: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0,
          totalTransactions: 0,
          monthlyTransactionsCount: 0,
          yearlyTransactionsCount: 0,
          activeSubscribersCount: 0,
          expiredSubscribersCount: 0,
          totalMembersCount: 0,
          recentTransactions: [],
        },
      },
    });

    render(<AdminRevenueMetrics />);

    await waitFor(() => {
      expect(screen.getByText(/No Membership Purchases Recorded/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Re-check Transactions/i)).toBeInTheDocument();
  });

  it('renders error state and retries on button click', async () => {
    const getStatsSpy = vi.spyOn(apiModule.adminUsersApi, 'getRevenueStats');
    getStatsSpy.mockRejectedValueOnce(new Error('Gateway 502 Timeout'));

    render(<AdminRevenueMetrics />);

    await waitFor(() => {
      expect(screen.getByText(/Treasury Ledger Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Gateway 502 Timeout/i)).toBeInTheDocument();
    });

    // Mock success on second call
    getStatsSpy.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockRevenueData,
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /Retry Connection/i }));

    await waitFor(() => {
      expect(screen.getByText('$440.00')).toBeInTheDocument();
    });
  });

  it('filters recent transactions by plan and search query', async () => {
    vi.spyOn(apiModule.adminUsersApi, 'getRevenueStats').mockResolvedValue({
      data: {
        success: true,
        data: mockRevenueData,
      },
    });

    render(<AdminRevenueMetrics />);

    await waitFor(() => {
      expect(screen.getByText(/Steph Sophia/i)).toBeInTheDocument();
      expect(screen.getByText(/Ngô Tràng Vinh/i)).toBeInTheDocument();
    });

    // Filter by MONTHLY
    const filterSelect = screen.getByLabelText(/Filter transactions by plan/i);
    fireEvent.change(filterSelect, { target: { value: 'MONTHLY' } });

    expect(screen.queryByText(/Steph Sophia/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ngô Tràng Vinh/i)).toBeInTheDocument();

    // Reset filter and test search
    fireEvent.change(filterSelect, { target: { value: 'ALL' } });
    const searchInput = screen.getByLabelText(/Search transactions/i);
    fireEvent.change(searchInput, { target: { value: 'sophia' } });

    expect(screen.getByText(/Steph Sophia/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ngô Tràng Vinh/i)).not.toBeInTheDocument();
  });
});
