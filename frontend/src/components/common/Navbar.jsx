import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Flame, Trophy, User, Key, ShieldAlert } from 'lucide-react';

export default function Navbar({ user, profile, onOpenAuth, onOpenFirebaseGuide, isDemoMode = false }) {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Single Player SAT', path: '/singleplayer', icon: <Trophy size={16} className="text-amber-400" /> },
    { name: 'Battle Lobby', path: '/lobby', icon: <Flame size={16} className="text-pink-500 animate-bounce" /> },
    { name: 'Leaderboards', path: '/leaderboards', icon: <Zap size={16} className="text-cyan-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
            <span className="font-heading font-black text-black text-xl tracking-tighter">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-2xl tracking-tight text-gradient-cyan group-hover:brightness-110 transition-all">
              SATmoggle
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">
              Competitive SAT Arena
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-heading transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action & User Profile */}
        <div className="flex items-center gap-3">
          {/* Firebase Key Guide Button (If Demo Mode or Requested) */}
          {isDemoMode && (
            <button
              onClick={onOpenFirebaseGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse"
              title="Click to view Firebase setup instructions"
            >
              <Key size={14} />
              <span>Configure Firebase</span>
            </button>
          )}

          {user && profile ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-md">
                {profile.username ? profile.username[0].toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {profile.username || 'Student'}
                </span>
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-0.5">
                  ⚡ {profile.eloRating || 1200} Elo
                </span>
              </div>
            </Link>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary text-sm px-5 py-2"
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
