import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/public/HomePage';
import * as apiModule from '../services/api';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Luxury Phase L3 Tests - Home Page Transformation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TCL3.1 - HomePage renders architectural Roman numerals for section sequencing', () => {
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    renderWithRouter(<HomePage />);

    expect(screen.getByText(/I · PROLOGUE/i)).toBeInTheDocument();
    expect(screen.getByText(/II · MASTERCLASSES/i)).toBeInTheDocument();
    expect(screen.getByText(/III · REPERTOIRE/i)).toBeInTheDocument();
    expect(screen.getByText(/IV · COMPETITIVE ARENA/i)).toBeInTheDocument();
  });

  it('TCL3.2 - HomePage renders Weekend Culinary Academy with ruled rows pattern and curriculum details', () => {
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    const { container } = renderWithRouter(<HomePage />);

    expect(screen.getByRole('heading', { level: 2, name: /weekend culinary academy/i })).toBeInTheDocument();
    expect(screen.getByText(/Every Saturday & Sunday/i)).toBeInTheDocument();
    expect(screen.getByText(/Four Fundamental Culinary Pillars/i)).toBeInTheDocument();
    expect(screen.getByText(/Intimate Atelier Setting/i)).toBeInTheDocument();

    const ruledRows = container.querySelectorAll('.ruled-row');
    expect(ruledRows.length).toBeGreaterThanOrEqual(3);
  });

  it('TCL3.3 - HomePage applies tonal sequence transitions including Pale Taupe and Charcoal fields', () => {
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    const { container } = renderWithRouter(<HomePage />);

    const taupeField = container.querySelector('.field-taupe');
    expect(taupeField).toBeInTheDocument();

    const charcoalField = container.querySelector('.field-charcoal');
    expect(charcoalField).toBeInTheDocument();
  });

  it('TCL3.4 - HomePage renders large EB Garamond hero title and CTA buttons', () => {
    vi.spyOn(apiModule.recipeApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({ data: { success: true, data: [] } });

    renderWithRouter(<HomePage />);

    const mainHeading = screen.getByRole('heading', { level: 1, name: /chef james thew/i });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveClass('brand-font');

    const exploreLink = screen.getByRole('link', { name: /explore recipes/i });
    expect(exploreLink).toBeInTheDocument();
    expect(exploreLink).toHaveClass('btn-primary');

    const memberClubLink = screen.getByRole('link', { name: /join member club/i });
    expect(memberClubLink).toBeInTheDocument();
  });
});
