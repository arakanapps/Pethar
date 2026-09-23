import React from 'react'

interface EmblemProps {
  className?: string
  size?: number
  variant?: 'emblem-only' | 'flag' | 'badge'
}

/**
 * Arakan Royal Emblem & Flag Component
 * Faithful vector rendering of the historical Arakanese Royal Emblem (Srivatsa, Sun, Moon, and Crown)
 */
export const ArakanEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 40,
  variant = 'badge',
}) => {
  const emblemSvg = (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm"
    >
      {/* Sun (disc with center circle) */}
      <circle cx="168" cy="48" r="16" fill="white" />
      <circle cx="168" cy="48" r="6" fill="#C8102E" />

      {/* Crescent Moon */}
      <path
        d="M220 34C226 44 238 52 258 53C242 58 226 53 220 34Z"
        fill="white"
      />

      {/* Center Srivatsa / Spearhead / Lotus Bud */}
      <path
        d="M200 125C193 150 188 190 180 230L220 230C212 190 207 150 200 125Z"
        fill="white"
      />
      <path
        d="M176 230L200 248L224 230H176Z"
        fill="white"
      />

      {/* Inner symmetrical loops */}
      {/* Left inner loop */}
      <path
        d="M152 145C160 145 168 152 170 168C172 188 156 210 164 228C167 232 172 233 175 233C168 230 162 216 160 198C158 178 142 165 138 150C136 142 144 145 152 145Z"
        fill="white"
      />
      {/* Right inner loop */}
      <path
        d="M248 145C240 145 232 152 230 168C228 188 244 210 236 228C233 232 228 233 225 233C232 230 238 216 240 198C242 178 258 165 262 150C264 142 256 145 248 145Z"
        fill="white"
      />

      {/* Outer Crown Flanks & Scrolls */}
      {/* Left main curl */}
      <path
        d="M115 106C142 90 155 125 146 172C140 200 122 225 110 238C108 240 106 239 108 236C122 218 135 192 134 165C132 130 120 104 105 118C98 125 94 135 96 148C98 158 104 162 108 163C114 164 116 158 113 154C110 150 106 152 104 148C102 142 106 135 112 132C122 126 128 140 124 154C120 168 108 175 98 170C86 164 84 145 88 132C94 115 104 108 115 106Z"
        fill="white"
      />
      {/* Right main curl */}
      <path
        d="M285 106C258 90 245 125 254 172C260 200 278 225 290 238C292 240 294 239 292 236C278 218 265 192 266 165C268 130 280 104 295 118C302 125 306 135 304 148C302 158 296 162 292 163C286 164 284 158 287 154C290 150 294 152 296 148C298 142 294 135 288 132C278 126 272 140 276 154C280 168 292 175 302 170C314 164 316 145 312 132C306 115 296 108 285 106Z"
        fill="white"
      />

      {/* Outer pearl drops (Left wing 5 drops) */}
      <circle cx="85" cy="184" r="8" fill="white" />
      <circle cx="76" cy="204" r="7.5" fill="white" />
      <circle cx="85" cy="222" r="7" fill="white" />
      <circle cx="103" cy="235" r="6.5" fill="white" />
      <circle cx="120" cy="245" r="6" fill="white" />

      {/* Outer pearl drops (Right wing 5 drops) */}
      <circle cx="315" cy="184" r="8" fill="white" />
      <circle cx="324" cy="204" r="7.5" fill="white" />
      <circle cx="315" cy="222" r="7" fill="white" />
      <circle cx="297" cy="235" r="6.5" fill="white" />
      <circle cx="280" cy="245" r="6" fill="white" />

      {/* Lower pedestal curved arch */}
      <path
        d="M136 260C148 250 160 256 160 266C160 285 240 285 240 266C240 256 252 250 264 260C276 272 268 290 252 298C224 308 176 308 148 298C132 290 124 272 136 260Z"
        fill="white"
      />

      {/* Bottom pearl chain (9 beads) */}
      <circle cx="134" cy="316" r="4.5" fill="white" />
      <circle cx="150" cy="323" r="5.5" fill="white" />
      <circle cx="170" cy="328" r="6.5" fill="white" />
      <circle cx="200" cy="334" r="10" fill="white" />
      <circle cx="230" cy="328" r="6.5" fill="white" />
      <circle cx="250" cy="323" r="5.5" fill="white" />
      <circle cx="266" cy="316" r="4.5" fill="white" />
    </svg>
  )

  if (variant === 'emblem-only') {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: (size * 3) / 4 }}
      >
        {emblemSvg}
      </div>
    )
  }

  if (variant === 'flag') {
    return (
      <div
        className={`inline-block overflow-hidden rounded shadow-sm border border-red-800 ${className}`}
        style={{
          width: size,
          height: (size * 2) / 3,
          backgroundColor: '#D91624',
        }}
        title="Arakan National Flag (အာရက္ခအလံတော်)"
      >
        <div className="w-full h-full p-[8%] flex items-center justify-center">
          {emblemSvg}
        </div>
      </div>
    )
  }

  // default 'badge'
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 border border-amber-500/40 shadow-lg shadow-red-950/40 p-1.5 transition-transform active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="PeThar — Sovereign Arakan Financial Infrastructure"
    >
      <div className="w-full h-full flex items-center justify-center">
        {emblemSvg}
      </div>
    </div>
  )
}

/** Flag icons for language selector */
export const FlagArakan: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <div
    className={`inline-flex items-center justify-center rounded overflow-hidden border border-red-700 shrink-0 ${className}`}
    style={{ width: size, height: (size * 2) / 3, backgroundColor: '#D91624' }}
    title="ရခိုင် (Arakanese)"
  >
    <ArakanEmblem size={size * 0.9} variant="emblem-only" />
  </div>
)

export const FlagInternational: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <div
    className={`inline-flex items-center justify-center rounded overflow-hidden border border-blue-800 shrink-0 bg-blue-900 text-white font-bold text-[9px] ${className}`}
    style={{ width: size, height: (size * 2) / 3 }}
    title="English (International)"
  >
    <span className="leading-none tracking-tight">EN</span>
  </div>
)
