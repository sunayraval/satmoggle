import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Flame, Trophy, User, BookOpen, Settings, LogIn } from 'lucide-react';

export default function Navbar({ user, profile, onOpenAuth, onOpenFirebaseGuide, isDemoMode }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const elo = profile?.eloRating || 1200;
  const username = profile?.username || 'Guest Player';
  const isGuest = profile?.isGuest || user?.isAnonymous || !user;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-logo-icon">S</div>
          <span className="nav-logo-text">SATmoggle</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
            <span>Arena Home</span>
          </Link>
          <Link to="/singleplayer" className={`nav-link ${currentPath === '/singleplayer' ? 'active' : ''}`}>
            <BookOpen size={16} />
            <span>SAT Simulator</span>
          </Link>
          <Link to="/lobby" className={`nav-link ${currentPath === '/lobby' || currentPath.startsWith('/room/') ? 'active' : ''}`}>
            <Flame size={16} style={{ color: 'var(--accent-pink)' }} />
            <span>Multiplayer Battle</span>
          </Link>
          <Link to="/leaderboards" className={`nav-link ${currentPath === '/leaderboards' ? 'active' : ''}`}>
            <Trophy size={16} style={{ color: 'var(--accent-amber)' }} />
            <span>Leaderboards</span>
          </Link>
        </nav>

        {/* Right Actions & User Badge */}
        <div className="nav-actions">
          {/* Guest or User Badge */}
          <Link to="/profile" className="guest-badge" title="Click to view full stats">
            <div className="guest-badge-icon">⚡</div>
            <div>
              <div style={{ fontWeight: 700, lineHeight: 1.1, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{username}</span>
                {isGuest && <span className="badge badge-amber" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>Guest</span>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 700 }}>
                {elo} Elo Rating
              </div>
            </div>
          </Link>

          {/* Sign In button if Guest */}
          {isGuest ? (
            <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
              <LogIn size={15} />
              <span>Save Stats / Sign In</span>
            </button>
          ) : (
            <Link to="/profile" className="btn btn-secondary btn-sm">
              <User size={15} />
              <span>Profile</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
