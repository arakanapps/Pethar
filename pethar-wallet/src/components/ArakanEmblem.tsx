import React from 'react'

interface EmblemProps {
  className?: string
  size?: number
  variant?: 'emblem-only' | 'flag' | 'badge'
}

export const ArakanEmblem: React.FC<EmblemProps> = ({ className = '', size = 40 }) => (
  <img
    src="/apple-touch-icon-removebg-preview.png"
    alt="PeThar logo"
    className={`object-contain select-none shrink-0 ${className}`}
    style={{ width: size, height: size }}
  />
)

/** Flag icons for language selector (zero text, graphical flags) */
export const FlagArakan: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <div
    className={`inline-flex items-center justify-center rounded overflow-hidden border border-white/20 shrink-0 relative bg-[#ec201c] ${className}`}
    style={{ width: size, height: (size * 2) / 3 }}
    title="ရခိုင် (Arakan)"
    aria-label="ရခိုင်"
  >
    <img
      src="/united-league-of-arakan-flag.png"
      alt="United League of Arakan Flag"
      className="w-full h-full object-cover"
    />
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

/** Circular Flag for Arakan (United League of Arakan flag) */
export const FlagArakanCircle: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <div
    className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 relative bg-[#ec201c] ${className}`}
    style={{ width: size, height: size }}
    title="Arakan"
    aria-label="Arakan"
  >
    <img
      src="/united-league-of-arakan-flag.png"
      alt="United League of Arakan Flag"
      className="w-full h-full object-cover scale-[0.96]"
    />
  </div>
)

/** Circular Flag for United Kingdom (English / ENG) */
export const FlagUKCircle: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg
    viewBox="0 0 60 60"
    className={`inline-flex shrink-0 rounded-full overflow-hidden ${className}`}
    style={{ width: size, height: size }}
    aria-label="English (ENG)"
  >
    <title>English (ENG)</title>
    <defs>
      <clipPath id="uk-circle-flag-clip">
        <circle cx="30" cy="30" r="30" />
      </clipPath>
      <clipPath id="uk-circle-flag-diag">
        <path d="M30,30 L60,60 H0 z M30,30 L60,0 H0 z" />
      </clipPath>
    </defs>
    <g clipPath="url(#uk-circle-flag-clip)">
      <rect width="60" height="60" fill="#012169" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#fff" strokeWidth="10" />
      <path d="M0,0 L60,60 M60,0 L0,60" clipPath="url(#uk-circle-flag-diag)" stroke="#C8102E" strokeWidth="5" />
      <path d="M30,0 v60 M0,30 h60" stroke="#fff" strokeWidth="15" />
      <path d="M30,0 v60 M0,30 h60" stroke="#C8102E" strokeWidth="9" />
    </g>
  </svg>
)

