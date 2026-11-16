import React from 'react';
import {
  AnnouncementHeroBanner,
  AnnouncementSpotlightBar,
  AnnouncementList,
  useAnnouncements,
} from './announcements';

export const AnnouncementsPage = () => {
  const { announcements, loading, error } = useAnnouncements();
  const honoreesCount = announcements.filter((a) => a.winnerName).length;

  return (
    <div className="container py-5 luxury-announcements">
      {/* 1. Header Hero Banner */}
      <AnnouncementHeroBanner />

      {/* 2. Hall of Fame Spotlight Bar */}
      <AnnouncementSpotlightBar honoreesCount={honoreesCount} />

      {/* 3. Announcements List & States (Loading, Error, Empty, Success) */}
      <AnnouncementList announcements={announcements} loading={loading} error={error} />
    </div>
  );
};

export default AnnouncementsPage;
