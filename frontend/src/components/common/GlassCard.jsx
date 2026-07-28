import React from 'react';

export default function GlassCard({ children, className = '', hoverEffect = true, style = {}, onClick }) {
  const baseClass = hoverEffect ? 'glass-card' : 'glass-panel';
  return (
    <div 
      className={`${baseClass} p-6 ${className}`} 
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
