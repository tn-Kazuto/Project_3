import React from 'react';
import { Link } from 'react-router-dom';
import { formatHomeDate } from './homeData';

export const AnnouncementList = ({ data, onRetry }) => (
  <div className="home-feed" aria-busy={data.status === 'loading'}>
    <div className="home-feed__heading">
      <h3>Contest Winner Announcements</h3>
      <Link className="home-inline-link home-inline-link--light" to="/announcements">See all announcements</Link>
    </div>
    {data.status === 'loading' && <p className="home-state home-state--dark" role="status">Loading winner announcements</p>}
    {data.status === 'error' && (
      <div className="home-state home-state--dark" role="alert">
        <p>Winner announcements could not load. Try again.</p>
        <button className="home-inline-button home-inline-button--light" type="button" onClick={onRetry}>Retry announcements</button>
      </div>
    )}
    {data.status === 'empty' && <p className="home-state home-state--dark">No contest winners have been announced yet.</p>}
    {data.status === 'success' && (
      <ol className="home-announcement-list">
        {data.items.map((announcement) => {
          const published = formatHomeDate(announcement.publishedAt);
          return (
            <li key={announcement.announcementId}>
              <h4>{announcement.title}</h4>
              <p>{announcement.content}</p>
              {published && <time dateTime={announcement.publishedAt}>Published {published}</time>}
            </li>
          );
        })}
      </ol>
    )}
  </div>
);
