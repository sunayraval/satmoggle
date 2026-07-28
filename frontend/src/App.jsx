import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AuthModal from './components/common/AuthModal';
import FirebaseGuideModal from './components/common/FirebaseGuideModal';
import Home from './pages/Home';
import SinglePlayer from './pages/SinglePlayer';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import Leaderboards from './pages/Leaderboards';
import Profile from './pages/Profile';
import { auth, isDemoMode, subscribeToUserProfile } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [firebaseGuideOpen, setFirebaseGuideOpen] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      // Load from localStorage in demo mode
      const savedUser = localStorage.getItem('satmoggle_mock_user');
      const savedProfile = localStorage.getItem('satmoggle_mock_profile');
      if (savedUser && savedProfile) {
        setUser(JSON.parse(savedUser));
        setProfile(JSON.parse(savedProfile));
      } else {
        // Create default guest if none
        const defaultUser = { uid: 'usr_demo_1001', email: 'guest@satmoggle.edu', isAnonymous: true };
        const defaultProfile = {
          uid: 'usr_demo_1001',
          username: 'DemoChampion',
          email: 'guest@satmoggle.edu',
          eloRating: 1250,
          gamesPlayed: 12,
          wins: 8,
          winRate: 66.7,
          subjectStats: {
            math: { correct: 45, total: 60, elo: 1260 },
            english: { correct: 38, total: 50, elo: 1240 }
          },
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('satmoggle_mock_user', JSON.stringify(defaultUser));
        localStorage.setItem('satmoggle_mock_profile', JSON.stringify(defaultProfile));
        setUser(defaultUser);
        setProfile(defaultProfile);
      }
      return;
    }

    // Live Cloud Firebase Mode
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        subscribeToUserProfile(fbUser.uid, (profData) => {
          setProfile(profData);
        });
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleAuthSuccess = () => {
    if (isDemoMode) {
      const savedUser = localStorage.getItem('satmoggle_mock_user');
      const savedProfile = localStorage.getItem('satmoggle_mock_profile');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#08090f] text-[#f8fafc]">
        <Navbar
          user={user}
          profile={profile}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenFirebaseGuide={() => setFirebaseGuideOpen(true)}
          isDemoMode={isDemoMode}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home user={user} isDemoMode={isDemoMode} onOpenAuth={() => setAuthModalOpen(true)} onOpenFirebaseGuide={() => setFirebaseGuideOpen(true)} />} />
            <Route path="/singleplayer" element={<SinglePlayer user={user} profile={profile} />} />
            <Route path="/lobby" element={<Lobby user={user} profile={profile} onOpenAuth={() => setAuthModalOpen(true)} />} />
            <Route path="/room/:roomCode" element={<Room user={user} profile={profile} onOpenAuth={() => setAuthModalOpen(true)} />} />
            <Route path="/leaderboards" element={<Leaderboards user={user} profile={profile} />} />
            <Route path="/profile" element={<Profile user={user} profile={profile} onOpenAuth={() => setAuthModalOpen(true)} />} />
          </Routes>
        </main>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        <FirebaseGuideModal
          isOpen={firebaseGuideOpen}
          onClose={() => setFirebaseGuideOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
