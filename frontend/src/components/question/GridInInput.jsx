import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, XCircle } from 'lucide-react';

/**
 * GridInInput
 * Interactive input component for SAT Math Student-Produced Response (SPR / Grid-in) questions.
 * Handles fractions, decimals, and negative signs per College Board rules.
 */
export default function GridInInput({ value = '', onChange, disabled = false, onSubmit, showResult = false, correctAnswers = [] }) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  const handleChange = (e) => {
    // SAT grid-in allows digits 0-9, period (.), slash (/), and minus (-)
    const val = e.target.value.replace(/[^0-9./-]/g, '').slice(0, 6);
    setLocalVal(val);
    if (onChange) onChange(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit && !disabled) {
      onSubmit(localVal);
    }
  };

  const handleBtnSubmit = () => {
    if (onSubmit && !disabled) {
      onSubmit(localVal);
    } else if (onChange) {
      onChange(localVal);
    }
  };

  let borderColor = "var(--border-glass)";
  let bgStyle = "rgba(0, 0, 0, 0.5)";
  let textColor = "white";

  if (showResult && correctAnswers.length > 0) {
    const cleanUserVal = String(localVal).trim();
    const isCorrect = correctAnswers.some(ans => {
      const cleanAns = String(ans).trim();
      return cleanAns === cleanUserVal || Number(cleanAns) === Number(cleanUserVal);
    });

    if (isCorrect) {
      borderColor = "var(--accent-emerald)";
      bgStyle = "rgba(0, 245, 160, 0.15)";
      textColor = "var(--accent-emerald)";
    } else {
      borderColor = "var(--accent-red)";
      bgStyle = "rgba(255, 51, 102, 0.15)";
      textColor = "var(--accent-red)";
    }
  }

  return (
    <div style={{ marginTop: '1.5rem', maxWidth: '420px' }}>
      <label className="form-label" style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Student-Produced Response (Grid-in):</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>Max 6 characters (e.g. 3/17 or .176)</span>
      </label>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          value={localVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Enter number or fraction..."
          className="form-input"
          style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.05em', background: bgStyle, border: `1px solid ${borderColor}`, color: textColor, padding: '0.85rem 1.25rem' }}
        />

        {!disabled && !showResult && (
          <button
            type="button"
            onClick={handleBtnSubmit}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.5rem', flexShrink: 0 }}
          >
            <span>Submit</span>
            <Send size={16} />
          </button>
        )}
      </div>

      {showResult && correctAnswers.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Accepted SAT Answers:</span>
          <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem' }}>{correctAnswers.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
