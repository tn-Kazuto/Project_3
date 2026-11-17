import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

export const AdminFeedbackTab = ({
  filteredFeedbacks = [],
  feedbackFilter,
  setFeedbackFilter,
  setListLoading,
  setPages,
  totalCounts,
  overviewCounts,
  pageSize,
  pages,
  listError,
  onDeleteFeedback,
  renderManagementTableState,
  renderManagementPagination,
  loadManagementPage,
}) => {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [mediaOnly, setMediaOnly] = useState(false);
  const [selectedFeedbackModal, setSelectedFeedbackModal] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setSelectedRating('');
    setMediaOnly(false);
  };

  const hasActiveLocalFilters = Boolean(search || selectedRating || mediaOnly);

  // Client-side filtering on current page
  const displayFeedbacks = useMemo(() => {
    return filteredFeedbacks.filter((f) => {
      if (search) {
        const query = search.toLowerCase();
        const commentMatch = f.comment?.toLowerCase().includes(query);
        const nameMatch = f.senderName?.toLowerCase().includes(query);
        const emailMatch = f.senderEmail?.toLowerCase().includes(query);
        const recipeMatch = f.recipeTitle?.toLowerCase().includes(query);
        if (!commentMatch && !nameMatch && !emailMatch && !recipeMatch) return false;
      }

      if (selectedRating) {
        if (selectedRating === '5' && f.rating !== 5) return false;
        if (selectedRating === '4' && f.rating !== 4) return false;
        if (selectedRating === '3' && f.rating !== 3) return false;
        if (selectedRating === 'LOW' && (f.rating > 2 || !f.rating)) return false;
        if (selectedRating === 'NONE' && f.rating > 0) return false;
      }

      if (mediaOnly && !f.mediaUrl) {
        return false;
      }

      return true;
    });
  }, [filteredFeedbacks, search, selectedRating, mediaOnly]);

  const renderStars = (rating) => {
    if (!rating || rating <= 0) return <span className="text-muted font-monospace small">—</span>;
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(Math.max(0, 5 - rating));
    return (
      <div className="d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '0.85rem' }}>
        <span style={{ color: '#b8860b', letterSpacing: '1px' }}>{fullStars}{emptyStars}</span>
        <span className="small text-muted ms-1">({rating}.0)</span>
      </div>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: 0 }}>
      {/* ── CARD HEADER & SEGMENTED FILTER BUTTONS ── */}
      <div
        className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3"
        style={{ borderColor: 'var(--dp-color-rule)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <h2 className="brand-font h4 mb-0 text-dark">User Reviews &amp; Feedback</h2>
          <span className="badge font-monospace bg-light text-dark border">
            {totalCounts.feedback} Total
          </span>
        </div>

        {/* Scope Switcher Buttons */}
        <div className="btn-group btn-group-sm" role="group" aria-label="Feedback filter scope">
          <button
            type="button"
            className={`btn px-3 fw-semibold ${feedbackFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{
              backgroundColor: feedbackFilter === 'ALL' ? 'var(--dp-color-field)' : 'transparent',
              color: feedbackFilter === 'ALL' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              borderRadius: 0,
              letterSpacing: '0.06em',
            }}
            onClick={() => {
              setListLoading(true);
              setFeedbackFilter('ALL');
              setPages((current) => ({ ...current, feedback: 1 }));
            }}
          >
            All ({totalCounts.feedback})
          </button>
          <button
            type="button"
            className={`btn px-3 fw-semibold ${feedbackFilter === 'RECIPE' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{
              backgroundColor: feedbackFilter === 'RECIPE' ? 'var(--dp-color-field)' : 'transparent',
              color: feedbackFilter === 'RECIPE' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              borderRadius: 0,
              letterSpacing: '0.06em',
            }}
            onClick={() => {
              setListLoading(true);
              setFeedbackFilter('RECIPE');
              setPages((current) => ({ ...current, feedback: 1 }));
            }}
          >
            Recipe Reviews ({overviewCounts.recipeFeedback})
          </button>
          <button
            type="button"
            className={`btn px-3 fw-semibold ${feedbackFilter === 'GENERAL' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{
              backgroundColor: feedbackFilter === 'GENERAL' ? 'var(--dp-color-field)' : 'transparent',
              color: feedbackFilter === 'GENERAL' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              borderRadius: 0,
              letterSpacing: '0.06em',
            }}
            onClick={() => {
              setListLoading(true);
              setFeedbackFilter('GENERAL');
              setPages((current) => ({ ...current, feedback: 1 }));
            }}
          >
            Website Feedback ({overviewCounts.siteFeedback})
          </button>
        </div>
      </div>

      {/* ── SEARCH & RATING FILTER TOOLBAR ── */}
      <div
        className="p-3 px-4 border-bottom"
        style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}
      >
        <form className="row g-2 align-items-end" onSubmit={handleSearchSubmit}>
          <div className="col-12 col-md-5">
            <label
              className="form-label small fw-semibold text-uppercase font-monospace mb-1"
              htmlFor="feedback-search-input"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Search Reviews
            </label>
            <div className="input-group input-group-sm">
              <input
                id="feedback-search-input"
                type="search"
                className="form-control"
                placeholder="Search comments, sender, or dish..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
              />
              <button
                type="submit"
                className="btn btn-outline-secondary"
                style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
              >
                Search
              </button>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <label
              className="form-label small fw-semibold text-uppercase font-monospace mb-1"
              htmlFor="feedback-rating-select"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Star Rating
            </label>
            <select
              id="feedback-rating-select"
              className="form-select form-select-sm"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="">All Ratings</option>
              <option value="5">★★★★★ 5 Stars Only</option>
              <option value="4">★★★★ 4 Stars Only</option>
              <option value="3">★★★ 3 Stars Only</option>
              <option value="LOW">★ - ★★ 1-2 Stars</option>
              <option value="NONE">No Rating (General)</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <div className="form-check pt-4">
              <input
                id="feedback-media-checkbox"
                type="checkbox"
                className="form-check-input"
                checked={mediaOnly}
                onChange={(e) => setMediaOnly(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label
                className="form-check-label small fw-semibold"
                htmlFor="feedback-media-checkbox"
                style={{ cursor: 'pointer', fontSize: '0.8rem' }}
              >
                With Photo Only
              </label>
            </div>
          </div>

          <div className="col-12 col-md-2 d-flex justify-content-end align-items-end">
            {hasActiveLocalFilters && (
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-muted p-0 pb-1"
                onClick={handleResetFilters}
                style={{ fontSize: '0.75rem' }}
                title="Reset filters"
              >
                &times; Reset Filters
              </button>
            )}
          </div>
        </form>

        {hasActiveLocalFilters && (
          <div className="mt-2 small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
            Showing {displayFeedbacks.length} of {filteredFeedbacks.length} entries matching search.
          </div>
        )}
      </div>

      {/* ── FEEDBACK TABLE ── */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
          <thead className="table-light">
            <tr>
              <th scope="col" style={{ width: '22%' }}>Sender</th>
              <th scope="col" style={{ width: '20%' }}>Target</th>
              <th scope="col" style={{ width: '13%' }}>Rating</th>
              <th scope="col" style={{ width: '25%' }}>Comment</th>
              <th scope="col" style={{ width: '10%' }}>Practiced Dish</th>
              <th scope="col">Date</th>
              <th scope="col" className="text-end" style={{ minWidth: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderManagementTableState(
              displayFeedbacks,
              7,
              'No feedback matches this filter yet.',
              () => loadManagementPage('feedback', pages.feedback, pageSize, feedbackFilter)
            )}
            {!listError && displayFeedbacks.map((f) => (
              <tr key={f.feedbackId}>
                {/* SENDER WITH AVATAR INITIAL */}
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 font-monospace fw-bold"
                      style={{
                        width: '38px',
                        height: '38px',
                        backgroundColor: 'var(--dp-color-field)',
                        color: 'var(--dp-color-on-field)',
                        fontSize: '0.78rem',
                        borderRadius: 0,
                      }}
                    >
                      {getInitials(f.senderName)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>
                        {f.senderName}
                      </div>
                      <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                        {f.senderEmail}
                      </small>
                      <span
                        className="badge font-monospace text-uppercase mt-1"
                        style={{
                          backgroundColor: f.isGuest ? '#6c757d' : '#8a6d3b',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          borderRadius: 0,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {f.isGuest ? 'Guest' : 'Member'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* TARGET */}
                <td>
                  {f.recipeTitle ? (
                    <div>
                      <span
                        className="badge bg-light text-dark border font-monospace text-truncate d-inline-block"
                        style={{ maxWidth: '210px', borderRadius: 0, fontSize: '0.75rem' }}
                        title={f.recipeTitle}
                      >
                        🍲 Recipe: {f.recipeTitle}
                      </span>
                      {f.recipeId && (
                        <div className="mt-1">
                          <Link
                            to={`/recipes/${f.recipeId}`}
                            target="_blank"
                            className="small gold-underline text-decoration-none"
                            style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
                          >
                            View Dish &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="badge bg-light text-muted border font-monospace" style={{ borderRadius: 0, fontSize: '0.75rem' }}>
                      🌐 General Website
                    </span>
                  )}
                </td>

                {/* RATING */}
                <td>{renderStars(f.rating)}</td>

                {/* COMMENT */}
                <td>
                  <div
                    className="small"
                    style={{
                      maxHeight: '4.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.5',
                      fontStyle: 'italic',
                      color: 'var(--dp-color-ink)',
                    }}
                    title={f.comment}
                  >
                    {f.comment}
                  </div>
                  {f.comment && f.comment.length > 80 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 mt-1 gold-underline text-decoration-none"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => setSelectedFeedbackModal(f)}
                    >
                      Read full comment
                    </button>
                  )}
                </td>

                {/* PRACTICED DISH PHOTO */}
                <td>
                  {f.mediaUrl ? (
                    <div
                      className="overflow-hidden border"
                      style={{
                        width: '46px',
                        height: '46px',
                        cursor: 'pointer',
                        borderColor: 'var(--dp-color-rule)',
                      }}
                      title="Click to view practiced creation"
                      onClick={() => setSelectedFeedbackModal(f)}
                    >
                      <img
                        src={f.mediaUrl}
                        alt="Practiced Dish"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <span className="text-muted font-monospace small">—</span>
                  )}
                </td>

                {/* DATE */}
                <td className="small text-muted font-monospace">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>

                {/* ACTIONS */}
                <td className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2 text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      style={{ borderRadius: 0, fontSize: '0.75rem' }}
                      title="Review details"
                      onClick={() => setSelectedFeedbackModal(f)}
                    >
                      Details
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger text-nowrap"
                      title="Delete Feedback"
                      aria-label="Delete feedback"
                      onClick={() => onDeleteFeedback(f.feedbackId)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderManagementPagination('feedback', 'Feedback entries')}

      {/* ── ATELIER REVIEW DETAIL & PHOTO MODAL ── */}
      {selectedFeedbackModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(20, 20, 19, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content shadow-lg" style={{ borderRadius: 0, border: '1px solid var(--dp-color-rule)' }}>
              <div
                className="modal-header px-4 py-3 border-bottom"
                style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}
              >
                <div>
                  <div className="roman-numeral mb-1" style={{ fontSize: '0.8rem' }}>COMMUNITY REVIEW DOSSIER</div>
                  <h3 className="brand-font h5 mb-0 text-dark">
                    Review by {selectedFeedbackModal.senderName}
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  aria-label="Close"
                  onClick={() => setSelectedFeedbackModal(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className={selectedFeedbackModal.mediaUrl ? 'col-md-7' : 'col-12'}>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="badge font-monospace" style={{ backgroundColor: selectedFeedbackModal.isGuest ? '#6c757d' : '#8a6d3b', color: '#fff' }}>
                        {selectedFeedbackModal.isGuest ? 'Guest Reviewer' : 'VIP Member'}
                      </span>
                      <span className="small text-muted font-monospace">
                        Email: {selectedFeedbackModal.senderEmail}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="small fw-semibold text-uppercase font-monospace text-muted mb-1">
                        Evaluation Target
                      </div>
                      <div className="p-2 border bg-light small font-monospace">
                        {selectedFeedbackModal.recipeTitle
                          ? `🍲 Recipe: ${selectedFeedbackModal.recipeTitle}`
                          : '🌐 General Platform Experience'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="small fw-semibold text-uppercase font-monospace text-muted mb-1">
                        Culinary Rating
                      </div>
                      <div>{renderStars(selectedFeedbackModal.rating)}</div>
                    </div>

                    <div>
                      <div className="small fw-semibold text-uppercase font-monospace text-muted mb-1">
                        Reviewer Testimony
                      </div>
                      <blockquote
                        className="p-3 border m-0"
                        style={{
                          backgroundColor: 'var(--dp-color-ground)',
                          borderColor: 'var(--dp-color-panel-line)',
                          fontStyle: 'italic',
                          lineHeight: '1.7',
                          color: 'var(--dp-color-ink)',
                        }}
                      >
                        “{selectedFeedbackModal.comment}”
                      </blockquote>
                    </div>
                  </div>

                  {selectedFeedbackModal.mediaUrl && (
                    <div className="col-md-5">
                      <div className="small fw-semibold text-uppercase font-monospace text-muted mb-2">
                        Practiced Dish Creation
                      </div>
                      <div
                        className="overflow-hidden border shadow-sm"
                        style={{
                          aspectRatio: '1',
                          backgroundColor: 'var(--dp-color-ground-2)',
                          borderColor: 'var(--dp-color-rule)',
                        }}
                      >
                        <img
                          src={selectedFeedbackModal.mediaUrl}
                          alt="Practiced Dish Creation"
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <a
                        href={selectedFeedbackModal.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-secondary w-100 mt-2 text-uppercase font-monospace"
                        style={{ borderRadius: 0, fontSize: '0.75rem' }}
                      >
                        Open High-Res Photo &nearr;
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer px-4 py-3 border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  style={{ borderRadius: 0 }}
                  onClick={() => setSelectedFeedbackModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
