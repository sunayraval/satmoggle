import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import QuestionRenderer from '../components/question/QuestionRenderer';
import OptionGrid from '../components/question/OptionGrid';
import GridInInput from '../components/question/GridInInput';
import { subscribeToRoom, updateRoomStatus, updateUserEloAndStats } from '../services/firebase';
import confetti from 'canvas-confetti';
import { Bomb, Zap, Users, Trophy, Clock, CheckCircle2, Copy, Check, ArrowRight, ShieldAlert, Play } from 'lucide-react';

// Built-in Fallback questions for Bomb Party / Classic matches if offline
const FALLBACK_BATTLE_QS = [
  {
    id: "battle_q_1",
    type: "mcq",
    skill_desc: "Algebra • Linear Equations",
    stem: "If $4x - 7 = 21$, what is the value of $x$?",
    answerOptions: [{ key: "A", text: "5" }, { key: "B", text: "7" }, { key: "C", text: "9" }, { key: "D", text: "11" }],
    correctKey: "B"
  },
  {
    id: "battle_q_2",
    type: "mcq",
    skill_desc: "Craft & Structure • Words in Context",
    stem: "The architect's revolutionary design was praised for its ______ approach, seamlessly blending organic woodland elements with sleek steel structures.",
    answerOptions: [{ key: "A", text: "derivative" }, { key: "B", text: "innovative" }, { key: "C", text: "obsolete" }, { key: "D", text: "monotonous" }],
    correctKey: "B"
  },
  {
    id: "battle_q_3",
    type: "spr",
    skill_desc: "Geometry • Area of Triangle",
    stem: "A right triangle has base length 6 and height 8. What is the area of the triangle?",
    keys: ["24", "24.0"],
    correctKey: "24"
  },
  {
    id: "battle_q_4",
    type: "mcq",
    skill_desc: "Advanced Math • Exponents",
    stem: "Which expression is equivalent to $(3x^2)(4x^3)$?",
    answerOptions: [{ key: "A", text: "$7x^5$" }, { key: "B", text: "$12x^5$" }, { key: "C", text: "$12x^6$" }, { key: "D", text: "$7x^6$" }],
    correctKey: "B"
  },
  {
    id: "battle_q_5",
    type: "mcq",
    skill_desc: "Expression of Ideas • Transitions",
    stem: "In recent years, urban planners have heavily invested in protected bicycle lanes. ______, commuter cycling rates have surged by over 40% in participating cities.",
    answerOptions: [{ key: "A", text: "As a result," }, { key: "B", text: "On the contrary," }, { key: "C", text: "Regardless," }, { key: "D", text: "For instance," }],
    correctKey: "A"
  }
];

export default function Room({ user, profile }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Gameplay State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [userCorrect, setUserCorrect] = useState(0);
  const [isEliminated, setIsEliminated] = useState(false);
  const [bombTimeLeft, setBombTimeLeft] = useState(75);
  const [eloResults, setEloResults] = useState(null);

  const explosionRef = useRef(false);
  const currentUserId = user?.uid || profile?.uid || 'guest_unknown';

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
      if (!roomData) {
        setError('Room no longer exists or was closed by the host.');
        setLoading(false);
        return;
      }
      setRoom(roomData);
      setLoading(false);

      if (roomData.status === 'PLAYING' && roomData.gameState?.questions && questions.length === 0) {
        setQuestions(roomData.gameState.questions);
        setCurrentIdx(0);
        setUserScore(0);
        setUserCorrect(0);
        setIsEliminated(false);
      }

      if (roomData.status === 'FINISHED' && !eloResults && roomData.players) {
        triggerVictoryCelebration(roomData);
      }
    });
    return () => unsubscribe();
  }, [roomCode, questions.length, eloResults]);

  // Bomb Party Countdown Timer
  useEffect(() => {
    if (!room || room.status !== 'PLAYING' || room.settings?.mode !== 'BOMB_PARTY') return;
    const gameState = room.gameState;
    if (!gameState || !gameState.bombExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((gameState.bombExpiresAt - Date.now()) / 1000);
      setBombTimeLeft(Math.max(0, remaining));

      if (remaining <= 0 && gameState.activePlayerId === currentUserId && !explosionRef.current) {
        explosionRef.current = true;
        handleBombExplosion();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [room, currentUserId]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`Join my SATmoggle Battle! Room Code: ${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHost = room && room.hostId === currentUserId;
  const isBombParty = room?.settings?.mode === 'BOMB_PARTY';
  const playersList = room?.players ? Object.values(room.players) : [];

  // Start Match Action
  const handleStartMatch = async () => {
    if (!isHost) return;
    try {
      const { subject = 'both', difficulty = 'MIXED', gameSize = 10, bombTimer = 75 } = room.settings || {};
      const count = isBombParty ? 30 : gameSize;
      let loadedQs = [];

      try {
        const res = await fetch(`/api/questions/random?subject=${subject}&difficulty=${difficulty}&count=${count}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          loadedQs = data.data.map((q, idx) => ({
            ...q,
            id: q.id || `bq_${idx+1}`,
            stem: q.stem || q.prompt || q.content?.stem || 'Solve:',
            answerOptions: q.answerOptions || q.answer?.choices || null,
            correctKey: q.correctKey || q.answer?.correct_choice || (q.keys ? q.keys[0] : null)
          }));
        }
      } catch (e) {
        console.warn('API offline, using built-in battle questions');
      }

      if (loadedQs.length === 0) {
        loadedQs = FALLBACK_BATTLE_QS;
      }

      const initialSurvivors = playersList.map(p => p.id);
      const firstPlayerId = initialSurvivors[0];

      const gameState = {
        questions: loadedQs,
        activePlayerId: firstPlayerId,
        bombExpiresAt: Date.now() + bombTimer * 1000,
        round: 1,
        timeDecay: 1,
        survivors: initialSurvivors,
        startedAt: Date.now()
      };

      await updateRoomStatus(roomCode, 'PLAYING', gameState);
    } catch (err) {
      alert('Could not start match: ' + err.message);
    }
  };

  const handleBombPartyAnswer = async (selectedAns) => {
    if (!room || !room.gameState || room.gameState.activePlayerId !== currentUserId) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    let isCorrect = false;
    if (Array.isArray(currentQ.keys) && currentQ.keys.length > 0) {
      isCorrect = currentQ.keys.some(k => String(k).trim().toLowerCase() === String(selectedAns).trim().toLowerCase());
    } else {
      isCorrect = String(selectedAns).trim().toLowerCase() === String(currentQ.correctKey).trim().toLowerCase();
    }

    if (isCorrect) {
      explosionRef.current = false;
      const survivors = room.gameState.survivors || [];
      const currentPos = survivors.indexOf(currentUserId);
      const nextPos = (currentPos + 1) % survivors.length;
      const nextPlayerId = survivors[nextPos];

      const nextRound = (room.gameState.round || 1) + 1;
      const baseTimer = room.settings?.bombTimer || 75;
      const nextTimer = Math.max(10, baseTimer - nextRound * (room.gameState.timeDecay || 1));

      const newGameState = {
        ...room.gameState,
        activePlayerId: nextPlayerId,
        bombExpiresAt: Date.now() + nextTimer * 1000,
        round: nextRound
      };

      setCurrentIdx(prev => (prev + 1) % questions.length);
      setUserCorrect(prev => prev + 1);
      await updateRoomStatus(roomCode, 'PLAYING', newGameState);
    } else {
      handleBombExplosion();
    }
  };

  const handleBombExplosion = async () => {
    setIsEliminated(true);
    const survivors = (room.gameState.survivors || []).filter(id => id !== currentUserId);

    if (survivors.length <= 1) {
      const winnerId = survivors[0] || currentUserId;
      await updateRoomStatus(roomCode, 'FINISHED', { ...room.gameState, survivors, winnerId, endedAt: Date.now() });
    } else {
      const nextPlayerId = survivors[0];
      const nextRound = (room.gameState.round || 1) + 1;
      const baseTimer = room.settings?.bombTimer || 75;
      const nextTimer = Math.max(10, baseTimer - nextRound);

      await updateRoomStatus(roomCode, 'PLAYING', { ...room.gameState, survivors, activePlayerId: nextPlayerId, bombExpiresAt: Date.now() + nextTimer * 1000, round: nextRound });
    }
  };

  const handleClassicAnswer = async (selectedAns) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    let isCorrect = false;
    if (Array.isArray(currentQ.keys) && currentQ.keys.length > 0) {
      isCorrect = currentQ.keys.some(k => String(k).trim().toLowerCase() === String(selectedAns).trim().toLowerCase());
    } else {
      isCorrect = String(selectedAns).trim().toLowerCase() === String(currentQ.correctKey).trim().toLowerCase();
    }

    if (isCorrect) {
      setUserCorrect(prev => prev + 1);
      setUserScore(prev => prev + 100);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      if (isHost) {
        await updateRoomStatus(roomCode, 'FINISHED', { ...room.gameState, endedAt: Date.now() });
      } else {
        setIsEliminated(true);
      }
    }
  };

  const triggerVictoryCelebration = async (roomData) => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    try {
      const playersArray = Object.values(roomData.players || {}).map((p, idx) => ({
        id: p.id,
        elo: p.elo || 1200,
        rank: roomData.gameState?.winnerId === p.id ? 1 : idx + 2,
        gamesPlayed: 10
      }));

      const res = await fetch('/api/stats/elo/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersArray })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEloResults(data.data);
      }
    } catch (e) {
      console.warn('Elo calculation fallback');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Connecting to SATmoggle Battle Arena...</div>;
  }

  if (error || !room) {
    return (
      <div className="container-narrow" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ border: '1px solid var(--accent-red)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--accent-red)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Room Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'This battle room could not be found.'}</p>
          <button onClick={() => navigate('/lobby')} className="btn btn-primary">Return to Lobby</button>
        </div>
      </div>
    );
  }

  // --- STAGE 1: LOBBY VIEW ---
  if (room.status === 'LOBBY') {
    return (
      <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
        <div className="glass-panel" style={{ border: '1px solid rgba(0, 242, 255, 0.3)', boxShadow: 'var(--shadow-glow-cyan)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
            <div>
              <div className="flex-row" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room Code:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.75rem', color: 'var(--accent-cyan)', padding: '0.3rem 0.8rem', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  {roomCode}
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem' }}>Hosted by {room.hostName}</h2>
            </div>

            <button onClick={copyRoomLink} className="btn btn-secondary">
              {copied ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
              <span>{copied ? 'Code Copied!' : 'Share Room Code'}</span>
            </button>
          </div>

          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-box" style={{ padding: '1rem' }}>
              <div className="stat-label">Mode</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: isBombParty ? 'var(--accent-pink)' : 'var(--accent-purple)', marginTop: '0.35rem' }}>
                {isBombParty ? 'Bomb Party Royale' : 'Classic Battle'}
              </div>
            </div>
            <div className="stat-box" style={{ padding: '1rem' }}>
              <div className="stat-label">Subject</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginTop: '0.35rem' }}>{room.settings?.subject || 'Both'}</div>
            </div>
            <div className="stat-box" style={{ padding: '1rem' }}>
              <div className="stat-label">Difficulty</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', marginTop: '0.35rem' }}>{room.settings?.difficulty || 'MIXED'}</div>
            </div>
            <div className="stat-box" style={{ padding: '1rem' }}>
              <div className="stat-label">{isBombParty ? 'Bomb Timer' : 'Questions'}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.35rem' }}>{isBombParty ? `${room.settings?.bombTimer || 75}s` : `${room.settings?.gameSize || 10} Qs`}</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>Challengers in Lobby ({playersList.length})</span>
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting for host...</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem', maxHeight: '280px', overflowY: 'auto' }}>
            {playersList.map((p, idx) => (
              <div key={p.id || idx} className="flex-between" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                <div className="flex-row">
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>
                    {p.username ? p.username[0].toUpperCase() : 'P'}
                  </div>
                  <div>
                    <div className="flex-row" style={{ fontWeight: 800, color: 'white', gap: '0.5rem' }}>
                      <span>{p.username || `Player_${idx+1}`}</span>
                      {p.id === room.hostId && <span className="badge badge-amber" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>Host</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>⚡ {p.elo || 1200} Elo Rating</div>
                  </div>
                </div>
                <span className="badge badge-emerald">✓ Ready</span>
              </div>
            ))}
          </div>

          {isHost ? (
            <button onClick={handleStartMatch} className="btn btn-primary btn-lg btn-block shadow-glow-cyan">
              <Play size={20} style={{ fill: '#06080f' }} />
              <span>Launch SAT Battle Now</span>
            </button>
          ) : (
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
              Waiting for Host ({room.hostName}) to launch the battle...
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STAGE 2: FINISHED VIEW ---
  if (room.status === 'FINISHED') {
    const winner = playersList.find(p => p.id === room.gameState?.winnerId) || playersList[0];
    const isWinner = winner?.id === currentUserId;

    return (
      <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ border: '1px solid var(--accent-amber)', boxShadow: '0 0 50px rgba(255, 183, 3, 0.2)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-amber), #ff8800)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#06080f', boxShadow: '0 0 35px rgba(255, 183, 3, 0.5)' }}>
            <Trophy size={42} />
          </div>
          <span className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>{isBombParty ? 'Bomb Party Royale Champion' : 'Classic Battle Victor'}</span>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{isWinner ? '🎉 You Are the Champion!' : `${winner?.username || 'Challenger'} Wins!`}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>{isBombParty ? 'Survived the ticking hot-potato elimination!' : 'High-speed accuracy prevailed!'}</p>

          <div style={{ textAlign: 'left', marginBottom: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Elo Adjustments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {playersList.map((p, idx) => {
                const eloData = eloResults?.find(r => r.id === p.id) || { eloDelta: p.id === winner?.id ? 18 : -8, newElo: (p.elo || 1200) + (p.id === winner?.id ? 18 : -8) };
                const isPos = eloData.eloDelta >= 0;

                return (
                  <div key={p.id || idx} className="flex-between" style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: p.id === winner?.id ? 'rgba(255, 183, 3, 0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${p.id === winner?.id ? 'var(--accent-amber)' : 'var(--border-glass)'}` }}>
                    <div className="flex-row">
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-dim)' }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem' }}>{p.username || `Player_${idx+1}`}</span>
                      {p.id === winner?.id && <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 800 }}>🥇 Winner</span>}
                    </div>
                    <div className="flex-row" style={{ gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>New Elo: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{eloData.newElo}</strong></span>
                      <span className={`badge ${isPos ? 'badge-emerald' : 'badge-pink'}`}>
                        {isPos ? `+${eloData.eloDelta}` : eloData.eloDelta} Elo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-row" style={{ justifyContent: 'center' }}>
            <button onClick={() => navigate('/lobby')} className="btn btn-primary btn-lg shadow-glow-cyan">
              <span>Return to Battle Lobby</span>
              <ArrowRight size={18} />
            </button>
            {isHost && (
              <button onClick={() => updateRoomStatus(roomCode, 'LOBBY')} className="btn btn-secondary btn-lg">
                Play Another Match
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- STAGE 3: PLAYING VIEW ---
  const currentQ = questions[currentIdx];
  const isSpr = currentQ?.type === 'spr' || !currentQ?.answerOptions;
  const activePlayer = playersList.find(p => p.id === room.gameState?.activePlayerId) || playersList[0];
  const isMyTurn = activePlayer?.id === currentUserId;

  if (isBombParty) {
    return (
      <div className="container-wide" style={{ padding: '2.5rem 2rem 6rem' }}>
        {/* Top Bomb Arena Header */}
        <div className="glass-panel" style={{ padding: '1.5rem 2.5rem', marginBottom: '2.5rem', border: `1px solid ${bombTimeLeft < 15 ? 'var(--accent-red)' : 'rgba(255, 0, 127, 0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', boxShadow: bombTimeLeft < 15 ? '0 0 40px rgba(255, 51, 102, 0.4)' : 'var(--shadow-glow-pink)' }}>
          <div className="flex-row" style={{ gap: '1.25rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-red))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bomb size={32} className={bombTimeLeft < 15 ? 'animate-bounce' : ''} />
            </div>
            <div>
              <div className="flex-row" style={{ marginBottom: '0.25rem', gap: '0.5rem' }}>
                <span className="badge badge-pink">Round {room.gameState?.round || 1}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Decay: -1s / round</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'white', margin: 0 }}>
                {isMyTurn ? '🔥 YOUR TURN! DEFUSE THE BOMB!' : `Waiting for ${activePlayer?.username || 'Challenger'}...`}
              </h2>
            </div>
          </div>

          <div className="flex-row" style={{ background: 'rgba(0,0,0,0.6)', padding: '0.75rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <Clock size={24} style={{ color: bombTimeLeft < 15 ? 'var(--accent-red)' : 'var(--accent-pink)' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>Bomb Explodes In</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '2.25rem', lineHeight: 1, color: bombTimeLeft < 15 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                {Math.floor(bombTimeLeft / 60)}:{(bombTimeLeft % 60) < 10 ? '0' : ''}{bombTimeLeft % 60}
              </div>
            </div>
          </div>
        </div>

        {/* Arena Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2.5rem', alignItems: 'start' }}>
          <div>
            {isEliminated ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--accent-red)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-red)' }}>
                  <Bomb size={40} />
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>BOOM! You Were Eliminated!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
                  The bomb timer expired or an incorrect answer triggered instant detonation! You are now in <strong>Spectator Mode</strong> cheering on the survivors.
                </p>
              </div>
            ) : !isMyTurn ? (
              <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 242, 255, 0.1)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-cyan)' }}>
                  <Clock size={32} />
                </div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{activePlayer?.username} is defusing...</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Sit tight! If they defuse this question correctly, the hot-potato bomb passes to the next survivor in the ring.</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255, 0, 127, 0.4)', boxShadow: 'var(--shadow-glow-pink)' }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ⚡ Hot-Potato Question #{currentIdx + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{currentQ?.skill_desc || 'SAT Math/English'}</span>
                </div>

                <div className="question-container">
                  <QuestionRenderer content={currentQ?.stem} />
                </div>

                {isSpr ? (
                  <GridInInput value="" onSubmit={(val) => handleBombPartyAnswer(val)} />
                ) : (
                  <OptionGrid options={currentQ?.answerOptions} onSelect={(key) => handleBombPartyAnswer(key)} />
                )}
              </div>
            )}
          </div>

          {/* Right Survivors Ring List */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Survivors Ring</span>
              <span className="badge badge-pink">{(room.gameState?.survivors || []).length} Alive</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {playersList.map((p) => {
                const isAlive = (room.gameState?.survivors || []).includes(p.id);
                const isTurn = room.gameState?.activePlayerId === p.id;

                return (
                  <div key={p.id} className="flex-between" style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: isTurn ? 'rgba(255, 0, 127, 0.2)' : isAlive ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isTurn ? 'var(--accent-pink)' : isAlive ? 'var(--border-glass)' : 'rgba(255,255,255,0.02)'}`, opacity: isAlive ? 1 : 0.4 }}>
                    <div className="flex-row" style={{ gap: '0.75rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isAlive ? 'white' : 'var(--text-dim)', textDecoration: isAlive ? 'none' : 'line-through' }}>{p.username}</span>
                      {isTurn && <span className="badge badge-pink" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>Defusing</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isAlive ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                      {isAlive ? '🛡️ Alive' : '💥 Out'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for Classic Battle
  return (
    <div className="container" style={{ padding: '3rem 2rem' }}>
      <div className="glass-panel">
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Classic Battle: Question {currentIdx + 1} / {questions.length}</h2>
        <div className="question-container"><QuestionRenderer content={currentQ?.stem} /></div>
        <OptionGrid options={currentQ?.answerOptions} onSelect={(key) => handleClassicAnswer(key)} />
      </div>
    </div>
  );
}
