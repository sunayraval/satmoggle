import React, { useState } from 'react';
import Modal from './Modal';
import { loginWithEmail, registerWithEmail, loginAnonymously, isDemoMode } from '../../services/firebase';
import { User, Mail, Lock, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else if (tab === 'register') {
        if (!username.trim()) throw new Error('Please enter a username.');
        await registerWithEmail(email, password, username.trim());
      } else if (tab === 'guest') {
        await loginAnonymously(username.trim() || 'GuestChallenger');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access SATmoggle Arena">
      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
        <button
          type="button"
          onClick={() => { setTab('login'); setError(null); }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all font-heading ${
            tab === 'login' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab('register'); setError(null); }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all font-heading ${
            tab === 'register' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => { setTab('guest'); setError(null); }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all font-heading ${
            tab === 'guest' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Guest
        </button>
      </div>

      {isDemoMode && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
          <Zap size={16} className="flex-shrink-0 mt-0.5 text-amber-400 animate-pulse" />
          <span>
            <strong>Local Demo Mode Active:</strong> You can sign in or play as a guest instantly without needing cloud Firebase keys! Your stats will be saved locally.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(tab === 'register' || tab === 'guest') && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {tab === 'guest' ? 'Player Handle (Optional)' : 'Username'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={tab === 'guest' ? 'e.g. SpeedDemon99' : 'Choose a unique username'}
                required={tab === 'register'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {(tab === 'login' || tab === 'register') && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@satmoggle.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 justify-center text-base mt-2 shadow-lg"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>{tab === 'login' ? 'Enter Arena' : tab === 'register' ? 'Create Account' : 'Play Instantly'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
