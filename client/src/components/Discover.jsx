import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed, postSwipe, resetDemo } from '../api.js';
import SwipeCard from './SwipeCard.jsx';
import MatchOverlay from './MatchOverlay.jsx';
import Matches from './Matches.jsx';

export default function Discover() {
  const [queue, setQueue] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState('swipe'); // 'swipe' | 'matches'
  const [match, setMatch] = useState(null);
  const [toast, setToast] = useState('');
  const topRef = useRef(null);

  const load = useCallback(() => {
    setLoadError(false);
    setQueue(null);
    getFeed().then(setQueue).catch(() => setLoadError(true));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Called by the card once its fly-out animation has finished.
  const handleSwiped = useCallback(async (direction, profile) => {
    setQueue((q) => q.filter((p) => p.id !== profile.id));
    try {
      const result = await postSwipe(profile.id, direction);
      if (result.matched) setMatch(result.match ?? profile);
    } catch (err) {
      if (err.status === 409) return; // already recorded; stays removed
      setQueue((q) => [profile, ...q.filter((p) => p.id !== profile.id)]);
      setToast('Couldn’t save that swipe. Try again.');
    }
  }, []);

  const swipe = (dir) => topRef.current?.swipe(dir);

  // Arrow keys for desktop.
  useEffect(() => {
    const onKey = (e) => {
      if (view !== 'swipe' || match) return;
      if (e.key === 'ArrowRight') swipe('like');
      if (e.key === 'ArrowLeft') swipe('pass');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, match]);

  const restart = async () => {
    try {
      await resetDemo();
      load();
    } catch {
      setToast('Couldn’t reset the demo data.');
    }
  };

  const top = queue?.[0];
  const next = queue?.[1];

  return (
    <div className="discover">
      <header className="discover-head">
        <h1 className="wordmark">coy</h1>
        <div className="seg" role="tablist" aria-label="Discover sections">
          <button role="tab" aria-selected={view === 'swipe'} onClick={() => setView('swipe')}>
            Swipe
          </button>
          <button role="tab" aria-selected={view === 'matches'} onClick={() => setView('matches')}>
            Matches
          </button>
        </div>
      </header>

      {view === 'matches' ? (
        <Matches />
      ) : (
        <>
          <div className="stage">
            {loadError && (
              <div className="empty">
                <h2>Couldn’t load profiles</h2>
                <p>Make sure the API is running on port 3001, then try again.</p>
                <button className="btn btn-solid" onClick={load}>Try again</button>
              </div>
            )}
            {!loadError && queue === null && <p className="note">Loading profiles…</p>}

            {queue && queue.length === 0 && (
              <div className="empty">
                <h2>You’ve seen everyone for now</h2>
                <p>Check Matches to see who liked you back. New profiles show up here when they join.</p>
                <button className="btn btn-ghost" onClick={() => setView('matches')}>View matches</button>
                <button className="btn-link" onClick={restart}>Reset demo data</button>
              </div>
            )}

            {next && <SwipeCard key={next.id} profile={next} interactive={false} onSwiped={() => {}} />}
            {top && <SwipeCard key={top.id} ref={topRef} profile={top} onSwiped={handleSwiped} />}
          </div>

          <div className="actions">
            <button className="round round-pass" onClick={() => swipe('pass')} disabled={!top} aria-label="Pass">
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
            <button className="round round-like" onClick={() => swipe('like')} disabled={!top} aria-label="Like">
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                <path d="M12 21s-7-4.6-9.3-9.3C1.2 8.4 3 5 6.4 5c2 0 3.5 1.1 4.3 2.4h.6C12.1 6.1 13.6 5 15.6 5 19 5 20.8 8.4 19.3 11.7 17 16.4 12 21 12 21z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </>
      )}

      {match && (
        <MatchOverlay
          profile={match}
          onKeepSwiping={() => setMatch(null)}
          onViewMatches={() => {
            setMatch(null);
            setView('matches');
          }}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
