import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Delete, Equal, Calculator } from 'lucide-react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [hasError, setHasError] = useState(false);

  const handlePress = (val) => {
    if (hasError) {
      setDisplay(val);
      setEquation('');
      setHasError(false);
      return;
    }

    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setHasError(false);
  };

  const handleCalculate = () => {
    try {
      // Safe math evaluation using Function in restricted scope
      const sanitized = display.replace(/[^0-9+\-*/().]/g, '');
      const result = new Function(`return ${sanitized}`)();
      if (!isFinite(result) || isNaN(result)) {
        throw new Error('Invalid');
      }
      setEquation(display + ' =');
      setDisplay(String(Number(result.toFixed(8))));
    } catch (err) {
      setDisplay('Error');
      setHasError(true);
    }
  };

  const buttons = [
    { label: 'C', onClick: handleClear, style: { background: 'rgba(255, 51, 102, 0.2)', color: 'var(--accent-red)', borderColor: 'rgba(255, 51, 102, 0.4)' } },
    { label: '(', onClick: () => handlePress('('), style: { background: 'rgba(255,255,255,0.08)', color: 'white' } },
    { label: ')', onClick: () => handlePress(')'), style: { background: 'rgba(255,255,255,0.08)', color: 'white' } },
    { label: '÷', onClick: () => handlePress('/'), style: { background: 'rgba(157, 78, 221, 0.25)', color: '#d884ff', fontWeight: 900 } },
    
    { label: '7', onClick: () => handlePress('7') },
    { label: '8', onClick: () => handlePress('8') },
    { label: '9', onClick: () => handlePress('9') },
    { label: '×', onClick: () => handlePress('*'), style: { background: 'rgba(157, 78, 221, 0.25)', color: '#d884ff', fontWeight: 900 } },
    
    { label: '4', onClick: () => handlePress('4') },
    { label: '5', onClick: () => handlePress('5') },
    { label: '6', onClick: () => handlePress('6') },
    { label: '-', onClick: () => handlePress('-'), style: { background: 'rgba(157, 78, 221, 0.25)', color: '#d884ff', fontWeight: 900 } },
    
    { label: '1', onClick: () => handlePress('1') },
    { label: '2', onClick: () => handlePress('2') },
    { label: '3', onClick: () => handlePress('3') },
    { label: '+', onClick: () => handlePress('+'), style: { background: 'rgba(157, 78, 221, 0.25)', color: '#d884ff', fontWeight: 900 } },
    
    { label: '0', onClick: () => handlePress('0'), span: 2 },
    { label: '.', onClick: () => handlePress('.') },
    { label: '=', onClick: handleCalculate, style: { background: 'var(--accent-cyan)', color: '#06080f', fontWeight: 900, boxShadow: 'var(--shadow-glow-cyan)', border: 'none' } }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧮 Digital SAT Graphing Calculator" maxWidth="400px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Screen */}
        <div style={{ padding: '1.25rem', borderRadius: '16px', background: '#000', border: '1px solid var(--border-glass)', textAlign: 'right', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', height: '1.2rem', overflow: 'hidden', marginBottom: '0.25rem' }}>{equation}</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'monospace', letterSpacing: '0.05em', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.onClick}
              style={{
                gridColumn: btn.span ? `span ${btn.span}` : 'span 1',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...btn.style
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
          Tip: Standard arithmetic operations work identically to the official Desmos testing calculator.
        </div>
      </div>
    </Modal>
  );
}
