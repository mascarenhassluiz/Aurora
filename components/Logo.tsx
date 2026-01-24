import React from 'react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aurora-logo-gradient" x1="20" y1="90" x2="80" y2="10" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    
    {/* Silhueta Externa: Cabeça de Gato formando a letra 'A' */}
    <path 
      d="M22 90 L42 40 L30 12 L50 28 L70 12 L58 40 L78 90" 
      stroke="url(#aurora-logo-gradient)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Barra transversal do 'A' (estilizada) */}
    <path 
      d="M36 65 H64" 
      className="stroke-slate-700 dark:stroke-slate-200" 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
    
    {/* Ponto central (nariz) para reforçar a imagem do gato */}
    <circle cx="50" cy="50" r="3.5" className="fill-slate-700 dark:fill-slate-200" />
  </svg>
);