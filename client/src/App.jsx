import { useState } from 'react';
import Discover from './components/Discover.jsx';

export default function App() {
  const [tab, setTab] = useState('discover');

  return (
    <div className="app">
      <main className="app-main">
        {tab === 'home' && <section className="home" aria-label="Home" />}
        {/* Kept mounted so the card stack survives switching tabs. */}
        <div hidden={tab !== 'discover'} className="tab-pane">
          <Discover />
        </div>
      </main>

      <nav className="tabbar" aria-label="Main">
        {[
          ['home', 'Home', 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
          ['discover', 'Discover', 'M12 21s-7-4.6-9.3-9.3C1.2 8.4 3 5 6.4 5c2 0 3.5 1.1 4.3 2.4h.6C12.1 6.1 13.6 5 15.6 5 19 5 20.8 8.4 19.3 11.7 17 16.4 12 21 12 21z']
        ].map(([id, label, d]) => (
          <button
            key={id}
            className={`tab ${tab === id ? 'is-active' : ''}`}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d={d} fill={tab === id ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
