import React, { useEffect, useState } from 'react';
import { adminUsersApi } from '../../../services/api';
import { AdminMembersList } from './AdminMembersList';

const PAGE_SIZE = 10;

export const AdminMembersPanel = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    const loadAccounts = async () => {
      setLoadState('loading');
      setErrorMessage('');
      try {
        const response = await adminUsersApi.getPaged({
          page,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          role: role || undefined,
          subscriptionStatus: subscriptionStatus || undefined,
        }, controller.signal);
        const result = response.data?.data;
        if (!response.data?.success || !Array.isArray(result?.items)) {
          throw new Error('The account service returned an unsupported response.');
        }
        if (!isCurrent) return;
        setAccounts(result.items);
        setTotalCount(Number(result.totalCount) || 0);
        setPage(Number(result.pageIndex) || page);
        setLoadState('success');
      } catch (error) {
        if (!isCurrent || error?.code === 'ERR_CANCELED') return;
        setErrorMessage(error?.response?.status === 404
          ? 'The member list API is not available yet. The account service must provide the admin list endpoint.'
          : 'Could not load registered accounts. Check the connection and try again.');
        setLoadState('error');
      }
    };

    loadAccounts();
    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [page, role, search, subscriptionStatus, retryKey]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  return (
    <section className="admin-members-panel" aria-labelledby="admin-members-title">
      <header className="mb-4">
        <h2 id="admin-members-title" className="brand-font h3 mb-1">Registered Accounts</h2>
      </header>

      <form className="row g-3 align-items-end mb-4" onSubmit={handleSearch}>
        <div className="col-12 col-lg-5">
          <label className="form-label small fw-semibold" htmlFor="member-search">Search accounts</label>
          <input
            id="member-search"
            type="search"
            className="form-control"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Name or email"
          />
        </div>
        <div className="col-6 col-lg-3">
          <label className="form-label small fw-semibold" htmlFor="member-role-filter">Role</label>
          <select id="member-role-filter" className="form-select" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>
            <option value="">All roles</option>
            <option value="MEMBER">Member</option>
            <option value="CHEF">Chef</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="col-6 col-lg-2">
          <label className="form-label small fw-semibold" htmlFor="member-status-filter">Subscription</label>
          <select id="member-status-filter" className="form-select" value={subscriptionStatus} onChange={(event) => { setSubscriptionStatus(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <div className="col-12 col-lg-2">
          <button type="submit" className="btn btn-primary w-100">Search</button>
        </div>
      </form>

      {loadState === 'loading' && <div className="py-5 text-center" role="status">Loading registered accounts…</div>}
      {loadState === 'error' && (
        <div className="alert alert-warning d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3" role="alert">
          <span>{errorMessage}</span>
          <button type="button" className="btn btn-outline-secondary" onClick={() => setRetryKey((value) => value + 1)}>Try again</button>
        </div>
      )}
      {loadState === 'success' && accounts.length === 0 && (
        <div className="p-4 border text-center" style={{ borderColor: 'var(--dp-color-rule)' }}>
          <h3 className="brand-font h4">No accounts match these filters</h3>
          <p className="small text-muted mb-0">Clear a filter or search for another name or email.</p>
        </div>
      )}
      {loadState === 'success' && accounts.length > 0 && (
        <AdminMembersList accounts={accounts} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
      )}
    </section>
  );
};
