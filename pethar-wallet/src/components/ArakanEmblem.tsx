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
