import React from 'react';

export const AdminContestsTab = ({
  contests = [],
  selectedContestForEntries,
  setSelectedContestForEntries,
  contestEntries = [],
  loadingEntries = false,
  setShowContestModal,
  handleViewEntries,
  handleDeleteContest,
  handleSelectWinner,
}) => {
  if (selectedContestForEntries) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => setSelectedContestForEntries(null)}
            >
              ← Back to Contests
            </button>
            <strong className="h5 mb-0 align-middle">Submissions for: {selectedContestForEntries.title}</strong>
          </div>
          <span className="badge bg-primary fs-6">{contestEntries.length} Submissions</span>
        </div>
        <div className="card-body p-0">
          {loadingEntries ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading entries...</p>
            </div>
          ) : contestEntries.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No entries submitted yet for this contest.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Submission Title</th>
                    <th>Submitter</th>
                    <th>Type</th>
                    <th>Community Votes</th>
                    <th>Details / Content</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contestEntries.map((e) => (
                    <tr key={e.entryId} className={e.isWinner ? 'table-warning' : ''}>
                      <td className="fw-bold">{e.title}</td>
                      <td>
                        <div>{e.submitterName}</div>
                        <small className="text-muted">{e.submitterEmail}</small>
                      </td>
                      <td>
                        <span className={`badge ${e.isGuest ? 'bg-secondary' : 'bg-primary'}`}>
                          {e.isGuest ? 'Guest' : 'Member'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          {e.voteCount || 0} votes
                        </span>
                        {contestEntries.length > 0 &&
                          e.voteCount > 0 &&
                          e.voteCount === Math.max(...contestEntries.map((x) => x.voteCount)) && (
                            <span className="badge bg-warning text-dark ms-1 small font-monospace">Top Voted</span>
                          )}
                      </td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: '280px' }}>
                          {e.contestType === 'RECIPE' ? `${e.ingredients || ''}` : `${e.tipContent || ''}`}
                        </div>
                      </td>
                      <td>
                        {e.isWinner ? (
                          <span className="badge bg-warning text-dark fw-bold">Winner</span>
                        ) : (
                          <span className="badge bg-light text-muted border">Participant</span>
                        )}
                      </td>
                      <td className="text-end">
                        {!e.isWinner && (
                          <button
                            className="btn btn-sm btn-warning text-dark fw-semibold"
                            onClick={() => handleSelectWinner(e)}
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
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Culinary Contests Management</h5>
        <button
          className="btn btn-warning text-dark fw-semibold btn-sm d-flex align-items-center gap-1"
          onClick={() => setShowContestModal(true)}
        >
          + Create Contest
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Contest Type</th>
              <th>Duration</th>
              <th>Entries</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contests.map((c) => (
              <tr key={c.contestId}>
                <td className="fw-bold text-dark">{c.title}</td>
                <td>
                  <span className={`badge ${c.contestType === 'RECIPE' ? 'bg-primary' : 'bg-info text-dark'}`}>
                    {c.contestType}
                  </span>
                </td>
                <td className="small text-muted">
                  {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                </td>
                <td>
                  <span className="badge bg-light text-dark border">{c.entryCount || 0}</span>
                </td>
                <td>
                  <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {c.isActive ? 'Active' : 'Closed'}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleViewEntries(c)}>
                    View Entries
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Contest"
                    onClick={() => handleDeleteContest(c.contestId, c.title)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
