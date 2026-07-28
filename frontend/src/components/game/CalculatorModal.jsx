import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Delete, Equal } from 'lucide-react';

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

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
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
    { label: 'C', onClick: handleClear, className: 'bg-red-500/20 text-red-400 font-bold border-red-500/30' },
    { label: '(', onClick: () => handlePress('('), className: 'bg-white/10 text-slate-300 border-white/10' },
    { label: ')', onClick: () => handlePress(')'), className: 'bg-white/10 text-slate-300 border-white/10' },
    { label: '÷', onClick: () => handlePress('/'), className: 'bg-purple-500/20 text-purple-300 font-bold border-purple-500/30' },
    
    { label: '7', onClick: () => handlePress('7'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '8', onClick: () => handlePress('8'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '9', onClick: () => handlePress('9'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '×', onClick: () => handlePress('*'), className: 'bg-purple-500/20 text-purple-300 font-bold border-purple-500/30' },
    
    { label: '4', onClick: () => handlePress('4'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '5', onClick: () => handlePress('5'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '6', onClick: () => handlePress('6'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '-', onClick: () => handlePress('-'), className: 'bg-purple-500/20 text-purple-300 font-bold border-purple-500/30' },
    
    { label: '1', onClick: () => handlePress('1'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '2', onClick: () => handlePress('2'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '3', onClick: () => handlePress('3'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '+', onClick: () => handlePress('+'), className: 'bg-purple-500/20 text-purple-300 font-bold border-purple-500/30' },
    
    { label: '0', onClick: () => handlePress('0'), className: 'col-span-2 bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '.', onClick: () => handlePress('.'), className: 'bg-white/5 text-white border-white/10 hover:bg-white/10' },
    { label: '=', onClick: handleCalculate, className: 'bg-cyan-400 text-black font-black border-cyan-400 hover:brightness-110 shadow-lg shadow-cyan-400/20' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧮 Built-in SAT Calculator" maxWidth="max-w-sm">
      <div className="space-y-4">
        {/* Screen */}
        <div className="p-4 rounded-xl bg-black/80 border border-white/20 text-right space-y-1 shadow-inner">
          <div className="text-xs text-slate-400 font-mono h-4 overflow-hidden">{equation}</div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-wider overflow-x-auto whitespace-nowrap">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.onClick}
              className={`py-3 rounded-xl border text-lg font-heading transition-all active:scale-95 flex items-center justify-center ${btn.className}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-slate-400 text-center italic">
          Tip: You can use standard arithmetic operations just like on the official Digital SAT calculator.
        </div>
      </div>
    </Modal>
  );
}
