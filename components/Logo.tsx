
import React from 'react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aurora-gradient" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#ec4899" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* 
       Conceito Visual: "Aurora Peak"
       Um triângulo com cantos arredondados e um recorte na base, 
       formando uma letra "A" estilizada ou uma montanha.
    */}
    <g filter="url(#glow)">
        <path 
          d="M50 15 L85 85 L60 85 L50 60 L40 85 L15 85 Z" 
          fill="url(#aurora-gradient)" 
          opacity="0.2"
          transform="translate(0, 2)"
        />
    </g>

    {/* Forma Principal */}
    <path 
      d="M50 15 L85 85 L60 85 L50 60 L40 85 L15 85 Z" 
      fill="url(#aurora-gradient)" 
      stroke="url(#aurora-gradient)"
      strokeWidth="10"
      strokeLinejoin="round"
      strokeLinecap="round"
    />

    {/* Ponto de Luz (O "Sol" ou o topo da Aurora) */}
    <circle cx="50" cy="32" r="7" fill="white" />

  </svg>
);
