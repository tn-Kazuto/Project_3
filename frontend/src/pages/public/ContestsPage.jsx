import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contestApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CulinarySkeleton } from '../../components/common/CulinarySkeleton';
import { PageBanner } from '../../components/common/PageBanner';
import { ContestCard } from './contests/ContestCard';
import { ContestSubmitModal } from './contests/ContestSubmitModal';
import { ContestVotingModal } from './contests/ContestVotingModal';
import { ContestGuestVoteModal } from './contests/ContestGuestVoteModal';

export const ContestsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal / Form state for submitting an entry
  const [selectedContest, setSelectedContest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    cookingProcedure: '',
    tipContent: '',
    guestName: '',
    guestEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Voting & Community Gallery State (SRS v2.0)
  const [selectedContestForVoting, setSelectedContestForVoting] = useState(null);
  const [votingEntries, setVotingEntries] = useState([]);
  const [loadingVotingEntries, setLoadingVotingEntries] = useState(false);
  const [sortVotesDescending, setSortVotesDescending] = useState(true);
  const [voteMessage, setVoteMessage] = useState({ type: '', text: '' });
  const [showGuestVoteModal, setShowGuestVoteModal] = useState(false);
  const [activeVoteEntry, setActiveVoteEntry] = useState(null);
  const [guestVoteEmail, setGuestVoteEmail] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await contestApi.getAll();
        if (!isMounted) return;
        if (res.data && res.data.success) {
          setContests(res.data.data || []);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load culinary contests. Please try again later.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-open contest modal if id passed via query param (e.g. /contests?id=1)
  useEffect(() => {
    const contestIdParam = searchParams.get('id');
    if (contestIdParam && contests.length > 0) {
      const match = contests.find((c) => c.contestId === parseInt(contestIdParam, 10));
      if (match && match.isActive) {
        handleOpenSubmitModal(match);
      }
    }
  }, [searchParams, contests]);

  const handleOpenSubmitModal = (contest) => {
    setSelectedContest(contest);
    setSubmitSuccess('');
    setSubmitError('');
    setFormData({
      title: '',
      ingredients: '',
      cookingProcedure: '',
      tipContent: '',
      guestName: isAuthenticated ? (user?.fullName || user?.username) : '',
      guestEmail: isAuthenticated ? user?.email : '',
    });
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Form validation
    if (!formData.title.trim()) {
      setSubmitError('Please enter a submission title.');
      return;
    }

    if (!isAuthenticated) {
      if (!formData.guestName.trim() || !formData.guestEmail.trim()) {
        setSubmitError('Please provide your name and email as a guest participant.');
        return;
      }
    }

    if (selectedContest.contestType === 'RECIPE') {
      if (!formData.ingredients.trim() || !formData.cookingProcedure.trim()) {
        setSubmitError('Recipe contests require ingredients and cooking procedure.');
        return;
      }
    } else {
      if (!formData.tipContent.trim()) {
        setSubmitError('Tip contests require tip content.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        ingredients: selectedContest.contestType === 'RECIPE' ? formData.ingredients.trim() : null,
        cookingProcedure: selectedContest.contestType === 'RECIPE' ? formData.cookingProcedure.trim() : null,
        tipContent: selectedContest.contestType === 'TIP' ? formData.tipContent.trim() : null,
        guestName: !isAuthenticated ? formData.guestName.trim() : null,
        guestEmail: !isAuthenticated ? formData.guestEmail.trim() : null,
      };

      const res = await contestApi.submitEntry(selectedContest.contestId, payload);
      if (res.data && res.data.success) {
        setSubmitSuccess(
          'Your contest entry has been submitted to Chef James Thew’s review atelier! Best of luck in the cook-off.'
        );
        // Increment local submission count
        setContests((prev) =>
          prev.map((c) =>
            c.contestId === selectedContest.contestId
              ? { ...c, entryCount: (c.entryCount || 0) + 1 }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'Failed to submit contest entry. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenVotingModal = async (contest) => {
    setSelectedContestForVoting(contest);
    setVoteMessage({ type: '', text: '' });
    loadVotingEntries(contest.contestId, sortVotesDescending);
  };

  const loadVotingEntries = async (contestId, sortDesc) => {
    try {
      setLoadingVotingEntries(true);
      const res = await contestApi.getCommunityEntries(contestId, { orderByVotes: sortDesc });
      if (res.data?.success) {
        setVotingEntries(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setVoteMessage({ type: 'danger', text: 'Failed to load entries for community voting.' });
    } finally {
      setLoadingVotingEntries(false);
    }
  };

  const handleToggleSort = () => {
    const nextSort = !sortVotesDescending;
    setSortVotesDescending(nextSort);
    if (selectedContestForVoting) {
      loadVotingEntries(selectedContestForVoting.contestId, nextSort);
    }
  };

  const handleVote = async (entry) => {
    if (entry.hasUserVoted) return;

    if (!isAuthenticated) {
      setActiveVoteEntry(entry);
      setGuestVoteEmail('');
      setShowGuestVoteModal(true);
      return;
    }

    try {
      setSubmittingVote(true);
      const res = await contestApi.voteEntry(entry.entryId, {});
      if (res.data?.success) {
        setVoteMessage({ type: 'success', text: 'Thank you! Your community vote has been recorded.' });
        setVotingEntries((prev) =>
          prev.map((item) =>
            item.entryId === entry.entryId
              ? { ...item, voteCount: res.data.data.newVoteCount, hasUserVoted: true }
              : item
          )
        );
      }
    } catch (err) {
      setVoteMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to submit vote.' });
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleGuestVoteSubmit = async (e) => {
    e.preventDefault();
    if (!guestVoteEmail.trim() || !activeVoteEntry) return;

    try {
      setSubmittingVote(true);
      const res = await contestApi.voteEntry(activeVoteEntry.entryId, { guestEmail: guestVoteEmail.trim() });
      if (res.data?.success) {
        setVoteMessage({ type: 'success', text: 'Thank you! Your guest vote has been verified and recorded.' });
        setVotingEntries((prev) =>
          prev.map((item) =>
            item.entryId === activeVoteEntry.entryId
              ? { ...item, voteCount: res.data.data.newVoteCount, hasUserVoted: true }
              : item
          )
        );
        setShowGuestVoteModal(false);
      }
    } catch (err) {
      setVoteMessage({ type: 'danger', text: err.response?.data?.message || 'Vote verification failed.' });
    } finally {
      setSubmittingVote(false);
    }
  };

  return (
    <div className="container py-5 luxury-contests">
      {/* 5-Star Hotel Haute Cuisine Header Banner */}
      <PageBanner
        tag="IV · COMPETITIVE ARENA"
        title="Culinary Contests"
        subtitle="Test your gastronomic skills in culinary contests curated by Chef James Thew."
        imageUrl="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80"
      />

      {error && (
        <div className="alert alert-danger mb-4" role="alert" style={{ borderRadius: 0 }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-4">
          <CulinarySkeleton count={3} />
        </div>
      ) : contests.length === 0 ? (
        <div
          className="p-5 text-center mb-4"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-rule)',
          }}
        >
          <h4 className="brand-font mb-2">No Active Contests Right Now</h4>
          <p className="text-muted mb-0">
            Chef James Thew is preparing the next exciting contest challenge. Check back soon or browse our winning announcements!
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {contests.map((c) => (
            <ContestCard
              key={c.contestId}
              contest={c}
              onOpenVoting={handleOpenVotingModal}
              onOpenSubmit={handleOpenSubmitModal}
            />
          ))}
        </div>
      )}

      {/* Entry Submission Modal */}
      <ContestSubmitModal
        selectedContest={selectedContest}
        onClose={() => setSelectedContest(null)}
        onSubmit={handleSubmitEntry}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        submitSuccess={submitSuccess}
        submitError={submitError}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {/* Community Entries & Voting Modal */}
      <ContestVotingModal
        selectedContestForVoting={selectedContestForVoting}
        onClose={() => setSelectedContestForVoting(null)}
        votingEntries={votingEntries}
        loadingVotingEntries={loadingVotingEntries}
        sortVotesDescending={sortVotesDescending}
        onToggleSort={handleToggleSort}
        onVote={handleVote}
        submittingVote={submittingVote}
        voteMessage={voteMessage}
        onOpenSubmitModal={handleOpenSubmitModal}
      />

      {/* Guest Email Verification for Voting Modal */}
      <ContestGuestVoteModal
        show={showGuestVoteModal}
        activeVoteEntry={activeVoteEntry}
        guestVoteEmail={guestVoteEmail}
        setGuestVoteEmail={setGuestVoteEmail}
        onClose={() => setShowGuestVoteModal(false)}
        onSubmit={handleGuestVoteSubmit}
        submittingVote={submittingVote}
      />
    </div>
  );
};

export default ContestsPage;
