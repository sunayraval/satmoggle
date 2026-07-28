import React, { useEffect } from 'react';
import QuestionRenderer from './QuestionRenderer';

/**
 * OptionGrid
 * Displays the 4 multiple choice options (or custom options array) for SAT questions.
 * Supports keyboard shortcuts (1-4 or A-D) and interactive states (selected, correct green, wrong red).
 */
export default function OptionGrid({ 
  options = [], 
  selectedOption, 
  onSelect, 
  disabled = false, 
  correctOption = null, 
  showResult = false 
}) {
  // Normalize options from either Manifold array [{id, content}] or Legacy object {a: {body}, b: {body}}
  const normalizedOptions = React.useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map((opt, idx) => ({
        key: opt.id || String.fromCharCode(65 + idx), // 'A', 'B', 'C', 'D'
        label: String.fromCharCode(65 + idx),
        content: opt.content || opt.body || opt.label || String(opt)
      }));
    } else if (typeof options === 'object' && options !== null) {
      return Object.entries(options).map(([k, val], idx) => ({
        key: k.toLowerCase(),
        label: k.toUpperCase(),
        content: val?.body || val?.content || String(val)
      }));
    }
    return [];
  }, [options]);

  // Keyboard shortcut listener (A, B, C, D or 1, 2, 3, 4)
  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      const numMap = { '1': 0, '2': 1, '3': 2, '4': 3 };
      const charMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      
      let idx = -1;
      if (key in numMap) idx = numMap[key];
      else if (key in charMap) idx = charMap[key];

      if (idx >= 0 && idx < normalizedOptions.length) {
        onSelect(normalizedOptions[idx].key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, normalizedOptions, onSelect]);

  if (normalizedOptions.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400 italic bg-white/5 rounded-lg border border-white/10">
        No multiple choice options available for this question (Grid-in / SPR).
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {normalizedOptions.map((opt) => {
        const isSelected = selectedOption === opt.key;
        
        let cardStyle = "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20";
        let badgeStyle = "bg-white/10 text-slate-300 border-white/20";

        if (isSelected && !showResult) {
          cardStyle = "border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(0,240,255,0.25)]";
          badgeStyle = "bg-cyan-400 text-black font-bold border-cyan-400";
        }

        if (showResult && correctOption) {
          const isCorrect = opt.key.toLowerCase() === String(correctOption).toLowerCase() ||
                            opt.label.toLowerCase() === String(correctOption).toLowerCase();
          
          if (isCorrect) {
            cardStyle = "border-emerald-400 bg-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-pulse";
            badgeStyle = "bg-emerald-400 text-black font-bold border-emerald-400";
          } else if (isSelected && !isCorrect) {
            cardStyle = "border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
            badgeStyle = "bg-red-500 text-white font-bold border-red-500";
          }
        }

        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.key)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 group ${cardStyle} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 font-heading text-sm transition-colors ${badgeStyle}`}>
              {opt.label}
            </div>
            <div className="flex-1 overflow-hidden pt-0.5">
              <QuestionRenderer content={opt.content} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
