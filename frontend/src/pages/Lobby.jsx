import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import Modal from '../components/common/Modal';
import { getRoomsList, createRoom, joinRoom } from '../services/firebase';
import { Flame, Users, Plus, ArrowRight, ShieldAlert, Zap, Bomb, Clock, Search, Lock, Unlock, CheckCircle2 } from 'lucide-react';

export default function Lobby({ user, profile, onOpenAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') || 'BOMB_PARTY';

  const [rooms, setRooms] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState(null);

  // Create Room Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mode, setMode] = useState(defaultMode);
  const [difficulty, setDifficulty] = useState('MIXED');
  const [gameSize, setGameSize] = useState(10);
  const [subject, setSubject] = useState('both');
  const [bombTimer, setBombTimer] = useState(75); // Default 1:15 (75 seconds) as requested by user
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = getRoomsList((roomsData) => {
      setRooms(roomsData || {});
      setLoadingRooms(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!user || !profile) {
      onOpenAuth();
      return;
    }
    setCreating(true);
    setError(null);
    try {
      // Generate 6-char random alphanumeric room code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await createRoom(code, user.uid, profile.username || 'Host', {
        mode,
        difficulty,
        gameSize,
        subject,
        bombTimer: Number(bombTimer)
      });
      setCreateModalOpen(false);
      navigate(`/room/${code}`);
    } catch (err) {
      setError('Failed to create room: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    if (!user || !profile) {
      onOpenAuth();
      return;
    }
    const code = joinCode.trim().toUpperCase();
    try {
      await joinRoom(code, { id: user.uid, username: profile.username || 'Player', elo: profile.eloRating || 1200 });
      navigate(`/room/${code}`);
    } catch (err) {
      setError('Could not join room: ' + err.message);
    }
  };

  const handleJoinPublic = async (code) => {
    if (!user || !profile) {
      onOpenAuth();
      return;
    }
    try {
      await joinRoom(code, { id: user.uid, username: profile.username || 'Player', elo: profile.eloRating || 1200 });
      navigate(`/room/${code}`);
    } catch (err) {
      setError('Could not join room: ' + err.message);
    }
  };

  const activeRoomsList = Object.entries(rooms).filter(([code, r]) => r.status === 'LOBBY');

  return (
    <div className="min-h-screen py-12 px-4 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-3">
            <Flame size={14} className="text-pink-400 animate-bounce" /> Real-Time Multiplayer Arena
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">SAT Battle Lobby</h1>
          <p className="text-slate-400 text-sm">Join an active public battle or host a private Bomb Party room for friends.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Join by Code Input */}
          <form onSubmit={handleJoinByCode} className="flex items-center gap-2 flex-1 md:w-72">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Room Code (e.g. X7K9P2)"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm uppercase tracking-wider focus:border-cyan-400 focus:outline-none"
            />
            <button type="submit" className="btn-secondary py-3 px-4 text-sm whitespace-nowrap">
              Join Code
            </button>
          </form>

          {/* Create Room Button */}
          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setCreateModalOpen(true);
            }}
            className="btn-primary py-3 px-6 text-sm whitespace-nowrap shadow-lg"
          >
            <Plus size={18} />
            <span>Create Battle Room</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Public Rooms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            <span>Open Public Matches ({activeRoomsList.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Rooms in LOBBY status appear here automatically</span>
        </div>

        {loadingRooms ? (
          <div className="p-12 text-center text-slate-400 italic bg-white/5 rounded-2xl border border-white/10">
            Scanning arena for active public rooms...
          </div>
        ) : activeRoomsList.length === 0 ? (
          <GlassCard className="text-center py-12 px-6 border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <Search size={32} />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">No Open Public Rooms Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Be the first to create a public room and challenge players globally, or invite friends using a 6-character private code!
            </p>
            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else setCreateModalOpen(true);
              }}
              className="btn-primary text-sm px-6 py-2.5"
            >
              <Plus size={16} />
              <span>Host the First Match</span>
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRoomsList.map(([code, r]) => {
              const isBomb = r.settings?.mode === 'BOMB_PARTY';
              const playersCount = r.playersCount || (r.players ? Object.keys(r.players).length : 1);
              
              return (
                <GlassCard key={code} className="flex flex-col justify-between border-white/10 hover:border-cyan-400/50 group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-black text-lg px-3 py-1 rounded bg-black/50 border border-white/10 text-cyan-300 tracking-wider">
                        {code}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isBomb ? 'bg-pink-500 text-black shadow-md shadow-pink-500/20' : 'bg-purple-600 text-white'
                      }`}>
                        {isBomb ? <Bomb size={12} /> : <Zap size={12} />}
                        {isBomb ? 'Bomb Party' : 'Classic Battle'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      Host: {r.hostName || 'Challenger'}
                    </h4>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 my-4">
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/5">
                        Subject: <strong className="text-white uppercase">{r.settings?.subject || 'Both'}</strong>
                      </span>
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/5">
                        Diff: <strong className="text-amber-400 uppercase">{r.settings?.difficulty || 'MIXED'}</strong>
                      </span>
                      {isBomb && (
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 flex items-center gap-1">
                          <Clock size={12} className="text-pink-400" />
                          <strong className="text-pink-300">{r.settings?.bombTimer || 75}s Timer</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Users size={14} className="text-cyan-400" />
                      <span>{playersCount} Active Players</span>
                    </span>
                    <button
                      onClick={() => handleJoinPublic(code)}
                      className="btn-primary text-xs px-5 py-2 shadow-sm"
                    >
                      <span>Join Battle</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="⚔️ Configure Battle Room" maxWidth="max-w-lg">
        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-heading">Game Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('BOMB_PARTY')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'BOMB_PARTY'
                    ? 'bg-gradient-to-br from-pink-500/20 to-red-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-pink-400 mb-1">
                  <Bomb size={16} />
                  <span>Bomb Party Royale</span>
                </div>
                <div className="text-[11px] text-slate-300">Ticking hot-potato elimination. Answer fast or explode!</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('CLASSIC')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'CLASSIC'
                    ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-purple-400 mb-1">
                  <Zap size={16} />
                  <span>Classic Racing</span>
                </div>
                <div className="text-[11px] text-slate-300">Fast-paced leaderboard race. Accuracy + speed score.</div>
              </button>
            </div>
          </div>

          {/* Bomb Timer Slider (Only for Bomb Party) */}
          {mode === 'BOMB_PARTY' && (
            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-pink-300 font-heading flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Customizable Bomb Timer (Default 1:15 / 75s)</span>
                </label>
                <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded bg-black/60 text-pink-400 border border-pink-500/30">
                  {Math.floor(bombTimer / 60)}:{(bombTimer % 60) < 10 ? '0' : ''}{bombTimer % 60} ({bombTimer}s)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[30, 45, 60, 75, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setBombTimer(sec)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bombTimer === sec
                        ? 'bg-pink-500 text-black shadow-md shadow-pink-500/30'
                        : 'bg-black/40 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {sec === 75 ? '★ 1:15' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-heading">Subject Focus</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="both">Both Math & English</option>
                <option value="math">Math & Grid-ins Only</option>
                <option value="english">Reading & Writing Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-heading">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="MIXED">Mixed / Adaptive</option>
                <option value="E">Easy (Band 1-3)</option>
                <option value="M">Medium (Band 4-5)</option>
                <option value="H">Hard (Band 6-7)</option>
              </select>
            </div>
          </div>

          {/* Game Size */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-heading">Number of Questions (Classic Mode)</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setGameSize(cnt)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                    gameSize === cnt
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary px-5 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn-primary px-6 py-2 text-sm shadow-lg">
              {creating ? 'Creating Room...' : 'Launch Battle Lobby'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
