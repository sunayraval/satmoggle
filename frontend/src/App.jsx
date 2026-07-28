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
import { auth, isDemoMode, subscribeToUserProfile, getMockUser, getMockProfile } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [firebaseGuideOpen, setFirebaseGuideOpen] = useState(false);

  // Initialize or fetch user session (Guest play allowed without login!)
  useEffect(() => {
    const initGuestSession = () => {
      try {
        const savedUser = localStorage.getItem('satmoggle_guest_user');
        const savedProfile = localStorage.getItem('satmoggle_guest_profile');
        if (savedUser && savedProfile) {
          setUser(JSON.parse(savedUser));
          setProfile(JSON.parse(savedProfile));
        } else {
          const guestId = 'usr_guest_' + Math.random().toString(36).substring(2, 7);
          const randomNames = ['SpeedDemon', 'SAT_Master', 'CalcWizard', 'GrammarGod', 'ApexStudent', 'ViteChallenger'];
          const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)] + '_' + Math.floor(10 + Math.random() * 90);
          
          const defaultUser = { uid: guestId, email: 'guest@satmoggle.edu', isAnonymous: true };
          const defaultProfile = {
            uid: guestId,
            username: chosenName,
            email: 'guest@satmoggle.edu',
            eloRating: 1250,
            gamesPlayed: 14,
            wins: 9,
            winRate: 64.3,
            isGuest: true,
            subjectStats: {
              math: { correct: 48, total: 65, elo: 1265 },
              english: { correct: 42, total: 55, elo: 1235 }
            },
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('satmoggle_guest_user', JSON.stringify(defaultUser));
          localStorage.setItem('satmoggle_guest_profile', JSON.stringify(defaultProfile));
          setUser(defaultUser);
          setProfile(defaultProfile);
        }
      } catch (err) {
        console.error("Local storage error:", err);
      }
    };

    // If Firebase Auth is not available or we are in Demo Mode, fallback immediately to prevent crashing
    if (!auth || isDemoMode) {
      initGuestSession();
      return;
    }

    // Live Cloud Firebase Mode
    try {
      const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser(fbUser);
          subscribeToUserProfile(fbUser.uid, (profData) => {
            if (profData) {
              setProfile(profData);
            } else {
              // Fallback profile if Firestore document is pending
              setProfile({
                uid: fbUser.uid,
                username: fbUser.displayName || fbUser.email?.split('@')[0] || 'Player',
                email: fbUser.email || 'guest@satmoggle.edu',
                eloRating: 1200,
                gamesPlayed: 0,
                wins: 0,
                winRate: 0,
                isGuest: fbUser.isAnonymous
              });
            }
          });
        } else {
          // Automatically default to Guest Play if no cloud auth session!
          initGuestSession();
        }
      }, (error) => {
        console.error("Firebase onAuthStateChanged error:", error);
        initGuestSession();
      });

      return () => unsubscribeAuth();
    } catch (err) {
      console.error("Critical error in App Auth Effect:", err);
      initGuestSession();
    }
  }, []);

  const handleAuthSuccess = () => {
    // If auth succeeds, re-sync state
    if (isDemoMode) {
      const savedUser = localStorage.getItem('satmoggle_guest_user');
      const savedProfile = localStorage.getItem('satmoggle_guest_profile');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    }
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar
          user={user}
          profile={profile}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenFirebaseGuide={() => setFirebaseGuideOpen(true)}
          isDemoMode={isDemoMode}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} profile={profile} isDemoMode={isDemoMode} onOpenAuth={() => setAuthModalOpen(true)} onOpenFirebaseGuide={() => setFirebaseGuideOpen(true)} />} />
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
