import { useEffect, useState } from 'react';
import { getMatches } from '../api.js';

function when(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Matches() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getMatches().then(setMatches).catch(() => setError(true));
  }, []);

  if (error) return <p className="note">Couldn’t load your matches. Check your connection and reopen this tab.</p>;
  if (!matches) return <p className="note">Loading matches…</p>;

  if (matches.length === 0) {
    return (
      <div className="empty">
        <h2>No matches yet</h2>
        <p>A match appears only when you both like each other. Nobody sees who liked them until then.</p>
      </div>
    );
  }

  return (
    <ul className="match-list">
      {matches.map((m) => (
        <li key={m.id}>
          <img src={m.photo} alt="" draggable={false} />
          <div>
            <strong>
              {m.name}, {m.age}
            </strong>
            <span>{m.place}</span>
          </div>
          <time dateTime={m.matchedAt}>{when(m.matchedAt)}</time>
        </li>
      ))}
    </ul>
  );
}
