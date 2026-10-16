import React from 'react'

interface EmblemProps {
  className?: string
  size?: number
  variant?: 'emblem-only' | 'flag' | 'badge' | 'previous'
}

export const ArakanEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 40,
  variant = 'emblem-only',
}) => (
  <img
    src={
      variant === 'previous'
        ? '/apple-touch-icon-removebg-preview.png'
        : '/pethar-logo-red-white.svg'
    }
    alt="Péthar logo"
    draggable={false}
    onDragStart={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    className={`object-contain select-none pointer-events-none shrink-0 ${className}`}
    style={
      {
        width: size,
        height: size,
        WebkitUserDrag: 'none',
        userSelect: 'none',
      } as React.CSSProperties
    }
  />
)

/** Flag icons for language selector (non-draggable Arakan flag from /united-league-of-arakan-flag.png) */
export const FlagArakan: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <span
    role="img"
    aria-label="ရခိုင်"
    onDragStart={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    className={`inline-flex items-center justify-center rounded overflow-hidden border border-white/20 shrink-0 relative bg-[#ec201c] select-none pointer-events-none ${className}`}
    style={
      {
        width: size,
        height: (size * 2) / 3,
        backgroundImage: 'url(/united-league-of-arakan-flag.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        WebkitUserDrag: 'none',
        userSelect: 'none',
      } as React.CSSProperties
    }
  />
)

export const FlagInternational: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <svg
    viewBox="0 0 60 40"
    className={`inline-flex shrink-0 rounded overflow-hidden border border-white/20 shadow-sm select-none pointer-events-none ${className}`}
    style={{ width: size, height: (size * 2) / 3 }}
    aria-label="English"
  >
    <clipPath id="gb-flag-clip">
      <path d="M0,0 v40 h60 v-40 z" />
    </clipPath>
    <clipPath id="gb-flag-diag">
      <path d="M30,20 L60,40 H0 z M30,20 L60,0 H0 z" />
    </clipPath>
    <g clipPath="url(#gb-flag-clip)">
      <path d="M0,0 v40 h60 v-40 z" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
      <path
        d="M0,0 L60,40 M60,0 L0,40"
        clipPath="url(#gb-flag-diag)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="12" />
      <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
)

/** Circular Flag for Arakan (United League of Arakan flag — non-draggable) */
export const FlagArakanCircle: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <span
    role="img"
    aria-label="ရခိုင်"
    onDragStart={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 relative bg-[#ec201c] select-none pointer-events-none ${className}`}
    style={
      {
        width: size,
        height: size,
        backgroundImage: 'url(/united-league-of-arakan-flag.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        WebkitUserDrag: 'none',
        userSelect: 'none',
      } as React.CSSProperties
    }
  />
)

/** Circular Flag for United Kingdom (English / ENG — non-draggable) */
export const FlagUKCircle: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <svg
    viewBox="0 0 60 60"
    className={`inline-flex shrink-0 rounded-full overflow-hidden select-none pointer-events-none ${className}`}
    style={{ width: size, height: size }}
    aria-label="English"
  >
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
      <path
        d="M0,0 L60,60 M60,0 L0,60"
        clipPath="url(#uk-circle-flag-diag)"
        stroke="#C8102E"
        strokeWidth="5"
      />
      <path d="M30,0 v60 M0,30 h60" stroke="#fff" strokeWidth="15" />
      <path d="M30,0 v60 M0,30 h60" stroke="#C8102E" strokeWidth="9" />
    </g>
  </svg>
)
