
import React from 'react';

export const AIHeadIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Human Head Profile */}
    <path 
      d="M30 90C30 90 25 85 22 75C18 62 20 45 35 25C45 12 65 10 75 20C85 30 88 50 85 65C82 80 75 88 65 92C55 96 45 95 30 90Z" 
      stroke="currentColor" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Neural Node / AI Core */}
    <circle cx="55" cy="45" r="12" fill="currentColor" fillOpacity="0.15" />
    <circle cx="55" cy="45" r="5" fill="currentColor" />
    {/* Connection Lines */}
    <path d="M55 45L40 35" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
    <path d="M55 45L70 40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
    <path d="M55 45L60 60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
    <path d="M55 45L45 55" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
  </svg>
);

export const Credits: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-1">
      Architected & Founded by
    </span>
    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">
      Vamshi • Vaibhav • Shreyas
    </span>
  </div>
);
