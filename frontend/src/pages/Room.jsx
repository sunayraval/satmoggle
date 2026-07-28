import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import QuestionRenderer from '../components/question/QuestionRenderer';
import OptionGrid from '../components/question/OptionGrid';
import GridInInput from '../components/question/GridInInput';
import { subscribeToRoom, updateRoomStatus, updateUserEloAndStats } from '../services/firebase';
import confetti from 'canvas-confetti';
import { Bomb, Zap, Users, Trophy, Clock, CheckCircle2, Copy, Check, ArrowRight, ShieldAlert, Share2, Play, Flame, AlertTriangle } from 'lucide-react';

export default function Room({ user, profile, onOpenAuth }) {
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

  // Audio / Visual FX refs
  const explosionRef = useRef(false);

  // Subscribe to real-time room state
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

      // If room transitioned to PLAYING and we don't have questions loaded yet, let's load or sync
      if (roomData.status === 'PLAYING' && roomData.gameState?.questions && questions.length === 0) {
        setQuestions(roomData.gameState.questions);
        setCurrentIdx(0);
        setUserScore(0);
        setUserCorrect(0);
        setIsEliminated(false);
      }

      // If room transitioned to FINISHED, calculate Elo and trigger confetti
      if (roomData.status === 'FINISHED' && !eloResults && roomData.players) {
        triggerVictoryCelebration(roomData);
      }
    });
    return () => unsubscribe();
  }, [roomCode, questions.length, eloResults]);

  // Bomb Party Countdown Timer Effect
  useEffect(() => {
    if (!room || room.status !== 'PLAYING' || room.settings?.mode !== 'BOMB_PARTY') return;
    const gameState = room.gameState;
    if (!gameState || !gameState.bombExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((gameState.bombExpiresAt - Date.now()) / 1000);
      setBombTimeLeft(Math.max(0, remaining));

      // If timer hits 0 and it's our turn, trigger elimination!
      if (remaining <= 0 && gameState.activePlayerId === user?.uid && !explosionRef.current) {
        explosionRef.current = true;
        handleBombExplosion();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [room, user]);

  const copyRoomLink = () => {
    const url = window.location.origin + `/lobby`;
    navigator.clipboard.writeText(`Join my SATmoggle Battle! Code: ${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHost = user && room && room.hostId === user.uid;
  const isBombParty = room?.settings?.mode === 'BOMB_PARTY';
  const playersList = room?.players ? Object.values(room.players) : [];

  // Host Action: Start Match
  const handleStartMatch = async () => {
    if (!isHost) return;
    try {
      const { subject = 'both', difficulty = 'MIXED', gameSize = 10, bombTimer = 75 } = room.settings || {};
      const count = isBombParty ? 30 : gameSize; // More questions for Bomb Party hot-potato loop
      const res = await fetch(`/api/questions/random?subject=${subject}&difficulty=${difficulty}&count=${count}`);
      const data = await res.json();

      if (!data.success || !data.data || data.data.length === 0) {
        throw new Error('Failed to load questions for battle.');
      }

      const initialSurvivors = playersList.map(p => p.id);
      const firstPlayerId = initialSurvivors[0];

      const gameState = {
        questions: data.data,
        activePlayerId: firstPlayerId,
        bombExpiresAt: Date.now() + bombTimer * 1000,
        round: 1,
        timeDecay: 1, // Deduct 1s each round
        survivors: initialSurvivors,
        startedAt: Date.now()
      };

      await updateRoomStatus(roomCode, 'PLAYING', gameState);
    } catch (err) {
      alert('Could not start match: ' + err.message);
    }
  };

  // Answer Submission for Bomb Party Mode
  const handleBombPartyAnswer = async (selectedAns) => {
    if (!room || !room.gameState || room.gameState.activePlayerId !== user?.uid) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    let isCorrect = false;
    if (Array.isArray(currentQ.keys) && currentQ.keys.length > 0) {
      isCorrect = currentQ.keys.some(k => String(k).trim().toLowerCase() === String(selectedAns).trim().toLowerCase());
    } else if (currentQ.correct_answer && Array.isArray(currentQ.correct_answer)) {
      isCorrect = currentQ.correct_answer.some(k => String(k).trim().toLowerCase() === String(selectedAns).trim().toLowerCase());
    } else if (currentQ.answer?.correct_choice) {
      isCorrect = String(selectedAns).trim().toLowerCase() === String(currentQ.answer.correct_choice).trim().toLowerCase();
    }

    if (isCorrect) {
      // BOMB DEFUSED! Pass to next survivor
      explosionRef.current = false;
      const survivors = room.gameState.survivors || [];
      const currentPos = survivors.indexOf(user.uid);
      const nextPos = (currentPos + 1) % survivors.length;
      const nextPlayerId = survivors[nextPos];

      const nextRound = (room.gameState.round || 1) + 1;
      const baseTimer = room.settings?.bombTimer || 75;
      const nextTimer = Math.max(10, baseTimer - nextRound * (room.gameState.timeDecay || 1)); // Don't decay below 10s

      const newGameState = {
        ...room.gameState,
        activePlayerId: nextPlayerId,
        bombExpiresAt: Date.now() + nextTimer * 1000,
        round: nextRound
      };

      // Advance question index for next player
      setCurrentIdx(prev => (prev + 1) % questions.length);
      setUserCorrect(prev => prev + 1);
      await updateRoomStatus(roomCode, 'PLAYING', newGameState);
    } else {
      // INCORRECT! Instant explosion in Bomb Party mode!
      handleBombExplosion();
    }
  };

  const handleBombExplosion = async () => {
    setIsEliminated(true);
    const survivors = (room.gameState.survivors || []).filter(id => id !== user?.uid);

    if (survivors.length <= 1) {
      // WE HAVE A WINNER! End match
      const winnerId = survivors[0] || user?.uid;
      const newGameState = {
        ...room.gameState,
        survivors,
        winnerId,
        endedAt: Date.now()
      };
      await updateRoomStatus(roomCode, 'FINISHED', newGameState);
    } else {
      // Pass bomb to next remaining survivor
      const nextPlayerId = survivors[0];
      const nextRound = (room.gameState.round || 1) + 1;
      const baseTimer = room.settings?.bombTimer || 75;
      const nextTimer = Math.max(10, baseTimer - nextRound);

      const newGameState = {
        ...room.gameState,
        survivors,
        activePlayerId: nextPlayerId,
        bombExpiresAt: Date.now() + nextTimer * 1000,
        round: nextRound
      };
      await updateRoomStatus(roomCode, 'PLAYING', newGameState);
    }
  };

  // Answer Submission for Classic Racing Mode
  const handleClassicAnswer = async (selectedAns) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    let isCorrect = false;
    if (Array.isArray(currentQ.keys) && currentQ.keys.length > 0) {
      isCorrect = currentQ.keys.some(k => String(k).trim().toLowerCase() === String(selectedAns).trim().toLowerCase());
    } else if (currentQ.answer?.correct_choice) {
      isCorrect = String(selectedAns).trim().toLowerCase() === String(currentQ.answer.correct_choice).trim().toLowerCase();
    }

    if (isCorrect) {
      setUserCorrect(prev => prev + 1);
      setUserScore(prev => prev + 100);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Finished all questions!
      if (isHost) {
        await updateRoomStatus(roomCode, 'FINISHED', { ...room.gameState, endedAt: Date.now() });
      } else {
        setIsEliminated(true); // Mark locally finished as waiting
      }
    }
  };

  const triggerVictoryCelebration = async (roomData) => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    
    // Calculate Elo for multiplayer
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
        // Save to user profile if applicable
        const myElo = data.data.find(r => r.id === user?.uid);
        if (myElo && user && profile) {
          await updateUserEloAndStats(user.uid, {
            eloDelta: myElo.eloDelta,
            isWin: roomData.gameState?.winnerId === user.uid,
            subject: roomData.settings?.subject === 'math' ? 'math' : 'english',
            correctAnswers: userCorrect,
            totalQuestions: questions.length
          });
        }
      }
    } catch (e) {
      console.error('Failed to calculate Elo:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-body text-slate-400 italic">
        Connecting to SATmoggle Arena...
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-body">
        <GlassCard className="max-w-md w-full text-center p-8 border-red-500/30">
          <ShieldAlert size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Room Unavailable</h3>
          <p className="text-xs text-slate-400 mb-6">{error || 'This battle room could not be found.'}</p>
          <button onClick={() => navigate('/lobby')} className="btn-primary w-full py-3 justify-center text-sm">
            Return to Lobby
          </button>
        </GlassCard>
      </div>
    );
  }

  // --- LOBBY VIEW (WAITING FOR HOST TO START) ---
  if (room.status === 'LOBBY') {
    return (
      <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto font-body">
        <GlassCard className="p-8 md:p-10 border-cyan-500/30 shadow-2xl space-y-8">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-heading">Room Code:</span>
                <span className="font-mono font-black text-2xl text-cyan-300 px-3 py-1 rounded bg-black/50 border border-cyan-500/30">
                  {roomCode}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Hosted by {room.hostName}</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyRoomLink}
                className="btn-secondary px-4 py-2.5 text-xs flex items-center gap-1.5 border-white/20"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Code Copied!' : 'Share Room Code'}</span>
              </button>
            </div>
          </div>

          {/* Game Settings Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Mode</span>
              <span className={`text-sm font-black uppercase font-heading flex items-center justify-center gap-1 mt-1 ${isBombParty ? 'text-pink-400' : 'text-purple-400'}`}>
                {isBombParty ? <Bomb size={14} /> : <Zap size={14} />}
                {isBombParty ? 'Bomb Party' : 'Classic Racing'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Subject</span>
              <span className="text-sm font-black text-white uppercase font-heading mt-1 block">
                {room.settings?.subject || 'Both'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Difficulty</span>
              <span className="text-sm font-black text-amber-400 uppercase font-heading mt-1 block">
                {room.settings?.difficulty || 'MIXED'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">{isBombParty ? 'Bomb Timer' : 'Questions'}</span>
              <span className="text-sm font-black text-cyan-300 font-heading mt-1 block">
                {isBombParty ? `${room.settings?.bombTimer || 75}s (1:15)` : `${room.settings?.gameSize || 10} Qs`}
              </span>
            </div>
          </div>

          {/* Players List */}
          <div>
            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                <span>Challengers in Arena ({playersList.length})</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">Waiting for host to launch...</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {playersList.map((p, idx) => (
                <div key={p.id || idx} className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-md">
                      {p.username ? p.username[0].toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2 font-heading">
                        <span>{p.username || `Player_${idx+1}`}</span>
                        {p.id === room.hostId && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-black uppercase">Host</span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-400">⚡ {p.elo || 1200} Elo Rating</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Ready
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Action or Waiting Message */}
          <div className="pt-4 border-t border-white/10 text-center">
            {isHost ? (
              <button
                onClick={handleStartMatch}
                className="btn-primary w-full py-4 justify-center text-lg font-heading shadow-xl animate-pulse"
              >
                <Play size={20} className="fill-black" />
                <span>Launch SAT Battle Now</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 font-semibold flex items-center justify-center gap-2">
                <Clock size={16} className="text-cyan-400 animate-spin" />
                <span>Waiting for Host ({room.hostName}) to start the match... Get ready!</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- FINISHED VIEW (VICTORY CELEBRATION & ELO LEADERBOARD) ---
  if (room.status === 'FINISHED') {
    const winner = playersList.find(p => p.id === room.gameState?.winnerId) || playersList[0];
    const isWinner = winner?.id === user?.uid;

    return (
      <div className="min-h-screen py-12 px-4 max-w-3xl mx-auto font-body text-center">
        <GlassCard className="p-8 md:p-12 border-amber-500/40 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Gold Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-bounce">
            <Trophy size={40} className="text-black fill-black" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3 inline-block">
              {isBombParty ? 'Bomb Party Royale Champion' : 'Classic Battle Victor'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading">
              {isWinner ? '🎉 You Are the Champion!' : `${winner?.username || 'Challenger'} Wins!`}
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              {isBombParty ? 'Survived the ticking hot-potato elimination!' : 'High-speed accuracy and mastery prevailed!'}
            </p>
          </div>

          {/* Elo Adjustments Table */}
          <div className="text-left space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-heading">Global Elo Rating Adjustments:</h3>
            <div className="space-y-2">
              {playersList.map((p, idx) => {
                const eloData = eloResults?.find(r => r.id === p.id) || { eloDelta: p.id === winner?.id ? 18 : -8, newElo: (p.elo || 1200) + (p.id === winner?.id ? 18 : -8) };
                const isPos = eloData.eloDelta >= 0;

                return (
                  <div key={p.id || idx} className={`p-4 rounded-xl border flex items-center justify-between ${p.id === winner?.id ? 'bg-amber-500/15 border-amber-500/40 shadow-md' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-sm text-slate-400">#{idx + 1}</span>
                      <span className="font-bold text-white font-heading">{p.username || `Player_${idx+1}`}</span>
                      {p.id === winner?.id && <span className="text-xs text-amber-400 font-bold">🥇 Winner</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">New Elo: <strong className="text-white font-mono">{eloData.newElo}</strong></span>
                      <span className={`px-2.5 py-1 rounded font-bold font-mono text-xs ${isPos ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {isPos ? `+${eloData.eloDelta}` : eloData.eloDelta} Elo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/lobby')} className="btn-primary px-8 py-3.5 text-base">
              <span>Return to Battle Lobby</span>
              <ArrowRight size={18} />
            </button>
            {isHost && (
              <button
                onClick={() => updateRoomStatus(roomCode, 'LOBBY')}
                className="btn-secondary px-8 py-3.5 text-base border-white/20"
              >
                Play Another Match
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- PLAYING VIEW (BOMB PARTY ROYALE OR CLASSIC ARENA) ---
  const currentQ = questions[currentIdx];
  const isSpr = currentQ?.type === 'spr' || (!currentQ?.answerOptions?.length && !currentQ?.answer?.choices);
  const activePlayer = playersList.find(p => p.id === room.gameState?.activePlayerId) || playersList[0];
  const isMyTurn = activePlayer?.id === user?.uid;

  if (isBombParty) {
    return (
      <div className="min-h-screen py-8 px-4 max-w-6xl mx-auto font-body space-y-6">
        {/* Top Bomb Arena Header */}
        <div className="glass-panel p-6 rounded-2xl border-pink-500/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Ticking background pulsation */}
          <div className={`absolute inset-0 bg-gradient-to-r from-pink-600/10 via-red-600/10 to-transparent transition-opacity duration-300 ${bombTimeLeft < 15 ? 'opacity-100 animate-pulse' : 'opacity-20'}`} />

          <div className="flex items-center gap-4 z-10">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-red-600 flex items-center justify-center text-black shadow-lg shadow-pink-500/30 ${bombTimeLeft < 15 ? 'animate-bounce' : 'animate-pulse-glow'}`}>
              <Bomb size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500 text-black">Round {room.gameState?.round || 1}</span>
                <span className="text-xs text-slate-400 font-semibold">Decay: -1s / round</span>
              </div>
              <h2 className="text-2xl font-black text-white font-heading mt-1">
                {isMyTurn ? '🔥 YOUR TURN! DEFUSE THE BOMB!' : `Waiting for ${activePlayer?.username || 'Challenger'}...`}
              </h2>
            </div>
          </div>

          {/* Giant Countdown Clock */}
          <div className="flex items-center gap-3 z-10 bg-black/60 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
            <Clock size={24} className={bombTimeLeft < 15 ? 'text-red-500 animate-spin' : 'text-pink-400'} />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bomb Explodes In</span>
              <span className={`font-mono font-black text-3xl tracking-wider ${bombTimeLeft < 15 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                {Math.floor(bombTimeLeft / 60)}:{(bombTimeLeft % 60) < 10 ? '0' : ''}{bombTimeLeft % 60}
              </span>
            </div>
          </div>
        </div>

        {/* Main Arena Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center Question Box */}
          <div className="lg:col-span-8">
            {isEliminated ? (
              <GlassCard className="p-12 text-center border-red-500/40 space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center mx-auto animate-bounce">
                  <Bomb size={40} />
                </div>
                <h3 className="text-3xl font-black text-white font-heading">BOOM! You Were Eliminated!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  The bomb timer expired or an incorrect answer triggered instant detonation! You are now in <strong>Spectator Mode</strong> cheering on the survivors.
                </p>
              </GlassCard>
            ) : !isMyTurn ? (
              <GlassCard className="p-12 text-center border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
                  <Clock size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white font-heading">{activePlayer?.username} is defusing...</h3>
                <p className="text-xs text-slate-400">Sit tight! If they defuse this question correctly, the hot-potato bomb passes to the next survivor in the ring.</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-6 md:p-8 border-pink-500/40 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-wider font-heading">
                    ⚡ Hot-Potato Question #{currentIdx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{currentQ?.skill_desc || 'SAT Math/English'}</span>
                </div>

                <div className="text-lg font-medium text-white mb-6 leading-relaxed">
                  <QuestionRenderer content={currentQ?.stem || currentQ?.prompt} />
                </div>

                {isSpr ? (
                  <GridInInput
                    value=""
                    onSubmit={(val) => handleBombPartyAnswer(val)}
                  />
                ) : (
                  <OptionGrid
                    options={currentQ?.answerOptions || currentQ?.answer?.choices}
                    onSelect={(ansKey) => handleBombPartyAnswer(ansKey)}
                  />
                )}
              </GlassCard>
            )}
          </div>

          {/* Right Survivors Ring List */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard className="p-6 border-white/10 space-y-4">
              <h4 className="font-bold text-white text-base font-heading flex items-center justify-between">
                <span>Survivors Ring</span>
                <span className="text-xs text-pink-400 font-bold">{(room.gameState?.survivors || []).length} Alive</span>
              </h4>

              <div className="space-y-2">
                {playersList.map((p) => {
                  const isAlive = (room.gameState?.survivors || []).includes(p.id);
                  const isTurn = room.gameState?.activePlayerId === p.id;

                  return (
                    <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isTurn ? 'bg-pink-500/20 border-pink-500 shadow-md ring-1 ring-pink-400' :
                      isAlive ? 'bg-white/5 border-white/10 text-white' : 'bg-black/40 border-white/5 opacity-40 text-slate-500 line-through'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold font-heading">{p.username}</span>
                        {isTurn && <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-pink-500 text-black uppercase animate-pulse">Defusing</span>}
                      </div>
                      <span className="text-xs font-bold">{isAlive ? '🛡️ Alive' : '💥 Eliminated'}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for Classic Mode
  return (
    <div className="min-h-screen py-8 px-4 max-w-6xl mx-auto font-body space-y-6">
      <header className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div className="font-heading font-black text-lg text-white">Classic Battle: Question {currentIdx + 1} / {questions.length}</div>
        <div className="font-mono text-cyan-300 font-bold">Score: {userScore}</div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GlassCard className="p-6">
            <div className="text-lg text-white mb-6">
              <QuestionRenderer content={currentQ?.stem || currentQ?.prompt} />
            </div>
            <OptionGrid
              options={currentQ?.answerOptions || currentQ?.answer?.choices}
              onSelect={(ansKey) => handleClassicAnswer(ansKey)}
            />
          </GlassCard>
        </div>
        <div className="lg:col-span-4">
          <GlassCard className="p-6">
            <h4 className="font-bold text-white mb-4">Live Racing Progress</h4>
            {playersList.map((p, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs text-white mb-1">
                  <span>{p.username}</span>
                  <span>{p.score || 0} pts</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${((p.score || 0)/1000)*100}%` }} />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
