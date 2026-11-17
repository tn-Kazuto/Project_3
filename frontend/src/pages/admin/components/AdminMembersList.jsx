import React from 'react';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const getSubscriptionStatus = (account) => {
  if (account.role !== 'MEMBER') return 'Not applicable';
  return account.isSubscriptionActive ? 'Active' : 'Expired';
};

const MemberDetails = ({ account }) => (
  <>
    <span className="badge bg-light text-dark border">{account.role || 'Unknown role'}</span>
    <dl className="row small mb-0 mt-3">
      <dt className="col-5 text-muted">Plan</dt>
      <dd className="col-7">{account.subscriptionPlan || '—'}</dd>
      <dt className="col-5 text-muted">Status</dt>
      <dd className="col-7">{getSubscriptionStatus(account)}</dd>
      <dt className="col-5 text-muted">Registered</dt>
      <dd className="col-7">{formatDate(account.createdAt)}</dd>
      <dt className="col-5 text-muted">Expires</dt>
      <dd className="col-7">{formatDate(account.subscriptionEnd)}</dd>
    </dl>
  </>
);

export const AdminMembersList = ({ accounts, page, pageSize, totalCount, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <div className="d-none d-lg-block table-responsive border" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <table className="table align-middle mb-0">
          <caption className="visually-hidden">Registered accounts and subscription status</caption>
          <thead>
            <tr><th scope="col">Account</th><th scope="col">Role</th><th scope="col">Plan</th><th scope="col">Status</th><th scope="col">Registered</th><th scope="col">Expires</th></tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.userId}>
                <td><strong>{account.fullName || account.username}</strong><br /><span className="small text-muted">{account.email}</span></td>
                <td>{account.role}</td><td>{account.subscriptionPlan || '—'}</td><td>{getSubscriptionStatus(account)}</td>
                <td>{formatDate(account.createdAt)}</td><td>{formatDate(account.subscriptionEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-grid gap-3 d-lg-none">
        {accounts.map((account) => (
          <article key={account.userId} className="p-3 border bg-white">
            <h3 className="brand-font h5 mb-1">{account.fullName || account.username}</h3>
            <p className="small text-muted text-break mb-3">{account.email}</p>
            <MemberDetails account={account} />
          </article>
        ))}
      </div>
      <nav className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4" aria-label="Member list pagination">
        <p className="small text-muted mb-0" aria-live="polite">
          Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)} of {totalCount} accounts
        </p>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>Previous</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</button>
        </div>
      </nav>
    </>
  );
};
