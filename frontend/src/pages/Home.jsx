import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Zap, Trophy, BookOpen, ArrowRight, ShieldCheck, Clock, Bomb, Sparkles, CheckCircle2, XCircle, Play, Users, BarChart2 } from 'lucide-react';
import QuestionRenderer from '../components/question/QuestionRenderer';
import OptionGrid from '../components/question/OptionGrid';

export default function Home({ user, profile, isDemoMode, onOpenAuth, onOpenFirebaseGuide }) {
  const navigate = useNavigate();
  const [demoSelected, setDemoSelected] = useState(null);

  const demoQuestion = {
    id: "demo_q_1",
    skill_desc: "Algebra • System of Linear Equations",
    stem: "If $3x + 2y = 18$ and $x - y = 1$, what is the value of $x + y$?",
    answerOptions: [
      { key: "A", text: "3" },
      { key: "B", text: "5" },
      { key: "C", text: "7" },
      { key: "D", text: "9" }
    ],
    correctKey: "C",
    rationale: "From $x - y = 1$, we get $x = y + 1$. Substituting into $3(y + 1) + 2y = 18$ gives $5y + 3 = 18$, so $5y = 15$ and $y = 3$. Therefore $x = 4$, and $x + y = 4 + 3 = 7$."
  };

  return (
    <div className="container-wide" style={{ paddingBottom: '6rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge animate-float">
          <Sparkles size={16} style={{ color: 'var(--accent-amber)' }} />
          <span>The Next-Generation Real-Time SAT Multiplayer Arena</span>
          <span className="badge badge-cyan" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>2026 Edition</span>
        </div>

        <h1 className="hero-title">
          Master the Digital SAT.<br />
          <span className="text-gradient-cyan">Battle in Real Time.</span>
        </h1>

        <p className="hero-subtitle">
          Experience College Board practice like never before. Solve 2,017+ official questions, compete in live multiplayer Bomb Party elimination rooms, and climb global FIDE Elo leaderboards — instantly as a guest or with cloud sync.
        </p>

        {/* Action Row */}
        <div className="hero-actions">
          <Link to="/singleplayer" className="btn btn-primary btn-lg shadow-glow-cyan">
            <BookOpen size={20} />
            <span>Launch SAT Simulator Now</span>
            <ArrowRight size={18} />
          </Link>

          <Link to="/lobby" className="btn btn-secondary btn-lg">
            <Flame size={20} style={{ color: 'var(--accent-pink)' }} />
            <span>Enter Battle Lobby</span>
          </Link>
        </div>

        {/* 4 Core Stat Boxes */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number text-gradient-cyan">2,017+</div>
            <div className="stat-label">Official SAT Questions</div>
          </div>

          <div className="stat-box">
            <div className="stat-number text-gradient-purple">100%</div>
            <div className="stat-label">Frictionless Guest Play</div>
          </div>

          <div className="stat-box">
            <div className="stat-number text-gradient-pink">1:15</div>
            <div className="stat-label">Default Bomb Party Timer</div>
          </div>

          <div className="stat-box">
            <div className="stat-number" style={{ color: 'var(--accent-amber)' }}>⚡ 1200</div>
            <div className="stat-label">Starting FIDE Elo Rating</div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Tryout Section */}
      <section style={{ margin: '3rem auto 5rem', maxWidth: '850px' }}>
        <div className="glass-panel" style={{ border: '1px solid rgba(0, 242, 255, 0.3)', boxShadow: 'var(--shadow-glow-cyan)' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
            <div className="flex-row">
              <span className="badge badge-cyan">⚡ Live Interactive Preview</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{demoQuestion.skill_desc}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Try answering below!</span>
          </div>

          <div style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: 1.8 }}>
            <QuestionRenderer content={demoQuestion.stem} />
          </div>

          <OptionGrid
            options={demoQuestion.answerOptions}
            selectedKey={demoSelected}
            onSelect={(key) => setDemoSelected(key)}
            disabled={demoSelected !== null}
            correctKey={demoSelected ? demoQuestion.correctKey : null}
          />

          {demoSelected && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: demoSelected === demoQuestion.correctKey ? 'rgba(0, 245, 160, 0.1)' : 'rgba(255, 51, 102, 0.1)', border: `1px solid ${demoSelected === demoQuestion.correctKey ? 'var(--accent-emerald)' : 'var(--accent-red)'}` }}>
              <div className="flex-row" style={{ marginBottom: '0.5rem', fontWeight: 800, color: demoSelected === demoQuestion.correctKey ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {demoSelected === demoQuestion.correctKey ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                <span>{demoSelected === demoQuestion.correctKey ? 'Spot On! Correct Answer.' : `Incorrect. The correct choice was ${demoQuestion.correctKey}.`}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                <strong>Explanation:</strong> <QuestionRenderer content={demoQuestion.rationale} />
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3 Core Game Modes Grid */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Championship Game Modes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            Whether you are grinding solo practice tests or battling friends in high-stakes elimination rooms, SATmoggle provides state-of-the-art tools.
          </p>
        </div>

        <div className="grid-3">
          {/* Mode 1: Digital SAT Simulator */}
          <div className="glass-card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-cyan), #0088ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06080f', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow-cyan)' }}>
              <BookOpen size={28} />
            </div>
            <span className="badge badge-cyan" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>Single Player Solo</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Digital SAT Simulator</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, flex: 1, marginBottom: '2rem' }}>
              Authentic College Board testing interface featuring official 35-minute module countdown timers, built-in interactive calculator popovers, geometry reference sheets, question bookmarking, and automated score predictions (400–1600 scale).
            </p>
            <Link to="/singleplayer" className="btn btn-primary btn-block">
              <span>Start Solo Practice</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mode 2: Bomb Party Royale */}
          <div className="glass-card" style={{ border: '1px solid rgba(255, 0, 127, 0.3)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-red))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow-pink)' }}>
              <Bomb size={28} />
            </div>
            <span className="badge badge-pink" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>Multiplayer Royale</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--accent-pink)' }}>Bomb Party Royale</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, flex: 1, marginBottom: '2rem' }}>
              Ticking hot-potato elimination arena! Starts with a customizable 1:15 (75-second) default timer that decays by 1 second each round. Solve your question correctly to defuse and pass the bomb, or explode instantly!
            </p>
            <Link to="/lobby?mode=BOMB_PARTY" className="btn btn-danger btn-block">
              <span>Join Bomb Party Arena</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mode 3: Classic Battle & Elo */}
          <div className="glass-card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow-purple)' }}>
              <Trophy size={28} />
            </div>
            <span className="badge badge-purple" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>Competitive Ranking</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>FIDE Elo Leaderboards</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, flex: 1, marginBottom: '2rem' }}>
              Every match impacts your global rating. Challenge players worldwide in Classic Racing battles, earn rank badges from Bronze Initiate to Diamond Champion, and track subject-specific mastery in Math vs Reading/Writing.
            </p>
            <Link to="/leaderboards" className="btn btn-secondary btn-block">
              <span>View Global Rankings</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Cloud Sync & Firebase Callout Banner */}
      <section className="glass-panel" style={{ marginTop: '5rem', background: 'linear-gradient(135deg, rgba(18, 24, 43, 0.8), rgba(26, 34, 60, 0.9))', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '650px' }}>
            <div className="flex-row" style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge-cyan">☁️ Cloud Native Architecture</span>
              <span className="badge badge-emerald">Ready to Deploy</span>
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Frictionless Guest Play + Cloud Storage</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              Play instantly as a guest without ever creating an account or entering passwords. When you are ready to preserve your Elo rating and stats across devices, click <strong>"Save Account"</strong> in the top menu to sync directly with Google Cloud Firestore and Realtime Database.
            </p>
          </div>

          <div className="flex-col" style={{ width: '100%', maxWidth: '280px' }}>
            <button onClick={onOpenAuth} className="btn btn-primary btn-block">
              <span>✨ Create Free Account</span>
            </button>
            <button onClick={onOpenFirebaseGuide} className="btn btn-secondary btn-block" style={{ fontSize: '0.85rem' }}>
              <span>⚙️ Firebase Setup Guide</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
