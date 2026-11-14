import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contestApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CulinarySkeleton } from '../../components/common/CulinarySkeleton';

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

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await contestApi.getAll();
      if (res.data && res.data.success) {
        setContests(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load culinary contests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (contest) => {
    setSelectedContest(contest);
    setSubmitSuccess('');
    setSubmitError('');
    setFormData({
      title: '',
      ingredients: '',
      cookingProcedure: '',
      tipContent: '',
      guestName: isAuthenticated ? (user?.fullName || '') : '',
      guestEmail: isAuthenticated ? (user?.email || '') : '',
    });
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Client-side validations
    if (!formData.title.trim()) {
      setSubmitError('Please enter a submission title.');
      return;
    }

    if (!isAuthenticated) {
      if (!formData.guestName.trim()) {
        setSubmitError('Your full name is required for guest submissions.');
        return;
      }
      if (!formData.guestEmail.trim()) {
        setSubmitError('Your email address is required so we can notify you if you win.');
        return;
      }
    }

    if (selectedContest?.contestType === 'RECIPE') {
      if (!formData.ingredients.trim()) {
        setSubmitError('Ingredients list is required for a recipe contest.');
        return;
      }
      if (!formData.cookingProcedure.trim()) {
        setSubmitError('Cooking procedure is required for a recipe contest.');
        return;
      }
    } else if (selectedContest?.contestType === 'TIP') {
      if (!formData.tipContent.trim()) {
        setSubmitError('Tip content is required for a cooking tip contest.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        ingredients: selectedContest?.contestType === 'RECIPE' ? formData.ingredients : null,
        cookingProcedure: selectedContest?.contestType === 'RECIPE' ? formData.cookingProcedure : null,
        tipContent: selectedContest?.contestType === 'TIP' ? formData.tipContent : null,
        guestName: !isAuthenticated ? formData.guestName : null,
        guestEmail: !isAuthenticated ? formData.guestEmail : null,
      };

      const res = await contestApi.submitEntry(selectedContest.contestId, payload);
      if (res.data && res.data.success) {
        setSubmitSuccess('Your culinary masterpiece has been submitted successfully! Chef James Thew will review your entry.');
        fetchContests();
      } else {
        setSubmitError(res.data?.message || 'Failed to submit entry.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Submission failed. Please check your inputs.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenVotingModal = async (contest) => {
    setSelectedContestForVoting(contest);
    setVoteMessage({ type: '', text: '' });
    loadVotingEntries(contest.contestId, sortVotesDescending);
  };

  const loadVotingEntries = async (contestId, sortVotes) => {
    setLoadingVotingEntries(true);
    try {
      const res = await contestApi.getCommunityEntries(contestId, { orderByVotes: sortVotes });
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
      {/* Header Banner - Architectural Pale Taupe Panel */}
      <div 
        className="field-taupe p-4 p-md-5 mb-5 text-center position-relative overflow-hidden" 
        style={{ 
          backgroundColor: 'var(--dp-color-ground-2)', 
          border: '1px solid var(--dp-color-panel-line)',
          backgroundImage: 'linear-gradient(rgba(244, 240, 234, 0.90), rgba(244, 240, 234, 0.95)), url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="d-inline-flex align-items-center gap-2 mb-2 px-3 py-1 bg-white border" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
          <span className="font-monospace fw-bold" style={{ color: 'var(--dp-color-accent)', fontSize: '0.8rem' }}>&diams;</span>
          <span className="roman-numeral mb-0" style={{ fontSize: '0.8rem' }}>IV &middot; COMPETITIVE ARENA</span>
          <span className="font-monospace fw-bold" style={{ color: 'var(--dp-color-accent)', fontSize: '0.8rem' }}>&diams;</span>
        </div>
        <h1 className="brand-font display-5 mb-3 text-dark">Culinary Contests by Chef James Thew</h1>
        <p className="lead max-w-700 mx-auto" style={{ color: 'var(--dp-color-ink-2)' }}>
          The Grand Palace Hotel invites culinarians, passionate artisans, and gifted home cooks to challenge culinary frontiers. Showcase your cooking skills, secret recipes, and clever kitchen tips. Open to all registered members and enthusiastic home cooks alike!
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
          <span
            className="badge font-monospace px-3 py-2"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              color: 'var(--dp-color-on-field)',
              borderRadius: 0,
              border: '1px solid var(--dp-color-panel-line)',
            }}
          >
            Free for Everyone to Enter
          </span>
          <span
            className="badge font-monospace px-3 py-2"
            style={{
              backgroundColor: 'var(--dp-color-accent)',
              color: '#ffffff',
              borderRadius: 0,
            }}
          >
            &star; $5,000 Bursary &amp; Grand Trophy
          </span>
          <span
            className="badge font-monospace px-3 py-2"
            style={{
              backgroundColor: '#1b4d3e',
              color: '#ffffff',
              borderRadius: 0,
            }}
          >
            Win Recognition & Prizes
          </span>
        </div>
      </div>

      {/* 3-Step Visual Submission Guide (Eliminates wall of text) */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="p-4 bg-white h-100 border text-center position-relative" style={{ borderColor: 'var(--dp-color-rule)', borderTop: '2px solid var(--dp-color-ink-2)' }}>
            <span className="badge font-monospace mb-2" style={{ backgroundColor: 'var(--dp-color-ground-2)', color: 'var(--dp-color-ink)', border: '1px solid var(--dp-color-panel-line)', borderRadius: 0 }}>
              STEP 01
            </span>
            <h6 className="brand-font mb-2 text-dark" style={{ fontSize: '1.15rem' }}>Submit Recipe or Tip</h6>
            <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>
              Free entry for everyone. Provide clear ingredients and instructions.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 bg-white h-100 border text-center position-relative" style={{ borderColor: 'var(--dp-color-rule)', borderTop: '2px solid var(--dp-color-accent)' }}>
            <span className="badge font-monospace mb-2" style={{ backgroundColor: 'var(--dp-color-accent)', color: '#ffffff', borderRadius: 0 }}>
              STEP 02
            </span>
            <h6 className="brand-font mb-2 text-dark" style={{ fontSize: '1.15rem' }}>Community Voting</h6>
            <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>
              Members and verified guests vote for the most creative culinary entries.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 bg-white h-100 border text-center position-relative" style={{ borderColor: 'var(--dp-color-rule)', borderTop: '2px solid #1b4d3e' }}>
            <span className="badge font-monospace mb-2" style={{ backgroundColor: '#1b4d3e', color: '#ffffff', borderRadius: 0 }}>
              STEP 03 &middot; PRIZES
            </span>
            <h6 className="brand-font mb-2 text-dark" style={{ fontSize: '1.15rem' }}>Chef James Awards</h6>
            <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>
              Grand prize winners featured in the Hall of Fame announcement board.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" style={{ borderRadius: 0 }}>
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
          {contests.map((c) => {
            const isEnded = !c.isActive || new Date(c.endDate) < new Date();
            return (
              <div key={c.contestId} className="col-lg-6">
                <div
                  className="card h-100 p-4 d-flex flex-column atelier-card-hover"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--dp-color-rule)',
                    borderTop: '2px solid var(--dp-color-accent)',
                    borderRadius: 0,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span
                      className="badge font-monospace"
                      style={{
                        backgroundColor: 'var(--dp-color-field)',
                        color: 'var(--dp-color-on-field)',
                        borderRadius: 0,
                      }}
                    >
                      {c.contestType === 'RECIPE' ? 'Recipe Contest' : 'Tip Contest'}
                    </span>
                    <span
                      className="badge font-monospace"
                      style={{
                        backgroundColor: isEnded ? 'var(--dp-color-ink-2)' : '#1b4d3e',
                        color: '#ffffff',
                        borderRadius: 0,
                      }}
                    >
                      {isEnded ? 'Closed' : 'Active & Open'}
                    </span>
                  </div>

                  <h3 className="brand-font mb-2 text-dark" style={{ fontSize: '1.45rem' }}>
                    {c.title}
                  </h3>
                  <p className="text-muted small flex-grow-1 mb-4" style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                    {c.description}
                  </p>

                  <div
                    className="p-3 mb-4 small"
                    style={{
                      backgroundColor: 'var(--dp-color-ground-2)',
                      border: '1px solid var(--dp-color-panel-line)',
                    }}
                  >
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <span><strong>Starts:</strong> {new Date(c.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="col-sm-6">
                        <span><strong>Ends:</strong> {new Date(c.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="col-12 mt-2 pt-2 border-top d-flex justify-content-between" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                        <span><strong>Curated by:</strong> {c.creatorName || 'Chef James Thew'}</span>
                        <span className="font-monospace fw-semibold" style={{ color: 'var(--dp-color-accent-text)' }}>
                          {c.entryCount || 0} Submissions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 d-flex flex-column gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 font-monospace text-uppercase"
                      style={{
                        borderColor: 'var(--dp-color-rule)',
                        color: 'var(--dp-color-ink)',
                        borderRadius: 0,
                        fontSize: '0.8rem',
                        letterSpacing: '0.12em',
                      }}
                      onClick={() => handleOpenVotingModal(c)}
                    >
                      <span>View Entries & Vote ({c.entryCount || 0})</span>
                    </button>

                    {isEnded ? (
                      <button className="btn btn-outline-secondary w-100" disabled style={{ borderRadius: 0 }}>
                        Contest has Closed
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary w-100 fw-semibold"
                        style={{
                          backgroundColor: 'var(--dp-color-field)',
                          color: 'var(--dp-color-on-field)',
                          letterSpacing: '0.14em',
                          borderRadius: 0,
                        }}
                        onClick={() => handleOpenSubmitModal(c)}
                      >
                        Submit Your Entry Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Entry Submission Modal */}
      {selectedContest && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(38, 35, 33, 0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div
              className="modal-content"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              <div
                className="modal-header py-3 px-4"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  borderBottom: '1px solid var(--dp-color-accent)',
                  borderRadius: 0,
                }}
              >
                <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.25rem' }}>
                  Submit to: {selectedContest.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setSelectedContest(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {submitSuccess ? (
                  <div className="text-center py-4">
                    <div className="text-success font-monospace fw-bold fs-4 mb-3">[SUCCESS]</div>
                    <h4 className="brand-font text-dark mb-2">Submission Received!</h4>
                    <p className="text-muted mb-4">{submitSuccess}</p>
                    <button
                      className="btn btn-primary px-4 py-2"
                      style={{
                        backgroundColor: 'var(--dp-color-field)',
                        color: 'var(--dp-color-on-field)',
                        letterSpacing: '0.14em',
                        borderRadius: 0,
                      }}
                      onClick={() => setSelectedContest(null)}
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEntry}>
                    {submitError && (
                      <div className="alert alert-danger mb-3" style={{ borderRadius: 0 }}>
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Submitter Info Notice */}
                    {isAuthenticated ? (
                      <div
                        className="p-3 mb-3 small"
                        style={{
                          backgroundColor: 'var(--dp-color-ground-2)',
                          border: '1px solid var(--dp-color-panel-line)',
                        }}
                      >
                        <span>
                          Submitting as registered member: <strong>{user?.fullName}</strong> ({user?.email})
                        </span>
                      </div>
                    ) : (
                      <div
                        className="p-3 mb-3"
                        style={{
                          backgroundColor: 'var(--dp-color-ground-2)',
                          border: '1px solid var(--dp-color-panel-line)',
                        }}
                      >
                        <p className="small text-muted mb-3">
                          <strong className="text-dark">Guest Participant:</strong> No account required to enter! Please provide your name and email so we can reach you when winners are announced.
                        </p>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold">Your Full Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. John Doe"
                              value={formData.guestName}
                              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold">Your Email Address *</label>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="john@example.com"
                              value={formData.guestEmail}
                              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submission Title */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Submission Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={
                          selectedContest.contestType === 'RECIPE'
                            ? 'e.g. Authentic Sicilian Truffle Risotto'
                            : 'e.g. Secret to Keeping Herbs Fresh for 3 Weeks'
                        }
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Dynamic Fields based on contest type */}
                    {selectedContest.contestType === 'RECIPE' ? (
                      <>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Ingredients List *</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="- 200g Arborio rice&#10;- 50g fresh black truffle&#10;- 1L vegetable broth"
                            value={formData.ingredients}
                            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                            required
                          ></textarea>
                          <small className="text-muted">List all ingredients with quantities.</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Cooking Procedure & Steps *</label>
                          <textarea
                            className="form-control"
                            rows="5"
                            placeholder="Step 1: Sauté minced shallots in olive oil...&#10;Step 2: Add rice and toast for 2 minutes..."
                            value={formData.cookingProcedure}
                            onChange={(e) => setFormData({ ...formData, cookingProcedure: e.target.value })}
                            required
                          ></textarea>
                        </div>
                      </>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Culinary Tip / Technique *</label>
                        <textarea
                          className="form-control"
                          rows="6"
                          placeholder="Describe your unique kitchen tip, time-saving technique, or flavor secret in detail..."
                          value={formData.tipContent}
                          onChange={(e) => setFormData({ ...formData, tipContent: e.target.value })}
                          required
                        ></textarea>
                      </div>
                    )}

                    <div className="modal-footer px-0 pb-0 pt-3 border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        style={{ borderRadius: 0, letterSpacing: '0.12em' }}
                        onClick={() => setSelectedContest(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary px-4 fw-semibold"
                        style={{
                          backgroundColor: 'var(--dp-color-field)',
                          color: 'var(--dp-color-on-field)',
                          letterSpacing: '0.14em',
                          borderRadius: 0,
                        }}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Entry'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Community Entries & Live Voting Modal */}
      {selectedContestForVoting && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(38, 35, 33, 0.75)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div
              className="modal-content"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              <div
                className="modal-header py-3 px-4"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  borderBottom: '1px solid var(--dp-color-accent)',
                  borderRadius: 0,
                }}
              >
                <div>
                  <div className="roman-numeral text-white small" style={{ letterSpacing: '0.15em', opacity: 0.85 }}>
                    COMMUNITY ARENA &middot; VOTE
                  </div>
                  <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.35rem' }}>
                    Entries for: {selectedContestForVoting.title}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setSelectedContestForVoting(null)}
                ></button>
              </div>

              <div className="modal-body p-4" style={{ backgroundColor: 'var(--dp-color-ground-1)' }}>
                {voteMessage.text && (
                  <div className={`alert alert-${voteMessage.type} mb-4`} style={{ borderRadius: 0 }}>
                    <span>{voteMessage.text}</span>
                  </div>
                )}

                {/* Sub-toolbar: Sort order and Count */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 p-3 bg-white border" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="font-monospace small text-muted text-uppercase" style={{ letterSpacing: '0.1em' }}>
                      Submissions:
                    </span>
                    <span className="badge bg-dark font-monospace" style={{ borderRadius: 0 }}>
                      {votingEntries.length} Entries
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary font-monospace"
                    style={{ borderRadius: 0, letterSpacing: '0.08em' }}
                    onClick={handleToggleSort}
                  >
                    <span>Order: {sortVotesDescending ? 'Most Voted First' : 'Newest Submissions'}</span>
                  </button>
                </div>

                {loadingVotingEntries ? (
                  <div className="py-4">
                    <CulinarySkeleton count={2} />
                  </div>
                ) : votingEntries.length === 0 ? (
                  <div className="text-center py-5 bg-white border p-4" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                    <h5 className="brand-font text-dark mb-2">No Submissions Yet</h5>
                    <p className="text-muted small mb-3">Be the first culinarian to enter this contest and collect community votes!</p>
                    <button
                      className="btn btn-primary btn-sm px-3"
                      style={{
                        backgroundColor: 'var(--dp-color-field)',
                        color: 'var(--dp-color-on-field)',
                        borderRadius: 0,
                      }}
                      onClick={() => {
                        setSelectedContestForVoting(null);
                        handleOpenSubmitModal(selectedContestForVoting);
                      }}
                    >
                      Submit An Entry Now
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    {votingEntries.map((entry, idx) => {
                      const isTopVoted = idx === 0 && sortVotesDescending && (entry.voteCount || 0) > 0;
                      return (
                        <div key={entry.entryId} className="col-12 col-lg-6">
                          <div
                            className="card h-100 shadow-sm atelier-card-hover"
                            style={{
                              backgroundColor: '#ffffff',
                              border: isTopVoted ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-panel-line)',
                              borderRadius: 0,
                            }}
                          >
                            <div className="card-body p-4 d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="font-monospace small text-muted">
                                  by {entry.participantName || entry.guestName || 'Anonymous Culinarian'}
                                </span>
                                {isTopVoted && (
                                  <span
                                    className="badge font-monospace"
                                    style={{
                                      backgroundColor: 'var(--dp-color-accent)',
                                      color: 'var(--dp-color-field)',
                                      borderRadius: 0,
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    ★ Community Favorite
                                  </span>
                                )}
                              </div>

                              <h4 className="brand-font text-dark mb-3" style={{ fontSize: '1.25rem' }}>
                                {entry.title}
                              </h4>

                              {entry.ingredients && (
                                <div className="mb-3 small">
                                  <strong className="text-dark d-block mb-1">Key Ingredients:</strong>
                                  <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>
                                    {entry.ingredients}
                                  </p>
                                </div>
                              )}

                              {entry.cookingProcedure && (
                                <div className="mb-3 small flex-grow-1">
                                  <strong className="text-dark d-block mb-1">Cooking Method:</strong>
                                  <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line', maxHeight: '120px', overflowY: 'auto' }}>
                                    {entry.cookingProcedure}
                                  </p>
                                </div>
                              )}

                              {entry.tipContent && (
                                <div className="mb-3 small flex-grow-1">
                                  <strong className="text-dark d-block mb-1">Culinary Tip:</strong>
                                  <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line', maxHeight: '120px', overflowY: 'auto' }}>
                                    {entry.tipContent}
                                  </p>
                                </div>
                              )}

                              <div
                                className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center"
                                style={{ borderColor: 'var(--dp-color-panel-line)' }}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <span style={{ color: '#b69355', fontSize: '1.1rem' }}>♥</span>
                                  <span className="font-monospace fw-bold" style={{ color: 'var(--dp-color-ink)', fontSize: '1.05rem' }}>
                                    {entry.voteCount || 0}
                                  </span>
                                  <span className="text-muted small">votes</span>
                                </div>

                                <div>
                                  {entry.hasUserVoted ? (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-success font-monospace"
                                      disabled
                                      style={{ borderRadius: 0, fontSize: '0.8rem', letterSpacing: '0.08em' }}
                                    >
                                      ✓ You Voted
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary font-monospace"
                                      disabled={submittingVote}
                                      onClick={() => handleVote(entry)}
                                      style={{
                                        backgroundColor: 'var(--dp-color-field)',
                                        color: 'var(--dp-color-on-field)',
                                        borderRadius: 0,
                                        fontSize: '0.8rem',
                                        letterSpacing: '0.1em',
                                      }}
                                    >
                                      Vote for Entry
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-footer px-4 py-3 bg-white border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary font-monospace"
                  style={{ borderRadius: 0, letterSpacing: '0.1em' }}
                  onClick={() => setSelectedContestForVoting(null)}
                >
                  Close Arena
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Email Verification for Voting Modal */}
      {showGuestVoteModal && activeVoteEntry && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(38, 35, 33, 0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              <div
                className="modal-header py-3 px-4"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  borderBottom: '1px solid var(--dp-color-accent)',
                  borderRadius: 0,
                }}
              >
                <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.2rem' }}>
                  Confirm Guest Vote
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowGuestVoteModal(false)}
                ></button>
              </div>

              <form onSubmit={handleGuestVoteSubmit}>
                <div className="modal-body p-4">
                  <p className="small text-muted mb-3">
                    You are voting for: <strong className="text-dark">"{activeVoteEntry.title}"</strong>
                  </p>
                  <p className="small text-muted mb-3">
                    To maintain contest integrity and prevent duplicate votes, please enter your email address:
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Your Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. guest@example.com"
                      value={guestVoteEmail}
                      onChange={(e) => setGuestVoteEmail(e.target.value)}
                      required
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                </div>

                <div className="modal-footer px-4 py-3 bg-white border-top" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary font-monospace"
                    style={{ borderRadius: 0 }}
                    onClick={() => setShowGuestVoteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary font-monospace"
                    disabled={submittingVote || !guestVoteEmail.trim()}
                    style={{
                      backgroundColor: 'var(--dp-color-field)',
                      color: 'var(--dp-color-on-field)',
                      borderRadius: 0,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {submittingVote ? 'Recording...' : 'Cast My Vote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestsPage;
