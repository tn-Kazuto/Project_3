import React, { useState, useMemo } from 'react';
import AdminPagination from '../components/AdminPagination';

export const AdminContestsTab = ({
  contests = [],
  selectedContestForEntries,
  setSelectedContestForEntries,
  contestEntries = [],
  loadingEntries,
  entryError,
  entryMeta,
  entryPage,
  setEntryPage,
  pageSize,
  handlePageSizeChange,
  listError,
  onOpenContestModal,
  onViewEntries,
  onDeleteContest,
  onSelectWinner,
  loadContestEntries,
  renderManagementTableState,
  renderManagementPagination,
  onReload,
}) => {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewingEntryModal, setViewingEntryModal] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setSelectedType('');
    setSelectedStatus('');
  };

  const hasActiveFilters = Boolean(search || selectedType || selectedStatus);

  // Client-side filtering on current page
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      if (search) {
        const query = search.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(query);
        const descMatch = c.description?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      if (selectedType && c.contestType !== selectedType) {
        return false;
      }

      if (selectedStatus) {
        if (selectedStatus === 'ACTIVE' && !c.isActive) return false;
        if (selectedStatus === 'CLOSED' && c.isActive) return false;
      }

      return true;
    });
  }, [contests, search, selectedType, selectedStatus]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div>
      {selectedContestForEntries ? (
        /* ════════ SUB-VIEW: CONTEST ENTRIES & WINNER JUDGING ════════ */
        <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: 0 }}>
          <div
            className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3"
            style={{ borderColor: 'var(--dp-color-rule)' }}
          >
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary me-2 text-nowrap"
                style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.06em' }}
                onClick={() => setSelectedContestForEntries(null)}
              >
                &larr; Back to Contests
              </button>
              <strong className="h5 mb-0 align-middle brand-font text-dark">
                Submissions for: {selectedContestForEntries.title}
              </strong>
            </div>
            <span
              className="badge font-monospace"
              style={{ backgroundColor: 'var(--dp-color-field)', color: '#ffffff', borderRadius: 0 }}
            >
              {entryMeta?.totalCount || 0} Submissions
            </span>
          </div>

          <div className="card-body p-0">
            {loadingEntries ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted font-monospace small">Loading community submissions...</p>
              </div>
            ) : entryError ? (
              <div className="text-center py-5" role="alert">
                <p className="text-danger mb-3">{entryError}</p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  style={{ borderRadius: 0 }}
                  onClick={() => loadContestEntries(selectedContestForEntries)}
                >
                  Retry Loading
                </button>
              </div>
            ) : contestEntries.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="roman-numeral mb-2" style={{ fontSize: '0.85rem' }}>AWAITING CREATIONS</div>
                <p className="mb-0">No entries submitted yet for this arena competition.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
                  <thead className="table-light">
                    <tr>
                      <th scope="col" style={{ width: '25%' }}>Submission Title</th>
                      <th scope="col" style={{ width: '22%' }}>Submitter</th>
                      <th scope="col" style={{ width: '10%' }}>Type</th>
                      <th scope="col" style={{ width: '14%' }}>Community Votes</th>
                      <th scope="col" style={{ width: '15%' }}>Recipe / Tip Snippet</th>
                      <th scope="col" style={{ width: '10%' }}>Status</th>
                      <th scope="col" className="text-end" style={{ minWidth: '140px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contestEntries.map((e) => (
                      <tr key={e.entryId} className={e.isWinner ? 'table-warning' : ''}>
                        {/* TITLE */}
                        <td>
                          <div className="fw-bold text-dark">{e.title}</div>
                        </td>

                        {/* SUBMITTER */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0 font-monospace fw-bold"
                              style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: 'var(--dp-color-ground-2)',
                                border: '1px solid var(--dp-color-panel-line)',
                                color: 'var(--dp-color-ink)',
                                fontSize: '0.72rem',
                                borderRadius: 0,
                              }}
                            >
                              {getInitials(e.submitterName)}
                            </div>
                            <div className="overflow-hidden">
                              <div className="fw-semibold text-truncate small">{e.submitterName}</div>
                              <small className="text-muted text-truncate d-block" style={{ fontSize: '0.72rem' }}>
                                {e.submitterEmail}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* TYPE */}
                        <td>
                          <span
                            className="badge font-monospace text-uppercase"
                            style={{
                              backgroundColor: e.isGuest ? '#6c757d' : '#8a6d3b',
                              color: '#ffffff',
                              borderRadius: 0,
                              fontSize: '0.68rem',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {e.isGuest ? 'Guest' : 'Member'}
                          </span>
                        </td>

                        {/* VOTES */}
                        <td>
                          <span className="badge bg-light text-dark border font-monospace" style={{ borderRadius: 0 }}>
                            &#9873; {e.voteCount || 0} votes
                          </span>
                        </td>

                        {/* DETAILS SNIPPET */}
                        <td>
                          <div className="small text-truncate text-muted" style={{ maxWidth: '240px' }}>
                            {e.contestType === 'RECIPE'
                              ? (e.ingredients || '—')
                              : (e.tipContent || '—')}
                          </div>
                          {(e.ingredients || e.tipContent) && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-decoration-none gold-underline"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => setViewingEntryModal(e)}
                            >
                              View Recipe &rarr;
                            </button>
                          )}
                        </td>

                        {/* STATUS */}
                        <td>
                          {e.isWinner ? (
                            <span
                              className="badge font-monospace text-uppercase"
                              style={{
                                backgroundColor: '#8a6d3b',
                                color: '#ffffff',
                                borderRadius: 0,
                                fontSize: '0.72rem',
                                letterSpacing: '0.06em',
                              }}
                            >
                              &#9813; Winner
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted border font-monospace" style={{ borderRadius: 0, fontSize: '0.72rem' }}>
                              Participant
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="text-end">
                          {!e.isWinner && (
                            <button
                              className="btn btn-sm fw-semibold text-nowrap"
                              style={{
                                backgroundColor: 'var(--dp-color-accent)',
                                color: '#ffffff',
                                borderRadius: 0,
                                fontSize: '0.75rem',
                                letterSpacing: '0.06em',
                              }}
                              onClick={() => onSelectWinner(e)}
                            >
                              Select Winner
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AdminPagination
            page={entryPage}
            pageSize={pageSize}
            totalCount={entryMeta?.totalCount || 0}
            onPageChange={setEntryPage}
            onPageSizeChange={handlePageSizeChange}
            disabled={loadingEntries}
            label="Contest submissions"
          />

          {/* ── ENTRY DETAILS MODAL ── */}
          {viewingEntryModal && (
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
                      <div className="roman-numeral mb-1" style={{ fontSize: '0.8rem' }}>SUBMISSION DOSSIER</div>
                      <h3 className="brand-font h5 mb-0 text-dark">{viewingEntryModal.title}</h3>
                    </div>
                    <button
                      type="button"
                      className="btn-close shadow-none"
                      aria-label="Close"
                      onClick={() => setViewingEntryModal(null)}
                    />
                  </div>

                  <div className="modal-body p-4">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-light text-dark border font-monospace">
                        Author: {viewingEntryModal.submitterName} ({viewingEntryModal.submitterEmail})
                      </span>
                      <span className="badge font-monospace" style={{ backgroundColor: '#1b4d3e', color: '#fff' }}>
                        Community Votes: {viewingEntryModal.voteCount || 0}
                      </span>
                    </div>

                    {viewingEntryModal.contestType === 'RECIPE' ? (
                      <div>
                        <div className="small fw-semibold text-uppercase font-monospace text-muted mb-2">
                          Ingredients &amp; Recipe Description
                        </div>
                        <div
                          className="p-3 border small"
                          style={{
                            backgroundColor: 'var(--dp-color-ground)',
                            borderColor: 'var(--dp-color-panel-line)',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.7',
                          }}
                        >
                          {viewingEntryModal.ingredients}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="small fw-semibold text-uppercase font-monospace text-muted mb-2">
                          Culinary Tip Content
                        </div>
                        <div
                          className="p-3 border small"
                          style={{
                            backgroundColor: 'var(--dp-color-ground)',
                            borderColor: 'var(--dp-color-panel-line)',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.7',
                          }}
                        >
                          {viewingEntryModal.tipContent}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer px-4 py-3 border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      style={{ borderRadius: 0 }}
                      onClick={() => setViewingEntryModal(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ════════ MAIN TABLE: CONTESTS DIRECTORY ════════ */
        <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: 0 }}>
          {/* ── CARD HEADER ── */}
          <div
            className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3"
            style={{ borderColor: 'var(--dp-color-rule)' }}
          >
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="roman-numeral" style={{ fontSize: '0.85rem' }}>COMPETITIVE ARENA</span>
                <span className="badge font-monospace bg-light text-dark border">
                  {contests.length} Arena Competitions
                </span>
              </div>
              <h2 className="brand-font h4 mb-0 text-dark">Culinary Contests Management</h2>
              <p className="small text-muted mb-0">Coordinate culinary challenges, inspect home cook submissions, and manage community voting laureates.</p>
            </div>
            <button
              className="btn btn-warning text-dark fw-semibold btn-sm px-3 d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: 'var(--dp-color-accent)',
                borderColor: 'var(--dp-color-accent)',
                letterSpacing: '0.12em',
                borderRadius: 0,
              }}
              onClick={onOpenContestModal}
            >
              <span>+ Create Contest</span>
            </button>
          </div>

          {/* ── SEARCH & FILTER CONTROLS TOOLBAR ── */}
          <div
            className="p-3 px-4 border-bottom"
            style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}
          >
            <form className="row g-2 align-items-end" onSubmit={handleSearchSubmit}>
              <div className="col-12 col-md-5">
                <label
                  className="form-label small fw-semibold text-uppercase font-monospace mb-1"
                  htmlFor="contest-search-input"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                >
                  Search Competitions
                </label>
                <div className="input-group input-group-sm">
                  <input
                    id="contest-search-input"
                    type="search"
                    className="form-control"
                    placeholder="Search by contest title or theme..."
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
                  htmlFor="contest-type-filter"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                >
                  Challenge Type
                </label>
                <select
                  id="contest-type-filter"
                  className="form-select form-select-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
                >
                  <option value="">All Challenge Types</option>
                  <option value="RECIPE">Recipe Contests</option>
                  <option value="TIP">Cooking Tip Contests</option>
                </select>
              </div>

              <div className="col-6 col-md-2">
                <label
                  className="form-label small fw-semibold text-uppercase font-monospace mb-1"
                  htmlFor="contest-status-filter"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                >
                  Arena Status
                </label>
                <select
                  id="contest-status-filter"
                  className="form-select form-select-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active Competitions</option>
                  <option value="CLOSED">Closed / Completed</option>
                </select>
              </div>

              <div className="col-12 col-md-2 d-flex justify-content-end align-items-end">
                {hasActiveFilters && (
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

            {hasActiveFilters && (
              <div className="mt-2 small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                Showing {filteredContests.length} of {contests.length} contests matching filters.
              </div>
            )}
          </div>

          {/* ── CONTESTS DIRECTORY TABLE ── */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: '38%' }}>Title &amp; Challenge Theme</th>
                  <th scope="col">Contest Type</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Entries</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end" style={{ minWidth: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderManagementTableState(contests, 6, 'No contests have been created yet.', onReload)}
                {!listError && filteredContests.length === 0 && contests.length > 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <div className="roman-numeral mb-2" style={{ fontSize: '0.85rem' }}>ZERO MATCHES</div>
                      <p className="mb-2">No contests match the active filter criteria.</p>
                      <button className="btn btn-sm btn-outline-secondary" onClick={handleResetFilters} style={{ borderRadius: 0 }}>
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                )}
                {!listError && filteredContests.map((c) => (
                  <tr key={c.contestId}>
                    {/* TITLE & DESCRIPTION */}
                    <td>
                      <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                        {c.title}
                      </div>
                      {c.description && (
                        <p
                          className="small text-muted mb-0 line-clamp-2"
                          style={{ fontSize: '0.8rem', lineHeight: '1.45', maxWidth: '380px' }}
                        >
                          {c.description.length > 90 ? `${c.description.substring(0, 90)}...` : c.description}
                        </p>
                      )}
                    </td>

                    {/* CONTEST TYPE */}
                    <td>
                      <span
                        className="badge font-monospace text-uppercase"
                        style={{
                          backgroundColor: c.contestType === 'RECIPE' ? 'var(--dp-color-field)' : '#8a6d3b',
                          color: '#ffffff',
                          borderRadius: 0,
                          fontSize: '0.7rem',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {c.contestType === 'RECIPE' ? 'Recipe Arena' : 'Culinary Tip'}
                      </span>
                    </td>

                    {/* DURATION */}
                    <td className="small text-muted font-monospace">
                      {new Date(c.startDate).toLocaleDateString()} &ndash; {new Date(c.endDate).toLocaleDateString()}
                    </td>

                    {/* ENTRIES */}
                    <td>
                      <span className="badge bg-light text-dark border font-monospace" style={{ borderRadius: 0 }}>
                        &#9874; {c.entryCount || 0} Submissions
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className="badge font-monospace text-uppercase"
                        style={{
                          backgroundColor: c.isActive ? '#1b4d3e' : '#6c757d',
                          color: '#ffffff',
                          borderRadius: 0,
                          fontSize: '0.72rem',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {c.isActive ? 'Active' : 'Closed'}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2 text-nowrap">
                        <button
                          className="btn btn-sm btn-outline-secondary text-nowrap"
                          style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.06em' }}
                          onClick={() => onViewEntries(c)}
                        >
                          View Entries
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger text-nowrap"
                          title="Delete Contest"
                          onClick={() => onDeleteContest(c.contestId, c.title)}
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

          {renderManagementPagination('contests', 'Contests')}
        </div>
      )}
    </div>
  );
};
