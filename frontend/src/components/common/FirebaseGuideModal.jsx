import React, { useState } from 'react';
import Modal from './Modal';
import { Key, Copy, Check, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';

export default function FirebaseGuideModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  const envTemplate = `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔥 How to Configure Live Cloud Firebase" maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(157, 78, 221, 0.1))', border: '1px solid rgba(0, 242, 255, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <ShieldCheck size={24} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <h4 style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', marginBottom: '0.35rem' }}>Seamless Dual-Mode Architecture</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              SATmoggle works out-of-the-box in <strong>Local Guest Mode</strong>! When you are ready for real-time multiplayer over the internet and persistent user Elo tracking across devices, follow the 4 simple steps below to connect your Firebase project.
            </p>
          </div>
        </div>

        {/* Step 1 */}
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h5 style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-cyan)', color: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>1</span>
            <span>Create a Firebase Project</span>
          </h5>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '2.2rem', lineHeight: 1.6 }}>
            Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 700 }}>Firebase Console</a>, click <strong>Add project</strong>, and name it <code>satmoggle</code>.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h5 style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-purple)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>2</span>
            <span>Enable Required Services</span>
          </h5>
          <ul style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '3rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: 1.6 }}>
            <li><strong>Authentication:</strong> Go to Build → Authentication → Sign-in method. Enable Email/Password, Google, and Anonymous.</li>
            <li><strong>Firestore Database:</strong> Go to Build → Firestore Database → Create database (start in Test Mode).</li>
            <li><strong>Realtime Database:</strong> Go to Build → Realtime Database → Create database (start in Test Mode for sub-second Bomb Party sync).</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h5 style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>3</span>
            <span>Register Web App & Copy Keys</span>
          </h5>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '2.2rem', lineHeight: 1.6 }}>
            In Project Settings ⚙️ → General → Your apps, click the <code>&lt;/&gt;</code> Web icon. Name it "SATmoggle" and copy the <code>firebaseConfig</code> object.
          </p>
        </div>

        {/* Step 4 */}
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="flex-between">
            <h5 style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-amber)', color: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>4</span>
              <span>Paste into <code>frontend/.env</code></span>
            </h5>
            <button
              onClick={copyToClipboard}
              className="btn btn-secondary btn-sm"
            >
              {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Template'}</span>
            </button>
          </div>
          <div style={{ paddingLeft: '2.2rem' }}>
            <pre style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-glass)', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)', overflowX: 'auto', lineHeight: 1.5 }}>
              {envTemplate}
            </pre>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={14} style={{ color: 'var(--accent-amber)' }} />
              <span>After saving your keys, restart your dev server (`npm run dev`) to switch to live cloud mode!</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <button onClick={onClose} className="btn btn-primary">
            <span>Got It!</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
