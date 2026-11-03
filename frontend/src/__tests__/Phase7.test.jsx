import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ContestsPage } from '../pages/public/ContestsPage';
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage';
import { FeedbackPage } from '../pages/public/FeedbackPage';
import { FaqPage } from '../pages/public/FaqPage';
import { ProfilePage } from '../pages/member/ProfilePage';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';

describe('Phase 7 Frontend Tests - Contests, Announcements, Feedback, FAQ, Profile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockContests = [
    {
      contestId: 1,
      title: 'Grand Italian Pasta Championship',
      description: 'Craft your best fresh handmade pasta sauce and pasta dough.',
      contestType: 'RECIPE',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      isActive: true,
      creatorName: 'James Thew',
      entryCount: 5,
    },
    {
      contestId: 2,
      title: 'Kitchen Knife Speed & Safety Tips',
      description: 'Share your masterclass tips on cutting techniques.',
      contestType: 'TIP',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      isActive: true,
      creatorName: 'James Thew',
      entryCount: 2,
    },
  ];

  const mockAnnouncements = [
    {
      announcementId: 1,
      title: 'Grand Autumn Stew Contest Winner Announced!',
      content: 'Chef James Thew is thrilled to declare Sarah Connor as our Autumn Cooking Master!',
      winnerName: 'Sarah Connor',
      contestTitle: 'Grand Autumn Stew Contest',
      publishedAt: '2026-10-25T10:00:00Z',
      authorName: 'James Thew',
    },
    {
      announcementId: 2,
      title: 'Upcoming Weekend Cooking Classes in Singapore',
      content: 'Join Chef James Thew in person for an exclusive culinary experience.',
      winnerName: null,
      contestTitle: null,
      publishedAt: '2026-10-20T10:00:00Z',
      authorName: 'James Thew',
    },
  ];

  const mock7Faqs = [
    { faqId: 1, question: 'What is James Thew Cooking Website?', answer: 'It is a premier culinary hub by Chef James Thew.', displayOrder: 1 },
    { faqId: 2, question: 'What are the subscription plans available?', answer: 'We offer Monthly ($10/month) and Annual ($100/year) plans.', displayOrder: 2 },
    { faqId: 3, question: 'Can guests participate in cooking contests?', answer: 'Yes! Anyone can submit entries to culinary contests for free without registering.', displayOrder: 3 },
    { faqId: 4, question: 'How can I access premium recipes and tips?', answer: 'Register as a member with an active subscription plan.', displayOrder: 4 },
    { faqId: 5, question: 'Can registered members post recipes and tips?', answer: 'Yes, members can publish and manage their own culinary contributions.', displayOrder: 5 },
    { faqId: 6, question: 'How are contest winners selected and announced?', answer: 'Chef James Thew reviews all entries and publishes official winner announcements.', displayOrder: 6 },
    { faqId: 7, question: 'How do I provide feedback on recipes or the platform?', answer: 'Use the feedback form under any recipe or our general feedback page.', displayOrder: 7 },
  ];

  const mockUserProfile = {
    userId: 2,
    username: 'culinaryfan',
    fullName: 'Jane Miller',
    email: 'jane@example.com',
    phone: '+1 555-4321',
    role: 'MEMBER',
    subscriptionPlan: 'ANNUAL',
    subscriptionAmount: 100,
    subscriptionStart: '2026-10-01T00:00:00Z',
    subscriptionEnd: '2027-10-01T00:00:00Z',
    isSubscriptionActive: true,
  };

  it('TC7.1 - Guest can submit contest entry with name and email', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockContests },
    });
    const submitSpy = vi.spyOn(apiModule.contestApi, 'submitEntry').mockResolvedValue({
      data: { success: true, message: 'Submitted successfully' },
    });

    render(
      <MemoryRouter>
        <ContestsPage />
      </MemoryRouter>
    );

    // Wait for contest card
    await waitFor(() => {
      expect(screen.getByText('Grand Italian Pasta Championship')).toBeInTheDocument();
    });

    // Open submit entry modal for contest 1
    const submitBtns = screen.getAllByRole('button', { name: /Submit Your Entry Now/i });
    fireEvent.click(submitBtns[0]);

    // Fill guest fields
    const guestNameInput = screen.getByPlaceholderText('e.g. John Doe');
    const guestEmailInput = screen.getByPlaceholderText('john@example.com');
    const titleInput = screen.getByPlaceholderText(/e.g. Authentic Sicilian Truffle Risotto/i);
    const ingredientsInput = screen.getByPlaceholderText(/- 200g Arborio rice/i);
    const procedureInput = screen.getByPlaceholderText(/Step 1: Sauté minced shallots/i);

    fireEvent.change(guestNameInput, { target: { value: 'Guest Chef Bob' } });
    fireEvent.change(guestEmailInput, { target: { value: 'bob@guest.com' } });
    fireEvent.change(titleInput, { target: { value: 'Truffle Tagliatelle Entry' } });
    fireEvent.change(ingredientsInput, { target: { value: 'Flour, Eggs, Truffle' } });
    fireEvent.change(procedureInput, { target: { value: 'Roll dough thin and cut ribbons.' } });

    // Submit entry form
    const submitModalBtn = screen.getByRole('button', { name: /Submit Entry/i });
    fireEvent.click(submitModalBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(1, {
        title: 'Truffle Tagliatelle Entry',
        ingredients: 'Flour, Eggs, Truffle',
        cookingProcedure: 'Roll dough thin and cut ribbons.',
        tipContent: null,
        guestName: 'Guest Chef Bob',
        guestEmail: 'bob@guest.com',
      });
      expect(screen.getByText(/Submission Received!/i)).toBeInTheDocument();
    });
  });

  it('TC7.2 - Member submits contest entry with auto-filled user info', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { userId: 2, fullName: 'Jane Miller', email: 'jane@example.com', role: 'MEMBER' },
      isAuthenticated: true,
    });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockContests },
    });
    const submitSpy = vi.spyOn(apiModule.contestApi, 'submitEntry').mockResolvedValue({
      data: { success: true, message: 'Submitted successfully' },
    });

    render(
      <MemoryRouter>
        <ContestsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Grand Italian Pasta Championship')).toBeInTheDocument();
    });

    const submitBtns = screen.getAllByRole('button', { name: /Submit Your Entry Now/i });
    fireEvent.click(submitBtns[0]);

    // Member info notice should be visible
    expect(screen.getByText(/Submitting as registered member:/i)).toBeInTheDocument();
    expect(screen.getByText('Jane Miller')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/e.g. Authentic Sicilian Truffle Risotto/i);
    const ingredientsInput = screen.getByPlaceholderText(/- 200g Arborio rice/i);
    const procedureInput = screen.getByPlaceholderText(/Step 1: Sauté minced shallots/i);

    fireEvent.change(titleInput, { target: { value: 'Member Gnocchi Special' } });
    fireEvent.change(ingredientsInput, { target: { value: 'Potatoes, Flour, Nutmeg' } });
    fireEvent.change(procedureInput, { target: { value: 'Boil potatoes and shape into ridges.' } });

    const submitModalBtn = screen.getByRole('button', { name: /Submit Entry/i });
    fireEvent.click(submitModalBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(1, {
        title: 'Member Gnocchi Special',
        ingredients: 'Potatoes, Flour, Nutmeg',
        cookingProcedure: 'Boil potatoes and shape into ridges.',
        tipContent: null,
        guestName: null,
        guestEmail: null,
      });
      expect(screen.getByText(/Submission Received!/i)).toBeInTheDocument();
    });
  });

  it('TC7.3 - Tip contest renders TipContent textarea instead of Ingredients', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    vi.spyOn(apiModule.contestApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockContests },
    });

    render(
      <MemoryRouter>
        <ContestsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Kitchen Knife Speed & Safety Tips')).toBeInTheDocument();
    });

    // Open submit entry for contest 2 (Tip contest)
    const submitBtns = screen.getAllByRole('button', { name: /Submit Your Entry Now/i });
    fireEvent.click(submitBtns[1]);

    // Should render Tip Content textarea, but NOT Ingredients list
    expect(screen.getByPlaceholderText(/Describe your unique kitchen tip/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/- 200g Arborio rice/i)).not.toBeInTheDocument();
  });

  it('TC7.4 - Announcements page renders list of winner announcements and news', async () => {
    vi.spyOn(apiModule.announcementApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mockAnnouncements },
    });

    render(
      <MemoryRouter>
        <AnnouncementsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Grand Autumn Stew Contest Winner Announced!')).toBeInTheDocument();
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Weekend Cooking Classes in Singapore')).toBeInTheDocument();
    });
  });

  it('TC7.5 - FAQ page renders all 7 SRS mandatory questions in accordion', async () => {
    vi.spyOn(apiModule.faqApi, 'getAll').mockResolvedValue({
      data: { success: true, data: mock7Faqs },
    });

    render(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('What is James Thew Cooking Website?')).toBeInTheDocument();
      expect(screen.getByText('What are the subscription plans available?')).toBeInTheDocument();
      expect(screen.getByText('Can guests participate in cooking contests?')).toBeInTheDocument();
      expect(screen.getByText('How can I access premium recipes and tips?')).toBeInTheDocument();
      expect(screen.getByText('Can registered members post recipes and tips?')).toBeInTheDocument();
      expect(screen.getByText('How are contest winners selected and announced?')).toBeInTheDocument();
      expect(screen.getByText('How do I provide feedback on recipes or the platform?')).toBeInTheDocument();
    });
  });

  it('TC7.6 - Feedback page allows submitting general feedback with success message', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    const feedbackSpy = vi.spyOn(apiModule.feedbackApi, 'create').mockResolvedValue({
      data: { success: true, message: 'Feedback sent' },
    });

    render(
      <MemoryRouter>
        <FeedbackPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Gordon Ramsay'), {
      target: { value: 'Alice Visitor' },
    });
    fireEvent.change(screen.getByPlaceholderText('gordon@example.com'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tell us what you love/i), {
      target: { value: 'Wonderful culinary website and fantastic dessert ideas!' },
    });

    const sendBtn = screen.getByRole('button', { name: /Send Feedback to Chef James Thew/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(feedbackSpy).toHaveBeenCalledWith({
        recipeId: null,
        senderName: 'Alice Visitor',
        senderEmail: 'alice@example.com',
        comment: 'Wonderful culinary website and fantastic dessert ideas!',
      });
      expect(screen.getByText(/Thank you for your valuable feedback!/i)).toBeInTheDocument();
    });
  });

  it('TC7.7 - Profile page renders subscription plan, expiry date, and handles profile edit', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUserProfile,
      updateUser: vi.fn(),
    });
    vi.spyOn(apiModule.authApi, 'getProfile').mockResolvedValue({
      data: { success: true, data: mockUserProfile },
    });
    const updateSpy = vi.spyOn(apiModule.authApi, 'updateProfile').mockResolvedValue({
      data: {
        success: true,
        data: { ...mockUserProfile, fullName: 'Jane Miller Updated', phone: '+1 555-9999' },
      },
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Annual Pass ($100/yr)')).toBeInTheDocument();
      expect(screen.getByText('Active Plan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Jane Miller')).toBeInTheDocument();
    });

    // Update full name and phone
    const nameInput = screen.getByDisplayValue('Jane Miller');
    fireEvent.change(nameInput, { target: { value: 'Jane Miller Updated' } });

    const phoneInput = screen.getByDisplayValue('+1 555-4321');
    fireEvent.change(phoneInput, { target: { value: '+1 555-9999' } });

    const saveBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        fullName: 'Jane Miller Updated',
        phone: '+1 555-9999',
      });
      expect(screen.getByText(/Profile details updated successfully!/i)).toBeInTheDocument();
    });
  });
});

