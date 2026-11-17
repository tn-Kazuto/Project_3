import React, { useState, useMemo } from 'react';

export const AdminAnnouncementsTab = ({
  announcements = [],
  listError,
  onOpenAnnouncementModal,
  onDeleteAnnouncement,
  renderManagementTableState,
  renderManagementPagination,
  onReload,
}) => {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setFilterType('ALL');
  };

  const hasActiveFilters = Boolean(search || filterType !== 'ALL');

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (search) {
        const query = search.toLowerCase();
        const titleMatch = a.title?.toLowerCase().includes(query);
        const contentMatch = a.content?.toLowerCase().includes(query);
        const winnerMatch = a.winnerName?.toLowerCase().includes(query);
        const contestMatch = a.contestTitle?.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch && !winnerMatch && !contestMatch) return false;
      }

      if (filterType === 'WINNERS' && !a.winnerName) return false;
      if (filterType === 'GENERAL' && a.winnerName) return false;

      return true;
    });
  }, [announcements, search, filterType]);

  return (
    <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: 0 }}>
      {/* ── CARD HEADER ── */}
      <div
        className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3"
        style={{ borderColor: 'var(--dp-color-rule)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <h2 className="brand-font h4 mb-0 text-dark">Announcements Management</h2>
          <span className="badge font-monospace bg-light text-dark border">
            {announcements.length} Bulletins
          </span>
        </div>
        <button
          className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-2"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-on-field)',
            letterSpacing: '0.12em',
            borderRadius: 0,
          }}
          onClick={onOpenAnnouncementModal}
        >
          <span>+ Publish Announcement</span>
        </button>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div
        className="p-3 px-4 border-bottom"
        style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}
      >
        <form className="row g-2 align-items-end" onSubmit={handleSearchSubmit}>
          <div className="col-12 col-md-5">
            <label
              className="form-label small fw-semibold text-uppercase font-monospace mb-1"
              htmlFor="announcement-search"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Search Announcements
            </label>
            <div className="input-group input-group-sm">
              <input
                id="announcement-search"
                type="search"
                className="form-control"
                placeholder="Search by title, winner, or keyword..."
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

          <div className="col-8 col-md-4">
            <label
              className="form-label small fw-semibold text-uppercase font-monospace mb-1"
              htmlFor="announcement-filter-type"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Notice Type
            </label>
            <select
              id="announcement-filter-type"
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="ALL">All Announcements</option>
              <option value="WINNERS">Laureate Crowns (Winner Declared)</option>
              <option value="GENERAL">General Platform Notices</option>
            </select>
          </div>

          <div className="col-4 col-md-3 d-flex align-items-end">
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
            Showing {filteredAnnouncements.length} of {announcements.length} announcements matching filter.
          </div>
        )}
      </div>

      {/* ── ANNOUNCEMENTS TABLE ── */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
          <thead className="table-light">
            <tr>
              <th scope="col" style={{ width: '40%' }}>Title &amp; Notice</th>
              <th scope="col">Contest Linked</th>
              <th scope="col">Winner Declared</th>
              <th scope="col">Dispatch Status</th>
              <th scope="col">Published Date</th>
              <th scope="col" className="text-end" style={{ minWidth: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderManagementTableState(announcements, 6, 'No announcements have been published yet.', onReload)}
            {!listError && filteredAnnouncements.length === 0 && announcements.length > 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  <div className="roman-numeral mb-2" style={{ fontSize: '0.85rem' }}>ZERO MATCHES</div>
                  <p className="mb-2">No announcements match the active filter criteria.</p>
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleResetFilters} style={{ borderRadius: 0 }}>
                    Clear Filters
                  </button>
                </td>
              </tr>
            )}
            {!listError && filteredAnnouncements.map((a) => (
              <tr key={a.announcementId}>
                {/* TITLE & EXCERPT */}
                <td style={{ maxWidth: '380px' }}>
                  <div className="fw-bold text-dark text-truncate mb-0" style={{ fontSize: '0.92rem' }} title={a.title}>
                    {a.title}
                  </div>
                </td>

                {/* CONTEST LINKED */}
                <td>
                  {a.contestTitle ? (
                    <div className="d-flex align-items-center gap-1 small fw-semibold" style={{ color: 'var(--dp-color-ink-2)' }}>
                      <span style={{ color: 'var(--dp-color-accent)' }}>&#9733;</span>
                      <span className="text-truncate" style={{ maxWidth: '200px' }} title={a.contestTitle}>
                        {a.contestTitle}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted font-monospace small">—</span>
                  )}
                </td>

                {/* WINNER DECLARED */}
                <td>
                  {a.winnerName ? (
                    <div className="d-flex align-items-center gap-1">
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
                        &#9813; {a.winnerName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted font-monospace small">—</span>
                  )}
                </td>

                {/* DISPATCH STATUS */}
                <td>
                  <span
                    className="badge font-monospace"
                    style={{
                      backgroundColor: a.isEmailSent ? '#1b4d3e' : 'var(--dp-color-ground-2)',
                      color: a.isEmailSent ? '#ffffff' : 'var(--dp-color-ink-2)',
                      border: '1px solid var(--dp-color-panel-line)',
                      borderRadius: 0,
                      fontSize: '0.68rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {a.isEmailSent ? '✓ Dispatched' : 'Standard Bulletin'}
                  </span>
                </td>

                {/* DATE */}
                <td className="small text-muted font-monospace">
                  {new Date(a.publishedAt).toLocaleDateString()}
                </td>

                {/* ACTIONS */}
                <td className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2 text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.06em' }}
                      title="Read Full Announcement"
                      onClick={() => setSelectedAnnouncement(a)}
                    >
                      Read
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger text-nowrap"
                      title="Delete Announcement"
                      onClick={() => onDeleteAnnouncement(a.announcementId, a.title)}
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

      {renderManagementPagination('announcements', 'Announcements')}

      {/* ── ATELIER ANNOUNCEMENT PREVIEW MODAL ── */}
      {selectedAnnouncement && (
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
                  <div className="roman-numeral mb-1" style={{ fontSize: '0.8rem' }}>BULLETIN DISPATCH PREVIEW</div>
                  <h3 className="brand-font h5 mb-0 text-dark">{selectedAnnouncement.title}</h3>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  aria-label="Close"
                  onClick={() => setSelectedAnnouncement(null)}
                />
              </div>
              <div className="modal-body p-4">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedAnnouncement.contestTitle && (
                    <span className="badge bg-light text-dark border font-monospace">
                      Contest: {selectedAnnouncement.contestTitle}
                    </span>
                  )}
                  {selectedAnnouncement.winnerName && (
                    <span className="badge font-monospace" style={{ backgroundColor: '#8a6d3b', color: '#fff' }}>
                      Winner: {selectedAnnouncement.winnerName}
                    </span>
                  )}
                  <span className="badge bg-light text-muted border font-monospace">
                    Published: {new Date(selectedAnnouncement.publishedAt).toLocaleString()}
                  </span>
                </div>
                <div
                  className="p-3 border"
                  style={{
                    backgroundColor: 'var(--dp-color-ground)',
                    borderColor: 'var(--dp-color-panel-line)',
                    lineHeight: '1.75',
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-line',
                    color: 'var(--dp-color-ink)',
                  }}
                >
                  {selectedAnnouncement.content}
                </div>
              </div>
              <div className="modal-footer px-4 py-3 border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  style={{ borderRadius: 0 }}
                  onClick={() => setSelectedAnnouncement(null)}
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
