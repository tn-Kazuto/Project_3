import React from 'react';

const TAB_STYLE = (active) => ({
  backgroundColor: active ? 'var(--dp-color-field)' : 'transparent',
  color: active ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
  border: active ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
  borderRadius: 0,
  letterSpacing: '0.12em',
});

export const AdminDashboardNav = ({
  activeTab,
  totalCounts,
  onTabChange,
}) => {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'recipes', label: `Recipes (${totalCounts.recipes})` },
    { key: 'tips', label: `Cooking Tips (${totalCounts.tips})` },
    { key: 'contests', label: `Contests (${totalCounts.contests})` },
    { key: 'announcements', label: `Announcements (${totalCounts.announcements})` },
    { key: 'feedback', label: `Feedbacks (${totalCounts.feedback})` },
  ];

  return (
    <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3" style={{ borderColor: 'var(--dp-color-rule)' }}>
      {tabs.map(({ key, label }) => (
        <li key={key} className="nav-item">
          <button
            className={`nav-link ${activeTab === key ? 'active' : ''}`}
            style={TAB_STYLE(activeTab === key)}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
};
