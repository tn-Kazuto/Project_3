import { useState, useEffect } from 'react';
import { announcementApi } from '../../../services/api';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await announcementApi.getAll();
        if (!isMounted) return;
        if (res.data && res.data.success) {
          setAnnouncements(res.data.data || []);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Unable to load announcements at this moment. Please check back later.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  return { announcements, loading, error };
};
