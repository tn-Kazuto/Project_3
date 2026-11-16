import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { announcementApi, categoryApi, contestApi, feedbackApi, recipeApi, tipApi } from '../services/api';

vi.mock('../services/api', () => ({
  categoryApi: { getAll: vi.fn() },
  recipeApi: { getPaged: vi.fn(), update: vi.fn(), delete: vi.fn(), create: vi.fn() },
  tipApi: { getPaged: vi.fn(), update: vi.fn(), delete: vi.fn(), create: vi.fn() },
  contestApi: { getPaged: vi.fn(), getSummary: vi.fn(), getAll: vi.fn(), getEntries: vi.fn(), create: vi.fn(), delete: vi.fn() },
  announcementApi: { getPaged: vi.fn(), getAll: vi.fn(), create: vi.fn(), delete: vi.fn() },
  feedbackApi: { getPaged: vi.fn(), delete: vi.fn() },
  authApi: { getCurrentUser: vi.fn() },
}));

const pagedResponse = (items = [], totalCount = items.length, page = 1, pageSize = 10) => ({
  data: {
    success: true,
    data: {
      items,
      totalCount,
      pageIndex: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      hasPreviousPage: page > 1,
      hasNextPage: page < Math.ceil(totalCount / pageSize),
    },
  },
});

describe('Admin management pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryApi.getAll.mockResolvedValue({ data: { success: true, data: [] } });
    recipeApi.getPaged.mockImplementation(({ page = 1, pageSize = 10, isFreeOnly }) => {
      if (pageSize === 1) {
        const totalCount = isFreeOnly === true ? 0 : isFreeOnly === false ? 0 : 11;
        return Promise.resolve(pagedResponse([], totalCount, page, pageSize));
      }
      if (page === 1) {
        return Promise.resolve(pagedResponse([{
          recipeId: 901,
          title: 'Member submitted recipe',
          authorName: 'Alex Member',
          categoryName: 'Community',
          contentType: 'ARTICLE',
          isFree: true,
          createdAt: '2026-11-15T10:00:00Z',
        }], 11, page, pageSize));
      }
      return Promise.resolve(pagedResponse([{
        recipeId: 902,
        title: 'Older community recipe',
        authorName: 'Another Member',
        categoryName: 'Community',
        contentType: 'ARTICLE',
        isFree: false,
        createdAt: '2026-11-14T10:00:00Z',
      }], 11, page, pageSize));
    });
    tipApi.getPaged.mockResolvedValue(pagedResponse([], 0, 1, 10));
    contestApi.getPaged.mockResolvedValue(pagedResponse([], 0, 1, 10));
    contestApi.getSummary.mockResolvedValue({ data: { success: true, data: { totalContests: 0, activeContests: 0, totalSubmissions: 0 } } });
    announcementApi.getPaged.mockResolvedValue(pagedResponse([], 0, 1, 10));
    feedbackApi.getPaged.mockResolvedValue(pagedResponse([], 0, 1, 10));
  });

  it('shows member-authored recipes and lets Admin navigate server pages', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Recipes (11)' }));

    expect(await screen.findByText('Member submitted recipe')).toBeInTheDocument();
    expect(screen.getByText('Alex Member')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(await screen.findByText('Older community recipe')).toBeInTheDocument();
    expect(recipeApi.getPaged).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });

  it('refreshes the active list and brings Admin back to page one when a member posts', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Recipes (11)' }));
    expect(await screen.findByText('Member submitted recipe')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(await screen.findByText('Older community recipe')).toBeInTheDocument();

    recipeApi.getPaged.mockImplementation(({ page = 1, pageSize = 10, isFreeOnly }) => {
      if (pageSize === 1) {
        const totalCount = isFreeOnly === true ? 0 : isFreeOnly === false ? 0 : 12;
        return Promise.resolve(pagedResponse([], totalCount, page, pageSize));
      }
      const items = page === 1
        ? [{
          recipeId: 903,
          title: 'Just posted by a member',
          authorName: 'New Member',
          categoryName: 'Community',
          contentType: 'ARTICLE',
          isFree: true,
          createdAt: '2026-11-16T10:00:00Z',
        }]
        : [{ recipeId: 902, title: 'Older community recipe', authorName: 'Another Member', categoryName: 'Community', isFree: false }];
      return Promise.resolve(pagedResponse(items, 12, page, pageSize));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(await screen.findByText('Just posted by a member')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });
});
