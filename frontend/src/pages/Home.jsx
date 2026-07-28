import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import { Trophy, Flame, Zap, ArrowRight, ShieldCheck, Cpu, Users, Bomb, Clock, CheckCircle2 } from 'lucide-react';

export default function Home({ onOpenAuth, onOpenFirebaseGuide, user, isDemoMode }) {
  const [stats, setStats] = useState({ total: 97488, math: 48000, english: 49488 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch('/api/questions/stats/summary')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.total > 0) {
          setStats(data.data);
        }
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden font-body">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/20 to-pink-500/20 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-300 mb-6 shadow-md animate-float">
          <Zap size={14} className="text-cyan-400" />
          <span>Next-Gen Advanced Agentic Coding & Educational Gaming</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Master the SAT in <span className="text-gradient-purple">Real-Time Battle</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Solve real College Board problems, battle friends in ticking <strong>Bomb Party eliminations</strong>, climb global Elo leaderboards, or simulate official Digital SAT exams with precision timing.
        </p>

        {/* Quick CTA Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/singleplayer" className="btn-primary text-base px-8 py-4 shadow-xl">
            <Trophy size={20} className="text-amber-300" />
            <span>Launch SAT Simulator</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/lobby" className="btn-secondary text-base px-8 py-4 border-cyan-500/30 hover:border-cyan-400 text-cyan-300">
            <Flame size={20} className="text-pink-500 animate-bounce" />
            <span>Enter Battle Lobby</span>
          </Link>
        </div>

        {/* Live Index Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-white font-heading text-gradient-cyan">
              {loadingStats ? '...' : stats.total?.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">SAT Questions Indexed</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-white font-heading text-emerald-400">
              {loadingStats ? '...' : stats.math?.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Math & Grid-ins</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-white font-heading text-purple-400">
              {loadingStats ? '...' : stats.english?.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Reading & Writing</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-white font-heading text-amber-400">
              Sub-Sec
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Firebase RTDB Sync</div>
          </div>
        </div>
      </section>

      {/* 3 Core Game Modes Grid */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto my-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Choose Your Training Ground</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Every question answered boosts your global Elo rating and sharpens your test-day readiness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Single Player */}
          <GlassCard className="flex flex-col justify-between border-t-2 border-t-cyan-400 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                <Trophy size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Real SAT Simulator</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Simulate the exact College Board Digital SAT experience. Enforces official module timing, break periods, bookmark flags, built-in calculator, and reference formula sheets.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400" /> 35-Min Module Timers & Break Rules</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400" /> Math Geometry Reference Sheet</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400" /> Instant Score Prediction & Elo Boost</li>
              </ul>
            </div>
            <Link to="/singleplayer" className="btn-primary w-full py-3 justify-center text-sm shadow-md">
              <span>Start Solo Training</span>
              <ArrowRight size={16} />
            </Link>
          </GlassCard>

          {/* Card 2: Classic Battle */}
          <GlassCard className="flex flex-col justify-between border-t-2 border-t-purple-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Classic Multiplayer</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Race friends or public opponents in real-time. Live leaderboards track accuracy and speed simultaneously as you battle through customizable question sets.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400" /> Public Room Lobby Browser</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400" /> 6-Character Private Friend Codes</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400" /> Live Racing Progress Bars</li>
              </ul>
            </div>
            <Link to="/lobby" className="btn-secondary w-full py-3 justify-center text-sm border-purple-500/40 text-purple-200 hover:border-purple-400">
              <span>Browse Public Games</span>
              <ArrowRight size={16} />
            </Link>
          </GlassCard>

          {/* Card 3: Bomb Party */}
          <GlassCard className="flex flex-col justify-between border-t-2 border-t-pink-500 relative overflow-hidden group bg-gradient-to-b from-pink-500/[0.05] to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/20 animate-pulse-glow">
                <Bomb size={24} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">Bomb Party Royale</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-500 text-black uppercase tracking-wider">Hot-Potato</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                The ultimate elimination test! A ticking bomb (default 1:15) passes around the ring. Answer incorrectly or let the timer hit 0, and you explode! Last survivor wins.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-pink-400" /> Customizable Host Timer (30s–180s)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-pink-400" /> 1-Second Time Decay Per Round</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-pink-400" /> Instant Elimination Visual FX</li>
              </ul>
            </div>
            <Link to="/lobby?mode=BOMB_PARTY" className="btn-danger w-full py-3 justify-center text-sm shadow-lg">
              <span>Play Bomb Party</span>
              <Flame size={16} />
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Technical Excellence Footer Banner */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto mt-20">
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-900/20 via-indigo-900/20 to-purple-900/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white font-heading">Ready for Staging & Render Deployment?</h3>
            <p className="text-sm text-slate-300 max-w-xl">
              SATmoggle is structured as a cloud-native monorepo. Express serves the Vite frontend bundle in production while synchronizing real-time gameplay over Firebase RTDB.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenFirebaseGuide}
              className="btn-secondary px-6 py-3 text-sm text-amber-300 border-amber-500/40"
            >
              <ShieldCheck size={18} />
              <span>Firebase Guide</span>
            </button>
            <Link to="/leaderboards" className="btn-primary px-6 py-3 text-sm">
              <Trophy size={18} />
              <span>View Leaderboards</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
