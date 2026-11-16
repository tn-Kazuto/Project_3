import React from 'react';

export const AdminNavTabs = ({
  activeTab,
  setActiveTab,
  setSelectedContestForEntries,
  recipesCount = 0,
  tipsCount = 0,
  contestsCount = 0,
  announcementsCount = 0,
  feedbacksCount = 0,
}) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (setSelectedContestForEntries) setSelectedContestForEntries(null);
  };

  const getTabStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? 'var(--dp-color-field)' : 'transparent',
    color: activeTab === tabName ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
    border: activeTab === tabName ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
    borderRadius: 0,
    letterSpacing: '0.12em',
  });

  return (
    <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3" style={{ borderColor: 'var(--dp-color-rule)' }}>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
          style={getTabStyle('overview')}
          onClick={() => handleTabClick('overview')}
        >
          Overview
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
          style={getTabStyle('recipes')}
          onClick={() => handleTabClick('recipes')}
        >
          Recipes ({recipesCount})
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'tips' ? 'active' : ''}`}
          style={getTabStyle('tips')}
          onClick={() => handleTabClick('tips')}
        >
          Cooking Tips ({tipsCount})
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'contests' ? 'active' : ''}`}
          style={getTabStyle('contests')}
          onClick={() => handleTabClick('contests')}
        >
          Contests ({contestsCount})
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`}
          style={getTabStyle('announcements')}
          onClick={() => handleTabClick('announcements')}
        >
          Announcements ({announcementsCount})
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
          style={getTabStyle('feedback')}
          onClick={() => handleTabClick('feedback')}
        >
          Feedbacks ({feedbacksCount})
        </button>
      </li>
    </ul>
  );
};
