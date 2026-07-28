import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [bombTimer, setBombTimer] = useState(75); // Default 1:15 (75s) as requested
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
    setCreating(true);
    setError(null);
    try {
      const hostId = user?.uid || profile?.uid || 'guest_' + Math.random().toString(36).substr(2, 6);
      const hostName = profile?.username || user?.displayName || 'GuestHost';
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      await createRoom(code, hostId, hostName, {
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
    const code = joinCode.trim().toUpperCase();
    try {
      const playerId = user?.uid || profile?.uid || 'guest_' + Math.random().toString(36).substr(2, 6);
      const playerName = profile?.username || user?.displayName || 'GuestPlayer';
      const playerElo = profile?.eloRating || 1200;

      await joinRoom(code, { id: playerId, username: playerName, elo: playerElo });
      navigate(`/room/${code}`);
    } catch (err) {
      setError('Could not join room: ' + err.message);
    }
  };

  const handleJoinPublic = async (code) => {
    try {
      const playerId = user?.uid || profile?.uid || 'guest_' + Math.random().toString(36).substr(2, 6);
      const playerName = profile?.username || user?.displayName || 'GuestPlayer';
      const playerElo = profile?.eloRating || 1200;

      await joinRoom(code, { id: playerId, username: playerName, elo: playerElo });
      navigate(`/room/${code}`);
    } catch (err) {
      setError('Could not join room: ' + err.message);
    }
  };

  const activeRoomsList = Object.entries(rooms).filter(([code, r]) => r.status === 'LOBBY');

  return (
    <div className="container-wide" style={{ padding: '3rem 2rem 6rem' }}>
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
        <div>
          <div className="flex-row" style={{ marginBottom: '0.75rem' }}>
            <span className="badge badge-pink">🔥 Real-Time Multiplayer Arena</span>
            <span className="badge badge-cyan">Sub-Second Sync</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }}>SAT Battle Lobby</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Join an open public match or host a private Bomb Party room for friends. No account required!</p>
        </div>

        <div className="flex-row" style={{ flexWrap: 'wrap', gap: '1rem', width: '100%', maxWidth: '600px', justifyContent: 'flex-end' }}>
          {/* Join by Code Input */}
          <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Room Code (e.g. X7K9P2)"
              maxLength={6}
              className="form-input"
              style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.85rem 1.25rem' }}>
              Join Code
            </button>
          </form>

          {/* Create Room Button */}
          <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary shadow-glow-cyan" style={{ padding: '0.85rem 1.75rem' }}>
            <Plus size={20} />
            <span>Create Battle Room</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem 1.5rem', borderRadius: '14px', background: 'rgba(255, 51, 102, 0.15)', border: '1px solid var(--accent-red)', color: '#ff8099', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ fontWeight: 700, textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      {/* Public Rooms Grid */}
      <div style={{ marginBottom: '4rem' }}>
        <div className="flex-between" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Open Public Matches ({activeRoomsList.length})</span>
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rooms in LOBBY status appear here automatically</span>
        </div>

        {loadingRooms ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Scanning arena for active public matches...
          </div>
        ) : activeRoomsList.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-dim)' }}>
              <Search size={32} />
            </div>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Open Public Rooms Found</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 2rem' }}>
              Be the first to create a public battle room and challenge players globally, or invite friends using a 6-character private code!
            </p>
            <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary shadow-glow-cyan">
              <Plus size={18} />
              <span>Host the First Match</span>
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {activeRoomsList.map(([code, r]) => {
              const isBomb = r.settings?.mode === 'BOMB_PARTY';
              const playersCount = r.playersCount || (r.players ? Object.keys(r.players).length : 1);
              
              return (
                <div key={code} className="glass-card" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.25rem', padding: '0.35rem 0.85rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                        {code}
                      </span>
                      <span className={`badge ${isBomb ? 'badge-pink' : 'badge-purple'}`}>
                        {isBomb ? <Bomb size={14} /> : <Zap size={14} />}
                        {isBomb ? 'Bomb Party Royale' : 'Classic Racing'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'white' }}>
                      Host: {r.hostName || 'Challenger'}
                    </h4>

                    <div className="flex-wrap" style={{ gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        Subject: <strong style={{ color: 'white' }}>{r.settings?.subject || 'Both'}</strong>
                      </span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-amber)' }}>
                        Diff: <strong style={{ color: 'var(--accent-amber)' }}>{r.settings?.difficulty || 'MIXED'}</strong>
                      </span>
                      {isBomb && (
                        <span className="badge badge-pink">
                          <Clock size={12} />
                          <span>{r.settings?.bombTimer || 75}s Timer</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-between" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span>{playersCount} Active Players</span>
                    </span>
                    <button onClick={() => handleJoinPublic(code)} className="btn btn-primary btn-sm">
                      <span>Join Battle</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="⚔️ Configure Battle Room" maxWidth="520px">
        <form onSubmit={handleCreateRoom}>
          {/* Game Mode Selection */}
          <div className="form-group">
            <label className="form-label">Game Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setMode('BOMB_PARTY')}
                style={{ padding: '1.25rem', borderRadius: '14px', border: `1px solid ${mode === 'BOMB_PARTY' ? 'var(--accent-pink)' : 'var(--border-glass)'}`, background: mode === 'BOMB_PARTY' ? 'rgba(255, 0, 127, 0.15)' : 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: mode === 'BOMB_PARTY' ? 'var(--shadow-glow-pink)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--accent-pink)', marginBottom: '0.35rem' }}>
                  <Bomb size={18} />
                  <span>Bomb Party Royale</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Ticking hot-potato elimination. Answer fast or explode!</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('CLASSIC')}
                style={{ padding: '1.25rem', borderRadius: '14px', border: `1px solid ${mode === 'CLASSIC' ? 'var(--accent-purple)' : 'var(--border-glass)'}`, background: mode === 'CLASSIC' ? 'rgba(157, 78, 221, 0.15)' : 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: mode === 'CLASSIC' ? 'var(--shadow-glow-purple)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--accent-purple)', marginBottom: '0.35rem' }}>
                  <Zap size={18} />
                  <span>Classic Racing</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Fast-paced leaderboard race. Accuracy + speed score.</div>
              </button>
            </div>
          </div>

          {/* Customizable Bomb Timer (Default 1:15 / 75s as requested) */}
          {mode === 'BOMB_PARTY' && (
            <div className="form-group" style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255, 0, 127, 0.08)', border: '1px solid rgba(255, 0, 127, 0.3)' }}>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Clock size={16} />
                  <span>Customizable Bomb Timer</span>
                </label>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', color: 'var(--accent-pink)', border: '1px solid rgba(255,0,127,0.4)' }}>
                  {Math.floor(bombTimer / 60)}:{(bombTimer % 60) < 10 ? '0' : ''}{bombTimer % 60} ({bombTimer}s)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[30, 45, 60, 75, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setBombTimer(sec)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', background: bombTimer === sec ? 'var(--accent-pink)' : 'rgba(0,0,0,0.4)', color: bombTimer === sec ? '#06080f' : 'var(--text-muted)', border: `1px solid ${bombTimer === sec ? 'var(--accent-pink)' : 'var(--border-glass)'}`, transition: 'all 0.2s ease' }}
                  >
                    {sec === 75 ? '★ 1:15' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Focus</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="form-select">
                <option value="both">Both Math & English</option>
                <option value="math">Math & Grid-ins Only</option>
                <option value="english">Reading & Writing Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Band</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="form-select">
                <option value="MIXED">Mixed / Adaptive</option>
                <option value="E">Easy (Band 1-3)</option>
                <option value="M">Medium (Band 4-5)</option>
                <option value="H">Hard (Band 6-7)</option>
              </select>
            </div>
          </div>

          {/* Number of Questions */}
          <div className="form-group">
            <label className="form-label">Questions in Match (Classic Mode)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setGameSize(cnt)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', background: gameSize === cnt ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.03)', color: gameSize === cnt ? '#06080f' : 'var(--text-muted)', border: `1px solid ${gameSize === cnt ? 'var(--accent-cyan)' : 'var(--border-glass)'}`, transition: 'all 0.2s ease' }}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn btn-primary shadow-glow-cyan">
              {creating ? 'Launching Room...' : 'Launch Battle Lobby'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
