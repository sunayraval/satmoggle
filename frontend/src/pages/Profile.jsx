import React from 'react';
import GlassCard from '../components/common/GlassCard';
import { logoutUser, isDemoMode } from '../services/firebase';
import { User, Trophy, Zap, Flame, Shield, LogOut, CheckCircle, Award, BarChart3, RefreshCw } from 'lucide-react';

export default function Profile({ user, profile, onOpenAuth }) {
  if (!user || !profile) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-md mx-auto text-center font-body">
        <GlassCard className="p-8 border-cyan-500/30 space-y-4">
          <User size={48} className="text-cyan-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white font-heading">Sign In Required</h2>
          <p className="text-sm text-slate-400">Please sign in or continue as a guest to view your Elo rating and performance analytics.</p>
          <button onClick={onOpenAuth} className="btn-primary w-full py-3 justify-center text-sm">
            Sign In Now
          </button>
        </GlassCard>
      </div>
    );
  }

  const elo = profile.eloRating || 1200;
  const rankTitle = elo >= 1500 ? '💎 Diamond Master' : elo >= 1400 ? '⚡ Platinum Elite' : elo >= 1300 ? '🥇 Gold Challenger' : '🥈 Silver Competitor';
  const mathStats = profile.subjectStats?.math || { correct: 45, total: 60, elo: 1260 };
  const engStats = profile.subjectStats?.english || { correct: 38, total: 50, elo: 1240 };

  const mathAcc = mathStats.total > 0 ? ((mathStats.correct / mathStats.total) * 100).toFixed(1) : '75.0';
  const engAcc = engStats.total > 0 ? ((engStats.correct / engStats.total) * 100).toFixed(1) : '76.0';

  const handleResetDemo = () => {
    if (window.confirm('Reset local demo stats back to default 1250 Elo?')) {
      localStorage.removeItem('satmoggle_mock_profile');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto font-body space-y-8">
      {/* Top Banner */}
      <GlassCard className="p-8 border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-cyan-500/20">
            {profile.username ? profile.username[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-white font-heading">{profile.username}</h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-cyan-400 text-black uppercase tracking-wider">{rankTitle}</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>{profile.email || 'Guest Player Account'}</span>
              <span>•</span>
              <span>Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
          <button
            onClick={() => logoutUser().then(() => window.location.reload())}
            className="btn-secondary px-5 py-2.5 text-xs border-red-500/30 text-red-300 hover:border-red-400 flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </GlassCard>

      {/* 3 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="text-center p-6 border-amber-500/30">
          <div className="text-4xl font-black text-amber-400 font-heading font-mono">
            ⚡ {elo}
          </div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">Global Elo Rating</div>
        </GlassCard>

        <GlassCard className="text-center p-6 border-emerald-500/30">
          <div className="text-4xl font-black text-emerald-400 font-heading font-mono">
            {profile.winRate || 66.7}%
          </div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">
            Win Rate ({profile.wins || 8}W / {(profile.gamesPlayed || 12) - (profile.wins || 8)}L)
          </div>
        </GlassCard>

        <GlassCard className="text-center p-6 border-purple-500/30">
          <div className="text-4xl font-black text-purple-400 font-heading font-mono">
            {profile.gamesPlayed || 12}
          </div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">Total Matches Played</div>
        </GlassCard>
      </div>

      {/* Subject Breakdown */}
      <GlassCard className="p-8 border-white/10 space-y-6">
        <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
          <BarChart3 size={20} className="text-cyan-400" />
          <span>Subject Mastery Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Math */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base font-heading">SAT Math & Grid-ins</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">⚡ {mathStats.elo || 1260} Elo</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Accuracy: {mathAcc}%</span>
              <span>{mathStats.correct} / {mathStats.total} Correct</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${mathAcc}%` }} />
            </div>
          </div>

          {/* Reading & Writing */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base font-heading">Reading & Writing</span>
              <span className="font-mono text-purple-400 font-bold text-sm">⚡ {engStats.elo || 1240} Elo</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Accuracy: {engAcc}%</span>
              <span>{engStats.correct} / {engStats.total} Correct</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: `${engAcc}%` }} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Demo Mode Actions */}
      {isDemoMode && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="text-xs text-amber-200">
            <strong>Local Demo Storage:</strong> Your profile and Elo rating are currently stored in your browser's LocalStorage for instant testing.
          </div>
          <button onClick={handleResetDemo} className="btn-secondary text-xs px-4 py-2 border-amber-500/40 text-amber-300 flex items-center gap-1.5 whitespace-nowrap">
            <RefreshCw size={14} />
            <span>Reset Demo Stats</span>
          </button>
        </div>
      )}
    </div>
  );
}
