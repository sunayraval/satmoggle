import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Trophy, Zap, Flame, Medal, Award, Star, UserCheck, TrendingUp } from 'lucide-react';

export default function Leaderboards({ user, profile }) {
  const [tab, setTab] = useState('overall'); // 'overall' | 'math' | 'english'

  const demoLeaderboard = [
    { rank: 1, username: 'IvyBound_Eric', elo: 1580, winRate: 88.4, wins: 142, subject: 'both', badge: '💎 Diamond Champion' },
    { rank: 2, username: 'CalcQueen_Sarah', elo: 1545, winRate: 84.2, wins: 98, subject: 'math', badge: '💎 Diamond Master' },
    { rank: 3, username: 'GrammarGod_Leo', elo: 1510, winRate: 81.0, wins: 110, subject: 'english', badge: '💎 Diamond Master' },
    { rank: 4, username: 'SpeedDemon99', elo: 1460, winRate: 76.5, wins: 85, subject: 'both', badge: '⚡ Platinum Elite' },
    { rank: 5, username: 'HarvardOrBust', elo: 1420, winRate: 74.0, wins: 64, subject: 'both', badge: '⚡ Platinum Elite' },
    { rank: 6, username: 'MathWizard_Alex', elo: 1390, winRate: 71.2, wins: 52, subject: 'math', badge: '🥇 Gold Challenger' },
    { rank: 7, username: 'SAT_Slayer_2026', elo: 1360, winRate: 68.8, wins: 41, subject: 'both', badge: '🥇 Gold Challenger' },
    { rank: 8, username: 'Challenger_Demo', elo: 1250, winRate: 66.7, wins: 8, subject: 'both', badge: '🥈 Silver Competitor' },
    { rank: 9, username: 'PrepStudent_9', elo: 1220, winRate: 60.0, wins: 15, subject: 'english', badge: '🥈 Silver Competitor' },
    { rank: 10, username: 'RookieTactician', elo: 1180, winRate: 55.0, wins: 11, subject: 'both', badge: '🥉 Bronze Initiate' },
  ];

  // If current profile exists and isn't in top 10, inject them at rank 8 or replace demo
  const displayList = [...demoLeaderboard];
  if (profile && !displayList.some(p => p.username === profile.username)) {
    displayList[7] = {
      rank: 8,
      username: profile.username || 'You',
      elo: profile.eloRating || 1250,
      winRate: profile.winRate || 66.7,
      wins: profile.wins || 8,
      subject: 'both',
      badge: (profile.eloRating || 1250) >= 1400 ? '💎 Diamond Elite' : (profile.eloRating || 1250) >= 1300 ? '⚡ Platinum Elite' : '🥈 Silver Competitor',
      isMe: true
    };
  } else if (profile) {
    const idx = displayList.findIndex(p => p.username === profile.username);
    if (idx !== -1) displayList[idx].isMe = true;
  }

  const getRankBadgeIcon = (rank) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-black shadow-lg shadow-amber-400/40">1</div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-300 text-black flex items-center justify-center font-black shadow-md">2</div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-black shadow-md">3</div>;
    return <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center font-bold text-xs">{rank}</div>;
  };

  return (
    <div className="min-h-screen py-12 px-4 max-w-5xl mx-auto font-body">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <Trophy size={14} /> Global Competitive Rankings
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">SATmoggle Leaderboards</h1>
        <p className="text-slate-400 text-sm">See where you rank among the top SAT problem solvers across the world.</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1.5 max-w-md mx-auto mb-10 border border-white/10">
        {[
          { id: 'overall', label: 'Overall Champions' },
          { id: 'math', label: 'Math Masters' },
          { id: 'english', label: 'Reading & Writing' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all font-heading ${
              tab === t.id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table Card */}
      <GlassCard className="p-6 md:p-8 border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold uppercase text-slate-400 font-heading tracking-wider">
                <th className="pb-4 pl-2">Rank</th>
                <th className="pb-4">Challenger</th>
                <th className="pb-4">Elo Rating</th>
                <th className="pb-4">Win Rate</th>
                <th className="pb-4 text-right pr-2">Total Victories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayList.map((p) => (
                <tr
                  key={p.rank}
                  className={`transition-colors ${p.isMe ? 'bg-cyan-500/15 border-l-4 border-l-cyan-400' : 'hover:bg-white/[0.03]'}`}
                >
                  <td className="py-4 pl-2 font-mono">
                    {getRankBadgeIcon(p.rank)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center font-bold text-sm text-white">
                        {p.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white font-heading flex items-center gap-2">
                          <span>{p.username}</span>
                          {p.isMe && <span className="px-2 py-0.2 rounded text-[10px] font-black bg-cyan-400 text-black uppercase">You</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">{p.badge}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-black text-base text-cyan-300">
                    ⚡ {p.elo}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full" style={{ width: `${p.winRate}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 font-mono">{p.winRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-right pr-2 font-mono font-bold text-sm text-amber-400">
                    {p.wins} Wins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
