import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global ScrollToTop Component
 * Ensures that whenever the route, path, search or hash changes,
 * the window and viewport are instantly reset to the top.
 * Also configures history.scrollRestoration = 'manual' to prevent
 * browsers from holding onto stale scroll offsets during reloads.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration on reload
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetViewportToTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch {
        window.scrollTo(0, 0);
      }
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // 1. Immediate scroll
    resetViewportToTop();

    // 2. Next animation frame (after React commits initial DOM tree)
    const rafId = requestAnimationFrame(resetViewportToTop);

    // 3. Staggered timers to beat any asynchronous layout shifts or images
    const t1 = setTimeout(resetViewportToTop, 10);
    const t2 = setTimeout(resetViewportToTop, 50);
    const t3 = setTimeout(resetViewportToTop, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
