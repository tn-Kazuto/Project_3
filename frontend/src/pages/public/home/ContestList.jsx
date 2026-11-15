import React from 'react';
import { Link } from 'react-router-dom';
import { formatHomeDate } from './homeData';

export const ContestList = ({ data, onRetry }) => (
  <div className="home-feed" aria-busy={data.status === 'loading'}>
    <div className="home-feed__heading">
      <h3>Open contests</h3>
      <Link className="home-inline-link home-inline-link--light" to="/contests">See all contests</Link>
    </div>
    {data.status === 'loading' && <p className="home-state home-state--dark" role="status">Loading open contests</p>}
    {data.status === 'error' && (
      <div className="home-state home-state--dark" role="alert">
        <p>Open contests could not load. Try again.</p>
        <button className="home-inline-button home-inline-button--light" type="button" onClick={onRetry}>Retry contests</button>
      </div>
    )}
    {data.status === 'empty' && <p className="home-state home-state--dark">There are no open contests right now.</p>}
    {data.status === 'success' && (
      <ol className="home-contest-list">
        {data.items.map((contest) => {
          const deadline = formatHomeDate(contest.endDate);
          return (
            <li key={contest.contestId}>
              <div className="home-contest-list__body">
                <p className="home-contest-list__type">{contest.contestType || 'Culinary'} contest</p>
                <h4>{contest.title}</h4>
                {contest.description && <p>{contest.description}</p>}
              </div>
              <div className="home-contest-list__action">
                {deadline && <time dateTime={contest.endDate}>Closes {deadline}</time>}
                <Link to={'/contests/' + contest.contestId}>Submit an entry</Link>
              </div>
            </li>
          );
        })}
      </ol>
    )}
  </div>
);
