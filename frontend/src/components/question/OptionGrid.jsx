import React, { useEffect } from 'react';
import QuestionRenderer from './QuestionRenderer';

/**
 * OptionGrid
 * Displays the 4 multiple choice options (or custom options array) for SAT questions.
 * Supports keyboard shortcuts (1-4 or A-D) and clean semantic Vanilla CSS classes.
 */
export default function OptionGrid({ 
  options = [], 
  selectedOption, 
  selectedKey,
  onSelect, 
  disabled = false, 
  correctOption = null, 
  correctKey = null,
  showResult = false 
}) {
  const activeSelected = selectedKey || selectedOption;
  const activeCorrect = correctKey || correctOption;
  const isShowingResult = showResult || activeCorrect !== null;

  // Normalize options from either Manifold array [{id, content}] or Legacy object {a: {body}, b: {body}}
  const normalizedOptions = React.useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map((opt, idx) => ({
        key: opt.id || opt.key || String.fromCharCode(65 + idx), // 'A', 'B', 'C', 'D'
        label: opt.label || String.fromCharCode(65 + idx),
        content: opt.content || opt.text || opt.body || opt.label || String(opt)
      }));
    } else if (typeof options === 'object' && options !== null) {
      return Object.entries(options).map(([k, val], idx) => ({
        key: k.toUpperCase(),
        label: k.toUpperCase(),
        content: val?.body || val?.content || val?.text || String(val)
      }));
    }
    return [];
  }, [options]);

  // Keyboard shortcut listener (A, B, C, D or 1, 2, 3, 4)
  useEffect(() => {
    if (disabled || !onSelect) return;
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
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        No multiple choice options available (Student-Produced Response / Grid-in).
      </div>
    );
  }

  return (
    <div className="option-grid" style={{ marginTop: '1.5rem' }}>
      {normalizedOptions.map((opt) => {
        const isSelected = String(activeSelected).trim().toLowerCase() === String(opt.key).trim().toLowerCase();
        
        let cardClass = "option-card";
        let badgeClass = "option-badge";
        let cardStyle = {};
        let badgeStyle = {};

        if (isSelected && !isShowingResult) {
          cardClass += " selected";
        }

        if (isShowingResult && activeCorrect) {
          const isCorrect = String(opt.key).trim().toLowerCase() === String(activeCorrect).trim().toLowerCase() ||
                            String(opt.label).trim().toLowerCase() === String(activeCorrect).trim().toLowerCase();
          
          if (isCorrect) {
            cardClass += " correct";
          } else if (isSelected && !isCorrect) {
            cardClass += " wrong";
          }
        }

        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => { if (onSelect) onSelect(opt.key); }}
            className={cardClass}
            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: disabled ? 'default' : 'pointer', ...cardStyle }}
          >
            <div className={badgeClass} style={badgeStyle}>
              {opt.label}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', paddingTop: '0.1rem', fontSize: '1.05rem', lineHeight: 1.6, color: 'white' }}>
              <QuestionRenderer content={opt.content} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
