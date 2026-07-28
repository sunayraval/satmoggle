import React from 'react';
import { logoutUser, isDemoMode } from '../services/firebase';
import { User, Trophy, Zap, Flame, Shield, LogOut, CheckCircle, Award, BarChart2, RefreshCw, LogIn, Sparkles } from 'lucide-react';

export default function Profile({ user, profile, onOpenAuth }) {
  const elo = profile?.eloRating || 1200;
  const username = profile?.username || user?.displayName || 'Guest Challenger';
  const email = profile?.email || user?.email || 'guest@satmoggle.edu';
  const isGuest = profile?.isGuest || user?.isAnonymous || !user;

  const rankTitle = elo >= 1500 ? '💎 Diamond Master' : elo >= 1400 ? '⚡ Platinum Elite' : elo >= 1300 ? '🥇 Gold Challenger' : '🥈 Silver Competitor';
  const mathStats = profile?.subjectStats?.math || { correct: 48, total: 65, elo: 1265 };
  const engStats = profile?.subjectStats?.english || { correct: 42, total: 55, elo: 1235 };

  const mathAcc = mathStats.total > 0 ? ((mathStats.correct / mathStats.total) * 100).toFixed(1) : '73.8';
  const engAcc = engStats.total > 0 ? ((engStats.correct / engStats.total) * 100).toFixed(1) : '76.4';

  const handleResetDemo = () => {
    if (window.confirm('Reset local stats back to default 1250 Elo?')) {
      localStorage.removeItem('satmoggle_guest_user');
      localStorage.removeItem('satmoggle_guest_profile');
      window.location.reload();
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Top Profile Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', border: '1px solid rgba(0, 242, 255, 0.3)', boxShadow: 'var(--shadow-glow-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div className="flex-row" style={{ gap: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '2.5rem', color: 'white', boxShadow: '0 0 25px rgba(0, 242, 255, 0.3)' }}>
            {username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex-row" style={{ marginBottom: '0.35rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '2.25rem', margin: 0 }}>{username}</h1>
              <span className="badge badge-cyan">{rankTitle}</span>
              {isGuest && <span className="badge badge-amber">Guest Session</span>}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {email} • Active SATmoggle Competitor
            </p>
          </div>
        </div>

        <div className="flex-row">
          {isGuest ? (
            <button onClick={onOpenAuth} className="btn btn-primary shadow-glow-cyan">
              <LogIn size={18} />
              <span>Save Account to Cloud</span>
            </button>
          ) : (
            <button onClick={() => logoutUser().then(() => window.location.reload())} className="btn btn-secondary" style={{ color: 'var(--accent-red)', borderColor: 'rgba(255,51,102,0.3)' }}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Core Stat Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', borderColor: 'rgba(255, 183, 3, 0.4)' }}>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent-amber)', marginBottom: '0.25rem' }}>
            ⚡ {elo}
          </div>
          <div className="stat-label">Global FIDE Elo Rating</div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', borderColor: 'rgba(0, 245, 160, 0.4)' }}>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent-emerald)', marginBottom: '0.25rem' }}>
            {profile?.winRate || 64.3}%
          </div>
          <div className="stat-label">Win Rate ({profile?.wins || 9}W / {(profile?.gamesPlayed || 14) - (profile?.wins || 9)}L)</div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', borderColor: 'rgba(157, 78, 221, 0.4)' }}>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>
            {profile?.gamesPlayed || 14}
          </div>
          <div className="stat-label">Total Matches Played</div>
        </div>
      </div>

      {/* Subject Mastery Breakdown */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BarChart2 size={22} style={{ color: 'var(--accent-cyan)' }} />
          <span>Subject Mastery Breakdown</span>
        </h3>

        <div className="grid-2">
          {/* Math */}
          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'white' }}>SAT Math & Grid-ins</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1rem' }}>⚡ {mathStats.elo} Elo</span>
            </div>
            <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              <span>Accuracy: {mathAcc}%</span>
              <span>{mathStats.correct} / {mathStats.total} Correct</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--accent-emerald)', height: '100%', width: `${mathAcc}%` }} />
            </div>
          </div>

          {/* Reading & Writing */}
          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'white' }}>Reading & Writing</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-purple)', fontSize: '1rem' }}>⚡ {engStats.elo} Elo</span>
            </div>
            <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              <span>Accuracy: {engAcc}%</span>
              <span>{engStats.correct} / {engStats.total} Correct</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--accent-purple)', height: '100%', width: `${engAcc}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Guest Cloud Callout */}
      {isGuest && (
        <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.1), rgba(18, 24, 43, 0.8))', border: '1px solid rgba(255, 183, 3, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="flex-row" style={{ marginBottom: '0.5rem' }}>
              <span className="badge badge-amber">⚠️ Temporary Guest Session</span>
            </div>
            <h4 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'white' }}>Want to save your {elo} Elo Rating permanently?</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '550px' }}>
              Create a free account with your email to link your guest statistics and compete on the permanent global leaderboards across any device.
            </p>
          </div>
          <button onClick={onOpenAuth} className="btn btn-gold">
            <Sparkles size={18} />
            <span>Link Account Now</span>
          </button>
        </div>
      )}

      {/* Reset Demo Option */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button onClick={handleResetDemo} style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textDecoration: 'underline', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} />
          <span>Reset Local Test Statistics</span>
        </button>
      </div>
    </div>
  );
}
