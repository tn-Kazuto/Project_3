import React, { useState, useEffect, useCallback } from 'react';
import { adminUsersApi } from '../../../services/api';

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export const AdminRevenueMetrics = () => {
  const [stats, setStats] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');

  const fetchRevenueStats = useCallback(async (signal) => {
    setLoadState('loading');
    setErrorMessage('');
    try {
      const response = await adminUsersApi.getRevenueStats(signal);
      const data = response?.data?.data;
      if (!response?.data?.success || !data) {
        throw new Error(response?.data?.message || 'Invalid revenue response received.');
      }

      setStats(data);
      if (data.totalTransactions === 0 && (!data.recentTransactions || data.recentTransactions.length === 0)) {
        setLoadState('empty');
      } else {
        setLoadState('success');
      }
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') return;
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load subscription revenue analytics. Check backend connectivity and retry.'
      );
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchRevenueStats(controller.signal);
    return () => controller.abort();
  }, [fetchRevenueStats]);

  // Derived calculations for visual distributions
  const totalRev = Number(stats?.totalRevenue) || 0;
  const monthlyRev = Number(stats?.monthlyRevenue) || 0;
  const yearlyRev = Number(stats?.yearlyRevenue) || 0;
  const monthlyPct = totalRev > 0 ? Math.round((monthlyRev / totalRev) * 100) : 0;
  const yearlyPct = totalRev > 0 ? 100 - monthlyPct : 0;

  const totalMembers = Number(stats?.totalMembersCount) || 0;
  const activeSubs = Number(stats?.activeSubscribersCount) || 0;
  const conversionRate = totalMembers > 0 ? Math.round((activeSubs / totalMembers) * 100) : 0;

  const filteredTransactions = (stats?.recentTransactions || []).filter((tx) => {
    const matchesPlan =
      planFilter === 'ALL' ||
      (planFilter === 'MONTHLY' && tx.planType === 'MONTHLY') ||
      (planFilter === 'YEARLY' && (tx.planType === 'YEARLY' || tx.planType === 'ANNUAL'));

    const searchLower = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      tx.fullName?.toLowerCase().includes(searchLower) ||
      tx.userName?.toLowerCase().includes(searchLower) ||
      tx.email?.toLowerCase().includes(searchLower) ||
      String(tx.paymentId).includes(searchLower);

    return matchesPlan && matchesSearch;
  });

  return (
    <section className="col-12 mt-4" aria-labelledby="revenue-section-title">
      <div
        className="p-4"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-panel-line)',
        }}
      >
        {/* Header Bar */}
        <div
          className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom"
          style={{ borderColor: 'var(--dp-color-panel-line)' }}
        >
          <div>
            <div
              className="roman-numeral mb-1"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'var(--dp-color-accent)',
              }}
            >
              V. EXECUTIVE TREASURY & SUBSCRIBER REVENUE
            </div>
            <h4 id="revenue-section-title" className="brand-font mb-1 text-dark">
              Membership Revenue & Subscription Analytics
            </h4>
            <p className="small text-muted mb-0 font-monospace">
              Subscription transactions and revenue breakdown.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <span
              className="badge font-monospace px-2 py-1"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                color: 'var(--dp-color-accent)',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
                fontSize: '0.75rem',
              }}
            >
              Live Treasury Feed
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-dark font-monospace"
              style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.08em' }}
              onClick={() => fetchRevenueStats()}
              disabled={loadState === 'loading'}
              aria-label="Refresh revenue data"
            >
              {loadState === 'loading' ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {/* 1. Loading State */}
        {loadState === 'loading' && (
          <div className="py-4" aria-live="polite" aria-busy="true">
            <div className="row g-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-sm-6 col-xl-3">
                  <div
                    className="p-3 placeholder-glow border"
                    style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-panel-line)' }}
                  >
                    <span className="placeholder col-6 mb-2"></span>
                    <span className="placeholder col-9 display-6 mb-2 d-block"></span>
                    <span className="placeholder col-8 small"></span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center py-3 text-muted font-monospace small">
              Auditing subscription revenue records from ledger...
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {loadState === 'error' && (
          <div
            className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center p-3 mb-0"
            role="alert"
            style={{ borderRadius: 0 }}
          >
            <div>
              <strong>Treasury Ledger Error:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger font-monospace mt-2 mt-sm-0"
              style={{ borderRadius: 0 }}
              onClick={() => fetchRevenueStats()}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {loadState === 'empty' && (
          <div
            className="text-center py-5 border"
            style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-panel-line)' }}
          >
            <div className="display-6 mb-2" style={{ color: 'var(--dp-color-accent)' }}>
              $0.00
            </div>
            <h5 className="brand-font text-dark mb-2">No Membership Purchases Recorded</h5>
            <p className="small text-muted font-monospace mb-3 max-w-md mx-auto">
              Completed member subscription purchases and receipts will appear here.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-dark font-monospace"
              style={{ borderRadius: 0 }}
              onClick={() => fetchRevenueStats()}
            >
              Re-check Transactions
            </button>
          </div>
        )}

        {/* 4. Success State */}
        {loadState === 'success' && stats && (
          <>
            {/* KPI Cards Row */}
            <div className="row g-3 mb-4">
              {/* Gross Revenue (Featured Charcoal) */}
              <div className="col-sm-6 col-xl-3">
                <div
                  className="p-3 h-100"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    border: '1px solid var(--dp-color-accent)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="text-uppercase small fw-semibold font-monospace"
                      style={{ letterSpacing: '0.12em', color: 'var(--dp-color-accent)', fontSize: '0.72rem' }}
                    >
                      Total Gross Revenue
                    </span>
                    <span className="font-monospace small" style={{ color: 'var(--dp-color-accent)' }}>
                      USD
                    </span>
                  </div>
                  <div className="brand-font display-6 fw-bold mb-1" style={{ color: 'var(--dp-color-accent)' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="small font-monospace text-muted" style={{ fontSize: '0.75rem', color: '#b8b2a7' }}>
                    <span className="text-white fw-semibold">{stats.totalTransactions}</span> Completed Purchases
                  </div>
                </div>
              </div>

              {/* Monthly Subscription Revenue */}
              <div className="col-sm-6 col-xl-3">
                <div
                  className="p-3 h-100"
                  style={{
                    backgroundColor: 'var(--dp-color-ground-2)',
                    border: '1px solid var(--dp-color-panel-line)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="text-uppercase small fw-semibold font-monospace text-muted"
                      style={{ letterSpacing: '0.12em', fontSize: '0.72rem' }}
                    >
                      Monthly Passes ($10/mo)
                    </span>
                    <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.65rem' }}>
                      {monthlyPct}% Share
                    </span>
                  </div>
                  <div className="brand-font display-6 fw-bold mb-1 text-dark">
                    {formatCurrency(stats.monthlyRevenue)}
                  </div>
                  <div className="small font-monospace text-muted" style={{ fontSize: '0.75rem' }}>
                    <span className="fw-semibold text-dark">{stats.monthlyTransactionsCount}</span> transactions &middot;{' '}
                    <span>{stats.monthlyPlanPrice ? formatCurrency(stats.monthlyPlanPrice) : '$10.00'}/mo</span>
                  </div>
                </div>
              </div>

              {/* Annual VIP Pass Revenue */}
              <div className="col-sm-6 col-xl-3">
                <div
                  className="p-3 h-100"
                  style={{
                    backgroundColor: 'var(--dp-color-ground-2)',
                    border: '1px solid var(--dp-color-panel-line)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="text-uppercase small fw-semibold font-monospace text-muted"
                      style={{ letterSpacing: '0.12em', fontSize: '0.72rem' }}
                    >
                      Annual VIP Passes ($100/yr)
                    </span>
                    <span
                      className="badge font-monospace"
                      style={{
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--dp-color-accent)',
                        color: '#1b1816',
                      }}
                    >
                      {yearlyPct}% Share
                    </span>
                  </div>
                  <div className="brand-font display-6 fw-bold mb-1 text-dark">
                    {formatCurrency(stats.yearlyRevenue)}
                  </div>
                  <div className="small font-monospace text-muted" style={{ fontSize: '0.75rem' }}>
                    <span className="fw-semibold text-dark">{stats.yearlyTransactionsCount}</span> transactions &middot;{' '}
                    <span>{stats.yearlyPlanPrice ? formatCurrency(stats.yearlyPlanPrice) : '$100.00'}/yr</span>
                  </div>
                </div>
              </div>

              {/* Active Paid Subscribers */}
              <div className="col-sm-6 col-xl-3">
                <div
                  className="p-3 h-100"
                  style={{
                    backgroundColor: 'var(--dp-color-ground-2)',
                    border: '1px solid var(--dp-color-panel-line)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="text-uppercase small fw-semibold font-monospace text-muted"
                      style={{ letterSpacing: '0.12em', fontSize: '0.72rem' }}
                    >
                      Active Paid Members
                    </span>
                    <span className="badge bg-success font-monospace" style={{ fontSize: '0.65rem' }}>
                      VIP Access
                    </span>
                  </div>
                  <div className="brand-font display-6 fw-bold mb-1 text-success">
                    {stats.activeSubscribersCount}
                  </div>
                  <div className="small font-monospace text-muted" style={{ fontSize: '0.75rem' }}>
                    <span className="fw-semibold text-dark">{conversionRate}%</span> conversion rate &middot;{' '}
                    <span>{stats.totalMembersCount} total members</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Distribution Progress Bar */}
            <div
              className="p-3 mb-4 border"
              style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-panel-line)' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold font-monospace text-uppercase" style={{ letterSpacing: '0.08em' }}>
                  Subscription Tier Distribution
                </span>
                <span className="small font-monospace text-muted">
                  Annual VIP: <strong>{yearlyPct}%</strong> ({formatCurrency(stats.yearlyRevenue)}) &middot; Monthly: <strong>{monthlyPct}%</strong> ({formatCurrency(stats.monthlyRevenue)})
                </span>
              </div>
              <div
                className="progress"
                style={{ height: '8px', borderRadius: 0, backgroundColor: '#e2ddd3' }}
                role="progressbar"
                aria-label="Subscription revenue distribution"
                aria-valuenow={yearlyPct}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${yearlyPct}%`,
                    backgroundColor: 'var(--dp-color-accent)',
                  }}
                  title={`Annual VIP: ${yearlyPct}%`}
                ></div>
                <div
                  className="progress-bar"
                  style={{
                    width: `${monthlyPct}%`,
                    backgroundColor: '#1b1816',
                  }}
                  title={`Monthly Pass: ${monthlyPct}%`}
                ></div>
              </div>
            </div>

            {/* Recent Transactions Audit Table */}
            <div className="mt-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <h5 className="brand-font mb-0 text-dark">Recent Membership Transactions</h5>
                <div className="d-flex gap-2 mt-2 mt-sm-0">
                  <select
                    className="form-select form-select-sm font-monospace"
                    style={{ width: 'auto', borderRadius: 0, fontSize: '0.78rem' }}
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    aria-label="Filter transactions by plan"
                  >
                    <option value="ALL">All Plans</option>
                    <option value="MONTHLY">Monthly ($10)</option>
                    <option value="YEARLY">Annual ($100)</option>
                  </select>
                  <input
                    type="search"
                    className="form-control form-control-sm font-monospace"
                    placeholder="Search subscriber..."
                    style={{ width: '180px', borderRadius: 0, fontSize: '0.78rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search transactions"
                  />
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div
                  className="text-center py-4 border text-muted font-monospace small"
                  style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-panel-line)' }}
                >
                  No transactions match the selected criteria.
                </div>
              ) : (
                <div className="table-responsive border" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                  <table className="table table-hover align-middle mb-0 font-monospace" style={{ fontSize: '0.82rem' }}>
                    <thead style={{ backgroundColor: 'var(--dp-color-ground-2)' }}>
                      <tr>
                        <th scope="col" style={{ letterSpacing: '0.08em' }}>TRANSACTION</th>
                        <th scope="col" style={{ letterSpacing: '0.08em' }}>SUBSCRIBER</th>
                        <th scope="col" style={{ letterSpacing: '0.08em' }}>PLAN TIER</th>
                        <th scope="col" style={{ letterSpacing: '0.08em' }}>AMOUNT</th>
                        <th scope="col" style={{ letterSpacing: '0.08em' }}>DATE</th>
                        <th scope="col" style={{ letterSpacing: '0.08em' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => {
                        const isYearly = tx.planType === 'YEARLY' || tx.planType === 'ANNUAL';
                        return (
                          <tr key={tx.paymentId}>
                            <td>
                              <span className="fw-semibold text-dark">#PAY-{String(tx.paymentId).padStart(5, '0')}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    backgroundColor: isYearly ? 'var(--dp-color-accent)' : '#495057',
                                    fontSize: '0.75rem',
                                    flexShrink: 0,
                                  }}
                                  aria-hidden="true"
                                >
                                  {(tx.fullName || tx.userName || 'M').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-semibold text-dark">{tx.fullName || tx.userName}</div>
                                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{tx.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {isYearly ? (
                                <span
                                  className="badge font-monospace px-2 py-1"
                                  style={{
                                    backgroundColor: 'rgba(197, 155, 39, 0.15)',
                                    color: '#8c6b12',
                                    border: '1px solid var(--dp-color-accent)',
                                    borderRadius: 0,
                                  }}
                                >
                                  ★ ANNUAL VIP ($100)
                                </span>
                              ) : (
                                <span
                                  className="badge font-monospace px-2 py-1"
                                  style={{
                                    backgroundColor: 'rgba(27, 24, 22, 0.08)',
                                    color: '#1b1816',
                                    border: '1px solid #ced4da',
                                    borderRadius: 0,
                                  }}
                                >
                                  MONTHLY PASS ($10)
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="fw-bold text-dark">{formatCurrency(tx.amount)}</span>
                            </td>
                            <td className="text-muted">
                              {formatDate(tx.paymentDate)}
                            </td>
                            <td>
                              <span
                                className="badge bg-success font-monospace px-2 py-1"
                                style={{ borderRadius: 0, fontSize: '0.7rem' }}
                              >
                                {tx.status || 'COMPLETED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
