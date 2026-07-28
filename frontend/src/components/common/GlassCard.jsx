import React from 'react';

export default function GlassCard({ children, className = '', hoverEffect = true, style = {}, onClick }) {
  const baseClass = hoverEffect ? 'glass-card' : 'glass-panel';
  return (
    <div 
      className={`${baseClass} ${className}`} 
      style={{ padding: '1.5rem', ...style }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
