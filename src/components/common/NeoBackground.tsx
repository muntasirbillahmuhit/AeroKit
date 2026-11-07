import React from 'react';

export const NeoBackground: React.FC = () => {
  return (
    <div
      className="neo-bg-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* 1. Base Dark Navy Space Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 320px 240px at 100% 5%, rgba(198, 255, 61, 0.16), transparent 70%), ' +
            'radial-gradient(ellipse 360px 280px at 0% 90%, rgba(198, 255, 61, 0.18), transparent 70%), ' +
            'radial-gradient(ellipse 340px 260px at 100% 95%, rgba(0, 240, 255, 0.18), transparent 70%), ' +
            'radial-gradient(ellipse 300px 220px at 15% 25%, rgba(0, 240, 255, 0.1), transparent 65%), ' +
            'linear-gradient(180deg, #030712 0%, #050e18 40%, #030710 100%)',
        }}
      />

      {/* 2. Futuristic Dotted Matrix Particles Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(0, 240, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          WebkitMaskImage:
            'radial-gradient(ellipse 180px 140px at 85% 10%, black 0%, transparent 80%), ' +
            'radial-gradient(ellipse 160px 180px at 5% 55%, black 0%, transparent 80%), ' +
            'radial-gradient(ellipse 150px 180px at 95% 45%, black 0%, transparent 80%), ' +
            'radial-gradient(ellipse 180px 140px at 15% 85%, black 0%, transparent 80%)',
          maskImage:
            'radial-gradient(ellipse 180px 140px at 85% 10%, black 0%, transparent 80%), ' +
            'radial-gradient(ellipse 160px 180px at 5% 55%, black 0%, transparent 80%), ' +
            'radial-gradient(ellipse 150px 180px at 95% 45%, black 0%, transparent 80%), ' +
            'radial-gradient(ellipse 180px 140px at 15% 85%, black 0%, transparent 80%)',
          opacity: 0.85,
        }}
      />

      {/* 3. Flowing Neon Light Waves (Lightweight SVG Ribbons) */}
      <svg
        viewBox="0 0 380 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <defs>
          {/* Gradients for ribbons */}
          <linearGradient id="waveGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#C6FF3D" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="waveGradLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C6FF3D" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="waveGradBottom" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C6FF3D" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#00F0FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0070F3" stopOpacity="0.5" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="neoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top sweeping curve (behind search and hero) */}
        <path
          d="M 390 30 Q 250 110 180 90 T -20 140"
          stroke="url(#waveGradTop)"
          strokeWidth="2.2"
          filter="url(#neoGlow)"
          opacity="0.8"
        />
        <path
          d="M 390 60 Q 270 140 200 120 T -20 180"
          stroke="url(#waveGradTop)"
          strokeWidth="1.2"
          opacity="0.45"
        />

        {/* Left flowing neon lime-green wave */}
        <path
          d="M -30 260 Q 90 400 35 560 T -20 740"
          stroke="url(#waveGradLeft)"
          strokeWidth="2.5"
          filter="url(#neoGlow)"
          opacity="0.85"
        />
        <path
          d="M -50 280 Q 70 415 15 570 T -40 755"
          stroke="url(#waveGradLeft)"
          strokeWidth="1.4"
          opacity="0.45"
        />

        {/* Bottom flowing cyan and lime wave ribbons */}
        <path
          d="M 20 660 Q 180 730 400 630"
          stroke="url(#waveGradBottom)"
          strokeWidth="2.5"
          filter="url(#neoGlow)"
          opacity="0.8"
        />
        <path
          d="M 60 690 Q 220 755 410 660"
          stroke="url(#waveGradBottom)"
          strokeWidth="1.2"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
