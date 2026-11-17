import React, { useState, useMemo } from 'react';
import { useDialogAccessibility } from '../../../hooks/useDialogAccessibility';

export const AdminTipsTab = ({
  tips = [],
  categories = [],
  listError,
  onOpenTipModal,
  onToggleTipFree,
  onDeleteTip,
  renderManagementTableState,
  renderManagementPagination,
  onReload,
}) => {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTipForModal, setSelectedTipForModal] = useState(null);

  const { dialogRef: tipModalRef } = useDialogAccessibility({
    isOpen: Boolean(selectedTipForModal),
    onClose: () => setSelectedTipForModal(null),
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setSelectedTier('');
    setSelectedFormat('');
  };

  const hasActiveFilters = Boolean(search || selectedTier || selectedFormat);

  // Client-side filtering on current paginated items
  const filteredTips = useMemo(() => {
    return tips.filter((t) => {
      if (search) {
        const query = search.toLowerCase();
        const titleMatch = t.title?.toLowerCase().includes(query);
        const contentMatch = t.content?.toLowerCase().includes(query);
        const authorMatch = t.authorName?.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch && !authorMatch) return false;
      }

      if (selectedTier) {
        if (selectedTier === 'FREE' && !t.isFree) return false;
        if (selectedTier === 'MEMBERS' && t.isFree) return false;
      }

      if (selectedFormat) {
        const hasVideo = Boolean(t.videoUrl);
        if (selectedFormat === 'VIDEO' && !hasVideo) return false;
        if (selectedFormat === 'ARTICLE' && hasVideo) return false;
      }

      return true;
    });
  }, [tips, search, selectedTier, selectedFormat]);

  return (
    <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: 0 }}>
      {/* ── CARD HEADER & ACTION ── */}
      <div
        className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3"
        style={{ borderColor: 'var(--dp-color-rule)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <h2 className="brand-font h4 mb-0 text-dark">Cooking Tips Management</h2>
          <span className="badge font-monospace bg-light text-dark border">
            {tips.length} Tips
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
          onClick={onOpenTipModal}
        >
          <span>+ Add Tip</span>
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
              htmlFor="tip-search-input"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Search Tips
            </label>
            <div className="input-group input-group-sm">
              <input
                id="tip-search-input"
                type="search"
                className="form-control"
                placeholder="Search by title, advice or author..."
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
              htmlFor="tip-tier-filter"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Access Tier
            </label>
            <select
              id="tip-tier-filter"
              className="form-select form-select-sm"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="">All Tiers</option>
              <option value="FREE">Free Access</option>
              <option value="MEMBERS">Members Only</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label
              className="form-label small fw-semibold text-uppercase font-monospace mb-1"
              htmlFor="tip-format-filter"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              Format
            </label>
            <select
              id="tip-format-filter"
              className="form-select form-select-sm"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="">All Formats</option>
              <option value="ARTICLE">Article</option>
              <option value="VIDEO">Video Guide</option>
            </select>
          </div>

          <div className="col-12 col-md-1 d-flex justify-content-end">
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                onClick={handleResetFilters}
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── TIPS DATA TABLE ── */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 font-monospace" style={{ fontSize: '0.84rem' }}>
          <thead style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}>
            <tr>
              <th scope="col" style={{ letterSpacing: '0.08em', minWidth: '300px' }}>TITLE</th>
              <th scope="col" style={{ letterSpacing: '0.08em', width: '130px' }}>CATEGORY</th>
              <th scope="col" style={{ letterSpacing: '0.08em', width: '110px' }}>FORMAT</th>
              <th scope="col" style={{ letterSpacing: '0.08em', width: '130px' }}>AUTHOR</th>
              <th scope="col" style={{ letterSpacing: '0.08em', width: '130px' }}>ACCESS TIER</th>
              <th scope="col" style={{ letterSpacing: '0.08em', width: '110px' }}>DATE</th>
              <th scope="col" className="text-end" style={{ letterSpacing: '0.08em', minWidth: '220px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderManagementTableState(filteredTips, 7, 'No cooking tips match your search criteria.', onReload)}
            {!listError &&
              filteredTips.map((t) => {
                const hasVideo = Boolean(t.videoUrl);
                const categoryBadge = t.categoryName || 'TECHNIQUE';

                return (
                  <tr key={t.tipId}>
                    <td style={{ maxWidth: '380px' }}>
                      <div className="fw-bold text-dark font-sans text-truncate mb-0" style={{ fontSize: '0.92rem' }} title={t.title}>
                        {t.title}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge font-monospace px-2 py-1"
                        style={{
                          backgroundColor: 'var(--dp-color-ground-2)',
                          color: '#495057',
                          border: '1px solid var(--dp-color-rule)',
                          borderRadius: 0,
                          fontSize: '0.72rem',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {categoryBadge}
                      </span>
                    </td>
                    <td>
                      {hasVideo ? (
                        <span
                          className="badge font-monospace px-2 py-1"
                          style={{
                            backgroundColor: 'rgba(197, 155, 39, 0.15)',
                            color: '#8c6b12',
                            border: '1px solid var(--dp-color-accent)',
                            borderRadius: 0,
                            fontSize: '0.72rem',
                          }}
                        >
                          ▶ VIDEO
                        </span>
                      ) : (
                        <span
                          className="badge font-monospace px-2 py-1"
                          style={{
                            backgroundColor: 'var(--dp-color-ground-2)',
                            color: '#6c757d',
                            border: '1px solid #ced4da',
                            borderRadius: 0,
                            fontSize: '0.72rem',
                          }}
                        >
                          ARTICLE
                        </span>
                      )}
                    </td>
                    <td className="text-muted font-sans" style={{ fontSize: '0.84rem' }}>
                      {t.authorName || 'James Thew'}
                    </td>
                    <td>
                      <span
                        className="badge font-monospace px-2 py-1"
                        style={{
                          backgroundColor: t.isFree ? '#1b4d3e' : '#8a6d3b',
                          color: '#ffffff',
                          borderRadius: 0,
                          fontSize: '0.72rem',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t.isFree ? 'FREE ACCESS' : 'MEMBERS ONLY'}
                      </span>
                    </td>
                    <td className="small text-muted font-monospace">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2 text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary font-monospace"
                          style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.05em' }}
                          title="Preview Cooking Tip Content"
                          onClick={() => setSelectedTipForModal(t)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm text-nowrap font-monospace ${t.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          title={t.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                          onClick={() => onToggleTipFree(t)}
                          style={{ minWidth: '115px', borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.05em' }}
                        >
                          {t.isFree ? 'Set Member-only' : 'Set Free'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger text-nowrap font-monospace"
                          title="Delete Tip"
                          onClick={() => onDeleteTip(t.tipId, t.title)}
                          style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.05em' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {renderManagementPagination('tips', 'Cooking tips')}

      {/* ── MODAL: TIP DOSSIER PREVIEW ── */}
      {selectedTipForModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tip-modal-title"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" ref={tipModalRef}>
            <div className="modal-content border-0" style={{ borderRadius: 0, backgroundColor: '#ffffff' }}>
              <div
                className="modal-header py-3 px-4"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  borderBottom: '1px solid var(--dp-color-accent)',
                }}
              >
                <div>
                  <span
                    className="small font-monospace text-uppercase"
                    style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.12em', fontSize: '0.75rem' }}
                  >
                    Culinary Tip Dossier #{selectedTipForModal.tipId}
                  </span>
                  <h5 id="tip-modal-title" className="brand-font mb-0 text-white mt-1">
                    {selectedTipForModal.title}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close modal"
                  onClick={() => setSelectedTipForModal(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Meta details bar */}
                <div
                  className="d-flex flex-wrap align-items-center justify-content-between p-3 mb-3 border font-monospace small"
                  style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span>
                      Author: <strong className="text-dark">{selectedTipForModal.authorName || 'James Thew'}</strong>
                    </span>
                    <span>&middot;</span>
                    <span>
                      Date: <strong className="text-dark">{new Date(selectedTipForModal.createdAt).toLocaleDateString()}</strong>
                    </span>
                  </div>
                  <div>
                    <span
                      className="badge font-monospace"
                      style={{
                        backgroundColor: selectedTipForModal.isFree ? '#1b4d3e' : '#8a6d3b',
                        color: '#ffffff',
                        borderRadius: 0,
                      }}
                    >
                      {selectedTipForModal.isFree ? 'FREE ACCESS' : 'MEMBERS ONLY'}
                    </span>
                  </div>
                </div>

                {/* Video embed if present */}
                {selectedTipForModal.videoUrl && (
                  <div className="mb-4 p-3 border" style={{ backgroundColor: '#000000', borderColor: 'var(--dp-color-accent)' }}>
                    <div className="small font-monospace text-white-50 mb-2">Instructional Video Guide:</div>
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={selectedTipForModal.videoUrl}
                        title={selectedTipForModal.title}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Full Tip Content */}
                <div>
                  <h6 className="fw-bold font-monospace small text-uppercase text-muted mb-2">
                    Culinary Instructions & Guidance
                  </h6>
                  <div
                    className="p-3 border"
                    style={{
                      backgroundColor: 'var(--dp-color-ground-2)',
                      borderColor: 'var(--dp-color-rule)',
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.75',
                      whiteSpace: 'pre-line',
                      fontSize: '0.95rem',
                      color: 'var(--dp-color-ink)',
                    }}
                  >
                    {selectedTipForModal.content || 'No detailed instructions provided.'}
                  </div>
                </div>
              </div>

              <div
                className="modal-footer py-2 px-4 border-top"
                style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark font-monospace"
                  style={{ borderRadius: 0 }}
                  onClick={() => setSelectedTipForModal(null)}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
