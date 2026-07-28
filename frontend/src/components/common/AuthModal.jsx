import React, { useState } from 'react';
import Modal from './Modal';
import { loginUser, registerUser, loginAnonymously, isDemoMode } from '../../services/firebase';
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isDemoMode) {
        // Save mock account in localStorage
        const customUser = {
          uid: 'usr_' + Math.random().toString(36).substring(2, 8),
          email: email || 'user@satmoggle.edu',
          isAnonymous: false
        };
        const customProfile = {
          uid: customUser.uid,
          username: username || email.split('@')[0] || 'Challenger',
          email: customUser.email,
          eloRating: 1250,
          gamesPlayed: 14,
          wins: 9,
          winRate: 64.3,
          isGuest: false,
          subjectStats: {
            math: { correct: 48, total: 65, elo: 1265 },
            english: { correct: 42, total: 55, elo: 1235 }
          },
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('satmoggle_guest_user', JSON.stringify(customUser));
        localStorage.setItem('satmoggle_guest_profile', JSON.stringify(customProfile));
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      if (isRegister) {
        if (!username.trim()) throw new Error('Please choose a username.');
        await registerUser(email, password, username);
      } else {
        await loginUser(email, password);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isDemoMode) {
        await loginAnonymously();
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Could not continue as guest: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isRegister ? '✨ Create Account & Save Stats' : '⚡ Sign In to SATmoggle'}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isRegister
            ? 'Create a free account to permanently save your Elo rating, battle history, and leaderboard rankings across all devices.'
            : 'Welcome back! Sign in to continue climbing the SATmoggle global leaderboards.'}
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(255, 51, 102, 0.15)', border: '1px solid var(--accent-red)', borderRadius: '12px', color: '#ff8099', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ fontWeight: 700, textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="form-group">
            <label className="form-label">Challenger Username</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-dim)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. IvyBound_Sarah"
                required
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-dim)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@satmoggle.edu"
              required
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-dim)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account & Save Stats' : 'Sign In Now'}</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleGuestContinue}
            disabled={loading}
            className="btn btn-secondary btn-block"
            style={{ fontSize: '0.9rem' }}
          >
            <Sparkles size={16} style={{ color: 'var(--accent-amber)' }} />
            <span>Continue Playing as Guest (No Account Required)</span>
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {isRegister ? 'Already have an account? Sign in instead' : "Don't have an account? Create one for free"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
