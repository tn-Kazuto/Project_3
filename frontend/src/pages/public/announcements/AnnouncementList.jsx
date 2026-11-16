import React from 'react';
import { CulinarySkeleton } from '../../../components/common/CulinarySkeleton';
import { AnnouncementCard } from './AnnouncementCard';

export const AnnouncementList = ({ announcements = [], loading = false, error = '' }) => {
  if (error) {
    return (
      <div className="alert alert-danger mb-4" style={{ borderRadius: 0 }}>
        <span>{error}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-4">
        <CulinarySkeleton count={2} />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div
        className="p-5 text-center mb-4"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-rule)',
        }}
      >
        <h4 className="brand-font mb-2">No Announcements Published Yet</h4>
        <p className="text-muted mb-0">
          Contest results and official winner declarations by Chef James Thew will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.announcementId} announcement={announcement} />
      ))}
    </div>
  );
};
