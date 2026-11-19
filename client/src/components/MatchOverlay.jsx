import { useEffect, useRef } from 'react';

export default function MatchOverlay({ profile, onKeepSwiping, onViewMatches }) {
  const btn = useRef(null);
  useEffect(() => {
    btn.current?.focus();
  }, []);

  return (
    <div className="match" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <h2 id="match-title">It’s a match!</h2>
      <p className="match-sub">You and {profile.name} liked each other.</p>

      <div className="match-photos" aria-hidden="true">
        <div className="match-me">You</div>
        <img src={profile.photo} alt="" draggable={false} />
      </div>

      <div className="match-actions">
        <button ref={btn} className="btn btn-solid" onClick={onKeepSwiping}>
          Keep swiping
        </button>
        <button className="btn btn-ghost" onClick={onViewMatches}>
          View matches
        </button>
      </div>
    </div>
  );
}
