import React from 'react'

interface EmblemProps {
  className?: string
  size?: number
  variant?: 'emblem-only' | 'flag' | 'badge'
}

export const ArakanEmblem: React.FC<EmblemProps> = ({ className = '', size = 40, variant = 'badge' }) => (
  <img
    src="/apple-touch-icon-removebg-preview.png"
    alt="Arakan emblem"
    className={`object-contain ${className}`}
    style={{ width: size, height: variant === 'emblem-only' ? (size * 3) / 4 : size }}
  />
)

/** Flag icons for language selector (zero text, graphical flags) */
export const FlagArakan: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <div
    className={`inline-flex items-center justify-center rounded overflow-hidden border border-white/20 shrink-0 relative ${className}`}
    style={{ width: size, height: (size * 2) / 3 }}
    title="ရခိုင် (Arakan)"
    aria-label="ရခိုင်"
  >
    <div className="absolute inset-0 flex flex-col">
      <div className="w-full h-1/2 bg-white" />
      <div className="w-full h-1/2 bg-[#D91624]" />
    </div>
    <div className="relative z-10 flex items-center justify-center">
      <ArakanEmblem size={size * 0.75} variant="emblem-only" />
    </div>
  </div>
)

export const FlagInternational: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 60 40"
    className={`inline-flex shrink-0 rounded overflow-hidden border border-white/20 shadow-sm ${className}`}
    style={{ width: size, height: (size * 2) / 3 }}
    aria-label="English"
  >
    <title>English (International)</title>
    <clipPath id="gb-flag-clip">
      <path d="M0,0 v40 h60 v-40 z"/>
    </clipPath>
    <clipPath id="gb-flag-diag">
      <path d="M30,20 L60,40 H0 z M30,20 L60,0 H0 z"/>
    </clipPath>
    <g clipPath="url(#gb-flag-clip)">
      <path d="M0,0 v40 h60 v-40 z" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8"/>
      <path d="M0,0 L60,40 M60,0 L0,40" clipPath="url(#gb-flag-diag)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="12"/>
      <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
)
