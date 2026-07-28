import React, { useState, useEffect } from 'react';

/**
 * GridInInput
 * Interactive input component for SAT Math Student-Produced Response (SPR / Grid-in) questions.
 * Handles fractions, decimals, and negative signs per College Board rules.
 */
export default function GridInInput({ value = '', onChange, disabled = false, onSubmit, showResult = false, correctAnswers = [] }) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e) => {
    // SAT grid-in allows digits 0-9, period (.), slash (/), and minus (-)
    const val = e.target.value.replace(/[^0-9./-]/g, '').slice(0, 6);
    setLocalVal(val);
    onChange(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit && !disabled) {
      onSubmit();
    }
  };

  let inputBorder = "border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";
  let bgStyle = "bg-black/40 text-white";

  if (showResult && correctAnswers.length > 0) {
    const cleanUserVal = localVal.trim();
    const isCorrect = correctAnswers.some(ans => {
      const cleanAns = String(ans).trim();
      return cleanAns === cleanUserVal || Number(cleanAns) === Number(cleanUserVal);
    });

    if (isCorrect) {
      inputBorder = "border-emerald-400 ring-2 ring-emerald-400/40";
      bgStyle = "bg-emerald-500/20 text-emerald-300 font-bold";
    } else {
      inputBorder = "border-red-500 ring-2 ring-red-500/40";
      bgStyle = "bg-red-500/20 text-red-300 font-bold";
    }
  }

  return (
    <div className="mt-6 max-w-md">
      <label className="block text-sm font-semibold text-slate-300 mb-2 font-heading">
        Student-Produced Response (Grid-in):
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={localVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="e.g. 3/17 or .1764"
          className={`w-full px-4 py-3 rounded-xl border font-mono text-lg transition-all shadow-inner outline-none ${bgStyle} ${inputBorder}`}
        />
        {onSubmit && !disabled && !showResult && (
          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary py-3 px-6"
          >
            Submit
          </button>
        )}
      </div>
      {showResult && correctAnswers.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
          <span className="text-slate-400 font-semibold">Accepted Answers: </span>
          <span className="text-cyan-300 font-mono font-bold">{correctAnswers.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
