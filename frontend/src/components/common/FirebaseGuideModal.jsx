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
    <Modal isOpen={isOpen} onClose={onClose} title="🔥 How to Configure Live Cloud Firebase" maxWidth="max-w-2xl">
      <div className="space-y-5 text-sm text-slate-300 font-body">
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-200 flex items-start gap-3">
          <ShieldCheck size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white font-heading">Seamless Dual-Mode Architecture</h4>
            <p className="text-xs mt-1 text-slate-300 leading-relaxed">
              SATmoggle works out-of-the-box in <strong>Local Demo Mode</strong>! When you're ready for real-time multiplayer over the internet and persistent user Elo tracking across devices, follow the 4 simple steps below to connect your Firebase project.
            </p>
          </div>
        </div>

        {/* Step 1 */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <h5 className="font-bold text-white text-base font-heading flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xs font-black">1</span>
            Create a Firebase Project
          </h5>
          <p className="text-xs text-slate-400 pl-8">
            Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline hover:text-cyan-200 inline-flex items-center gap-1">Firebase Console <ExternalLink size={12} /></a>, click <strong>Add project</strong>, and name it <code>satmoggle</code>.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <h5 className="font-bold text-white text-base font-heading flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black">2</span>
            Enable Required Services
          </h5>
          <ul className="text-xs text-slate-400 pl-8 list-disc space-y-1">
            <li><strong>Authentication:</strong> Go to Build → Authentication → Sign-in method. Enable <em>Email/Password</em>, <em>Google</em>, and <em>Anonymous</em>.</li>
            <li><strong>Firestore Database:</strong> Go to Build → Firestore Database → Create database (start in <em>Test Mode</em> for development).</li>
            <li><strong>Realtime Database:</strong> Go to Build → Realtime Database → Create database (start in <em>Test Mode</em> for sub-second Bomb Party sync).</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <h5 className="font-bold text-white text-base font-heading flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-black">3</span>
            Register Web App & Copy Keys
          </h5>
          <p className="text-xs text-slate-400 pl-8">
            In Project Settings ⚙️ → General → Your apps, click the <code>&lt;/&gt;</code> Web icon. Name it "SATmoggle" and copy the <code>firebaseConfig</code> object.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-white text-base font-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black">4</span>
              Paste into <code>frontend/.env</code>
            </h5>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Template'}</span>
            </button>
          </div>
          <div className="pl-8">
            <pre className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto">
              {envTemplate}
            </pre>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <Terminal size={12} className="text-amber-400" />
              After saving your keys, restart your dev server (`npm run dev`) to switch to live cloud mode!
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn-primary px-6 py-2">
            Got It!
          </button>
        </div>
      </div>
    </Modal>
  );
}
