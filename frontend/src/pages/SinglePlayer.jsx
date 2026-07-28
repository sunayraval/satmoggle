import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionRenderer from '../components/question/QuestionRenderer';
import OptionGrid from '../components/question/OptionGrid';
import GridInInput from '../components/question/GridInInput';
import CalculatorModal from '../components/game/CalculatorModal';
import ReferenceSheetModal from '../components/game/ReferenceSheetModal';
import { updateUserEloAndStats } from '../services/firebase';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Flag, Calculator, BookOpen, ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, ShieldAlert, Zap } from 'lucide-react';

export default function SinglePlayer({ user, profile }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('SETUP'); // 'SETUP' | 'PLAYING' | 'BREAK' | 'REVIEW'
  const [moduleType, setModuleType] = useState('full'); // 'full' | 'reading' | 'math'
  const [difficulty, setDifficulty] = useState('MIXED');
  const [questionCount, setQuestionCount] = useState(10);
  const [timerEnabled, setTimerEnabled] = useState(true);
  
  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(35 * 60); // 35 minutes default
  const [showTimer, setShowTimer] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Modals
  const [calcOpen, setCalcOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [gridPopoverOpen, setGridPopoverOpen] = useState(false);
  
  // Score Results
  const [scoreReport, setScoreReport] = useState(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (status !== 'PLAYING' || !timerEnabled || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timerEnabled, timeLeft]);

  const handleStartTest = async () => {
    setLoadingQuestions(true);
    try {
      const subjParam = moduleType === 'full' ? 'both' : moduleType === 'math' ? 'math' : 'english';
      const res = await fetch(`/api/questions/random?subject=${subjParam}&difficulty=${difficulty}&count=${questionCount}`);
      const data = await res.json();
      
      if (!data.success || !data.data || data.data.length === 0) {
        throw new Error('No questions received from server.');
      }
      
      setQuestions(data.data);
      setCurrentIdx(0);
      setUserAnswers({});
      setFlagged(new Set());
      setTimeLeft(moduleType === 'full' ? 35 * 60 : 20 * 60); // 35m for full/standard module
      setStatus('PLAYING');
    } catch (err) {
      alert('Failed to load questions: ' + err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectAnswer = (ansKey) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: ansKey }));
  };

  const toggleFlag = () => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const handleFinishSection = async () => {
    // If full module and we just finished reading, we could go to BREAK, but for this simulation let's calculate final results and show break/review
    let correctCount = 0;
    const detailed = questions.map(q => {
      const userAns = userAnswers[q.id] || null;
      let isCorrect = false;
      let expectedAns = null;

      // Check Modern Schema (keys array) vs Legacy Schema (correct_choice)
      if (Array.isArray(q.keys) && q.keys.length > 0) {
        expectedAns = q.keys;
        isCorrect = q.keys.some(k => String(k).trim().toLowerCase() === String(userAns).trim().toLowerCase());
      } else if (q.correct_answer && Array.isArray(q.correct_answer)) {
        expectedAns = q.correct_answer;
        isCorrect = q.correct_answer.some(k => String(k).trim().toLowerCase() === String(userAns).trim().toLowerCase());
      } else if (q.answer?.correct_choice) {
        expectedAns = q.answer.correct_choice;
        isCorrect = String(userAns).trim().toLowerCase() === String(q.answer.correct_choice).trim().toLowerCase();
      }

      if (isCorrect) correctCount++;
      return {
        question: q,
        userAns,
        expectedAns,
        isCorrect
      };
    });

    const accuracy = ((correctCount / questions.length) * 100).toFixed(1);
    // Estimate SAT score (400-1600 scale)
    const baseScore = 400;
    const pointsPerQ = 1200 / questions.length;
    const estimatedSat = Math.round(baseScore + (correctCount * pointsPerQ));
    
    // Elo Delta calculation (+30 for 100%, -15 for <40%)
    const eloDelta = Math.round((accuracy / 100) * 45 - 15);

    setScoreReport({
      correctCount,
      totalCount: questions.length,
      accuracy,
      estimatedSat,
      eloDelta,
      detailed
    });

    // Save stats to Firebase profile if user exists
    if (user && profile) {
      const subj = moduleType === 'math' ? 'math' : 'english';
      await updateUserEloAndStats(user.uid, {
        eloDelta,
        isWin: Number(accuracy) >= 70,
        subject: subj,
        correctAnswers: correctCount,
        totalQuestions: questions.length
      });
    }

    if (moduleType === 'full' && status === 'PLAYING') {
      setStatus('BREAK');
    } else {
      setStatus('REVIEW');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- SETUP VIEW ---
  if (status === 'SETUP') {
    return (
      <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto font-body">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Trophy size={14} /> Official Digital SAT Simulation
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Single Player SAT Training</h1>
          <p className="text-slate-400 text-sm">Customize your practice module or experience the full timed Digital SAT structure.</p>
        </div>

        <GlassCard className="space-y-8 border-cyan-500/30 shadow-2xl p-8">
          {/* Module Type */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 font-heading">Select Section / Module</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'full', label: 'Full Digital SAT Simulation', desc: 'RW & Math + 10m Break' },
                { id: 'math', label: 'SAT Math Only', desc: 'Algebra, Geometry & Grid-ins' },
                { id: 'reading', label: 'Reading & Writing Only', desc: 'Craft, Structure & Ideas' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setModuleType(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    moduleType === opt.id
                      ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{opt.label}</div>
                  <div className="text-xs text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 font-heading">Difficulty Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'MIXED', label: 'Mixed / Adaptive', color: 'border-cyan-400' },
                { id: 'E', label: 'Easy (Band 1-3)', color: 'border-emerald-400' },
                { id: 'M', label: 'Medium (Band 4-5)', color: 'border-amber-400' },
                { id: 'H', label: 'Hard (Band 6-7)', color: 'border-pink-500' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDifficulty(opt.id)}
                  className={`py-3 px-4 rounded-xl border text-center font-semibold text-sm transition-all ${
                    difficulty === opt.id
                      ? `bg-white/15 ${opt.color} text-white shadow-md`
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count & Timer Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/10">
            <div>
              <label className="block text-sm font-bold text-white mb-2 font-heading">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 20].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                      questionCount === cnt
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 font-heading">Section Timer</label>
              <button
                type="button"
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  timerEnabled
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Clock size={16} />
                <span>{timerEnabled ? 'Official Timer Enabled (35m)' : 'Untimed Practice Mode'}</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleStartTest}
            disabled={loadingQuestions}
            className="btn-primary w-full py-4 justify-center text-lg font-heading shadow-xl mt-6"
          >
            {loadingQuestions ? 'Loading Question Bank...' : 'Begin Official SAT Section'}
          </button>
        </GlassCard>
      </div>
    );
  }

  // --- BREAK VIEW ---
  if (status === 'BREAK') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-body">
        <GlassCard className="max-w-md w-full text-center p-8 space-y-6 border-cyan-500/30">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Clock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 font-heading">Official 10-Minute Break</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              In the real Digital SAT, students receive a 10-minute break between Section 1 (Reading and Writing) and Section 2 (Math). Take a moment to rest!
            </p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-3xl font-black text-cyan-300">
            10:00
          </div>
          <button
            onClick={() => setStatus('REVIEW')}
            className="btn-primary w-full py-3 justify-center text-sm"
          >
            Resume Immediately & View Score
          </button>
        </GlassCard>
      </div>
    );
  }

  // --- REVIEW VIEW ---
  if (status === 'REVIEW' && scoreReport) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-5xl mx-auto font-body">
        {/* Header Summary */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <CheckCircle2 size={14} /> Section Completed
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">SAT Performance Report</h1>
          <p className="text-slate-400 text-sm">Review your accuracy, estimated College Board score band, and detailed rationale.</p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <GlassCard className="text-center p-6 border-cyan-500/30">
            <div className="text-4xl font-black text-white font-heading text-gradient-cyan">
              {scoreReport.estimatedSat} <span className="text-sm font-normal text-slate-400">/ 1600</span>
            </div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">Estimated SAT Score</div>
          </GlassCard>

          <GlassCard className="text-center p-6 border-purple-500/30">
            <div className="text-4xl font-black text-white font-heading text-purple-400">
              {scoreReport.accuracy}%
            </div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">
              Accuracy ({scoreReport.correctCount} / {scoreReport.totalCount})
            </div>
          </GlassCard>

          <GlassCard className="text-center p-6 border-amber-500/30">
            <div className={`text-4xl font-black font-heading ${scoreReport.eloDelta >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {scoreReport.eloDelta >= 0 ? `+${scoreReport.eloDelta}` : scoreReport.eloDelta}
            </div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">Global Elo Rating Change</div>
          </GlassCard>
        </div>

        {/* Detailed Question Review List */}
        <h3 className="text-xl font-bold text-white mb-4 font-heading flex items-center gap-2">
          <BookOpen size={20} className="text-cyan-400" />
          <span>Question-by-Question Review</span>
        </h3>

        <div className="space-y-6">
          {scoreReport.detailed.map((item, idx) => {
            const q = item.question;
            const isSpr = q.type === 'spr' || !q.answerOptions?.length && !q.answer?.choices;
            return (
              <GlassCard key={idx} className={`p-6 border-l-4 ${item.isCorrect ? 'border-l-emerald-400 bg-emerald-950/10' : 'border-l-red-500 bg-red-950/10'}`}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      {q.skill_desc || q.primary_class_cd_desc || 'SAT Math/English'}
                    </span>
                    <span className="text-xs font-bold uppercase text-amber-400">
                      Diff: {q.difficulty || 'M'}
                    </span>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${item.isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {item.isCorrect ? '✓ Correct' : '✕ Incorrect'}
                  </div>
                </div>

                {/* Stimulus / Passage */}
                {q.stimulus && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4 text-sm text-slate-300">
                    <QuestionRenderer content={q.stimulus} />
                  </div>
                )}

                {/* Stem / Prompt */}
                <div className="text-base font-semibold text-white mb-4">
                  <QuestionRenderer content={q.stem || q.prompt} />
                </div>

                {/* Options / Grid-In */}
                {isSpr ? (
                  <GridInInput
                    value={item.userAns || ''}
                    disabled={true}
                    showResult={true}
                    correctAnswers={Array.isArray(item.expectedAns) ? item.expectedAns : [item.expectedAns]}
                  />
                ) : (
                  <OptionGrid
                    options={q.answerOptions || q.answer?.choices}
                    selectedOption={item.userAns}
                    disabled={true}
                    showResult={true}
                    correctOption={Array.isArray(item.expectedAns) ? item.expectedAns[0] : item.expectedAns}
                  />
                )}

                {/* Rationale */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-2 font-heading">
                    💡 College Board Explanation:
                  </span>
                  <div className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <QuestionRenderer content={q.rationale || q.answer?.rationale || 'No explanation provided.'} />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <button onClick={() => setStatus('SETUP')} className="btn-primary px-8 py-3">
            <RotateCcw size={18} />
            <span>Try Another Practice Section</span>
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary px-8 py-3">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- PLAYING VIEW (ACTIVE SAT SIMULATOR) ---
  const currentQ = questions[currentIdx];
  const isSpr = currentQ?.type === 'spr' || (!currentQ?.answerOptions?.length && !currentQ?.answer?.choices);
  const isMath = currentQ?.module === 'math' || currentQ?.section === 'Math' || currentQ?.skill_desc?.toLowerCase().includes('algebra') || currentQ?.skill_desc?.toLowerCase().includes('math');

  return (
    <div className="min-h-screen flex flex-col font-body bg-[#0a0b12]">
      {/* College Board Digital SAT Header */}
      <header className="sticky top-0 z-40 bg-[#141726]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-heading font-black text-lg text-white">Section 1: {isMath ? 'Math' : 'Reading and Writing'}</div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {/* Center Timer */}
        {timerEnabled && (
          <div className="flex items-center gap-3 bg-black/50 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
            <Clock size={16} className={timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-cyan-400'} />
            <span className={`font-mono font-bold text-base ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
              {showTimer ? formatTime(timeLeft) : 'Hidden'}
            </span>
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="text-[10px] text-slate-400 hover:text-white underline ml-1 font-semibold"
            >
              {showTimer ? 'Hide' : 'Show'}
            </button>
          </div>
        )}

        {/* Right Math Tools & Finish */}
        <div className="flex items-center gap-2">
          {isMath && (
            <>
              <button
                onClick={() => setCalcOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                title="Open SAT Calculator"
              >
                <Calculator size={14} className="text-purple-400" />
                <span className="hidden sm:inline">Calc</span>
              </button>
              <button
                onClick={() => setRefOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                title="Open Math Reference Sheet"
              >
                <BookOpen size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">Reference</span>
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to finish and submit this section?')) {
                handleFinishSection();
              }
            }}
            className="btn-danger px-4 py-1.5 text-xs font-bold ml-2"
          >
            Finish Section
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Passage/Stimulus (if exists) */}
        {currentQ?.stimulus ? (
          <div className="lg:col-span-5 glass-panel p-6 max-h-[75vh] overflow-y-auto border-white/10 space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block font-heading">
              📖 Passage / Context
            </span>
            <div className="text-sm text-slate-200 leading-relaxed">
              <QuestionRenderer content={currentQ.stimulus} />
            </div>
          </div>
        ) : null}

        {/* Right Question Prompt & Options */}
        <div className={currentQ?.stimulus ? 'lg:col-span-7' : 'lg:col-span-12 max-w-4xl mx-auto w-full'}>
          <GlassCard className="p-6 md:p-8 border-white/10 shadow-2xl relative">
            {/* Top Bar with Flag */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-black font-black text-sm flex items-center justify-center">
                  {currentIdx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {currentQ?.skill_desc || 'SAT Math Problem'}
                </span>
              </div>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  flagged.has(currentQ?.id)
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <Flag size={14} className={flagged.has(currentQ?.id) ? 'fill-red-400' : ''} />
                <span>{flagged.has(currentQ?.id) ? 'Flagged for Review' : 'Flag for Review'}</span>
              </button>
            </div>

            {/* Question Prompt */}
            <div className="text-lg md:text-xl font-medium text-white mb-6 leading-relaxed">
              <QuestionRenderer content={currentQ?.stem || currentQ?.prompt} />
            </div>

            {/* Options or Grid In */}
            {isSpr ? (
              <GridInInput
                value={userAnswers[currentQ?.id] || ''}
                onChange={(val) => setUserAnswers(prev => ({ ...prev, [currentQ?.id]: val }))}
              />
            ) : (
              <OptionGrid
                options={currentQ?.answerOptions || currentQ?.answer?.choices}
                selectedOption={userAnswers[currentQ?.id]}
                onSelect={(ansKey) => handleSelectAnswer(ansKey)}
              />
            )}
          </GlassCard>
        </div>
      </main>

      {/* Bottom Footer Navigation Bar */}
      <footer className="sticky bottom-0 z-40 bg-[#141726]/90 backdrop-blur-md border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridPopoverOpen(!gridPopoverOpen)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-2 transition-colors"
          >
            <span>Question Grid</span>
            <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px]">
              {Object.keys(userAnswers).length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            className={`px-5 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${
              currentIdx === 0
                ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-500'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>
          
          <button
            onClick={() => {
              if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
              } else {
                if (window.confirm('You have reached the last question. Submit section now?')) {
                  handleFinishSection();
                }
              }
            }}
            className="btn-primary px-6 py-2 text-sm"
          >
            <span>{currentIdx < questions.length - 1 ? 'Next' : 'Submit Section'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>

      {/* Question Grid Popover */}
      {gridPopoverOpen && (
        <div className="fixed bottom-16 left-6 z-50 glass-panel p-6 max-w-sm w-full border-cyan-500/30 shadow-2xl animate-scaleUp">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h4 className="font-bold text-white text-sm font-heading">Question Navigation Grid</h4>
            <button onClick={() => setGridPopoverOpen(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]);
              const isFlag = flagged.has(q.id);
              const isCurrent = currentIdx === idx;
              
              let btnStyle = "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10";
              if (isAnswered) btnStyle = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold";
              if (isCurrent) btnStyle = "bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/40 font-black";

              return (
                <button
                  key={q.id}
                  onClick={() => { setCurrentIdx(idx); setGridPopoverOpen(false); }}
                  className={`py-2 rounded-lg border text-xs relative transition-all ${btnStyle}`}
                >
                  {idx + 1}
                  {isFlag && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500/40" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Flagged</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-600" /> Current</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <CalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
      <ReferenceSheetModal isOpen={refOpen} onClose={() => setRefOpen(false)} />
    </div>
  );
}
