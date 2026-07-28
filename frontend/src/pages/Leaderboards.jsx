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

  // Inject current user/guest into rankings if not already in list
  const displayList = [...demoLeaderboard];
  const myName = profile?.username || user?.displayName || 'You';
  const myElo = profile?.eloRating || 1250;
  const myWinRate = profile?.winRate || 64.3;
  const myWins = profile?.wins || 9;

  if (!displayList.some(p => p.username === myName)) {
    displayList[7] = {
      rank: 8,
      username: myName,
      elo: myElo,
      winRate: myWinRate,
      wins: myWins,
      subject: 'both',
      badge: myElo >= 1400 ? '💎 Diamond Elite' : myElo >= 1300 ? '⚡ Platinum Elite' : '🥈 Silver Competitor',
      isMe: true
    };
  } else {
    const idx = displayList.findIndex(p => p.username === myName);
    if (idx !== -1) displayList[idx].isMe = true;
  }

  const getRankBadgeIcon = (rank) => {
    if (rank === 1) return <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-amber), #ff8800)', color: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 0 15px rgba(255,183,3,0.5)' }}>1</div>;
    if (rank === 2) return <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', color: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>2</div>;
    if (rank === 3) return <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #92400e)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>3</div>;
    return <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{rank}</div>;
  };

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>
          <Trophy size={16} />
          <span>Global Competitive Rankings</span>
        </div>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }}>SATmoggle Leaderboards</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>See where your FIDE Elo rating ranks among the top SAT problem solvers globally.</p>
      </div>

      {/* Subject Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '0.4rem', borderRadius: '16px', border: '1px solid var(--border-glass)', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
        {[
          { id: 'overall', label: 'Overall Champions' },
          { id: 'math', label: 'Math Masters' },
          { id: 'english', label: 'Reading & Writing' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', cursor: 'pointer', transition: 'all 0.2s ease', background: tab === t.id ? 'linear-gradient(135deg, var(--accent-amber), #e67e22)' : 'transparent', color: tab === t.id ? '#06080f' : 'var(--text-muted)', boxShadow: tab === t.id ? '0 0 20px rgba(255,183,3,0.3)' : 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table Panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Rank</th>
                <th>Challenger</th>
                <th>Elo Rating</th>
                <th>Win Rate</th>
                <th style={{ textAlign: 'right' }}>Victories</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((p) => (
                <tr key={p.rank} style={{ background: p.isMe ? 'rgba(0, 242, 255, 0.08)' : 'transparent' }}>
                  <td style={{ fontFamily: 'monospace' }}>
                    {getRankBadgeIcon(p.rank)}
                  </td>
                  <td>
                    <div className="flex-row">
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>
                        {p.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex-row" style={{ gap: '0.5rem', fontWeight: 800, color: 'white', fontSize: '1.05rem' }}>
                          <span>{p.username}</span>
                          {p.isMe && <span className="badge badge-cyan" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.badge}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                    ⚡ {p.elo}
                  </td>
                  <td>
                    <div className="flex-row" style={{ gap: '0.75rem' }}>
                      <div style={{ width: '80px', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--accent-emerald)', height: '100%', width: `${p.winRate}%` }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{p.winRate}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-amber)' }}>
                    {p.wins} Wins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
