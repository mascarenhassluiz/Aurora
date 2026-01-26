
import React from 'react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aurora-modern-gradient" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#ec4899" />
      </linearGradient>
      {/* Sombra suave para dar profundidade (opcional, mas ajuda no look "moderno 3d") */}
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* 
        CONCEITO: "Aurora Prism"
        Uma forma sólida e ascendente. 
        Representa a estabilidade (base larga) convergindo para um objetivo único (topo).
        O espaço negativo central sugere um caminho ou luz interior.
    */}

    <g filter="url(#glow)">
        {/* Forma Principal: Um "A" estilizado e arredondado, sólido */}
        <path 
          d="M 50 15 
             L 85 82 C 85 82, 88 88, 78 88 
             L 22 88 C 12 88, 15 82, 15 82 
             L 50 15 Z" 
          fill="url(#aurora-modern-gradient)" 
          opacity="0.2"
        />
    </g>

    {/* Elemento de Destaque: A "Seta" de Evolução Sólida */}
    <path 
      d="M 50 20 
         L 78 80 
         L 58 80 
         L 50 55 
         L 42 80 
         L 22 80 
         L 50 20 Z" 
      fill="url(#aurora-modern-gradient)" 
      stroke="none"
    />
    
    {/* O "Coração/Núcleo" flutuante ou detalhe de topo para dar personalidade */}
    <circle cx="50" cy="35" r="4" fill="#ffffff" fillOpacity="0.9" />

  </svg>
);
