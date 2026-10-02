import React from 'react'

interface PrismLogoProps {
  size?: number
  className?: string
}

export const PrismLogo: React.FC<PrismLogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Gradients for geometric prism facets */}
          <linearGradient id="prism-facet-left" x1="6" y1="12" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id="prism-facet-right" x1="20" y1="12" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="prism-facet-top" x1="6" y1="12" x2="34" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="prism-core" x1="14" y1="18" x2="26" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.4" />
          </linearGradient>

          <radialGradient id="prism-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind prism */}
        <circle cx="20" cy="20" r="18" fill="url(#prism-glow)" />

        {/* Top facet */}
        <polygon
          points="20,4 34,13 20,20 6,13"
          fill="url(#prism-facet-top)"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="0.75"
        />

        {/* Left facet */}
        <polygon
          points="6,13 20,20 20,36 6,29"
          fill="url(#prism-facet-left)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.75"
        />

        {/* Right facet */}
        <polygon
          points="20,20 34,13 34,29 20,36"
          fill="url(#prism-facet-right)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.75"
        />

        {/* Database query core lines inside the prism */}
        <ellipse cx="20" cy="18" rx="5.5" ry="2" fill="url(#prism-core)" />
        <ellipse cx="20" cy="22" rx="5.5" ry="2" fill="url(#prism-core)" />
        <ellipse cx="20" cy="26" rx="5.5" ry="2" fill="url(#prism-core)" />

        {/* Sharp light refraction beam point */}
        <circle cx="20" cy="20" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  )
}

export interface PrismBrandTextProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders the official "PrismSQL" brand name with the signature optical prism spectrum gradient
 * from Rose (#f03b6e) -> Magenta (#d15494) -> Orchid (#a462c5) -> Violet (#635fff) -> Royal Blue (#3c92ee) -> Cyan (#00b4d8).
 */
export const PrismBrandText: React.FC<PrismBrandTextProps> = ({ className = '', style }) => {
  return (
    <span
      className={`font-bold tracking-tight bg-clip-text text-transparent select-none inline-block ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, #f03b6e 0%, #d15494 22%, #a462c5 44%, #635fff 65%, #3c92ee 85%, #00b4d8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        ...style,
      }}
    >
      PrismSQL
    </span>
  )
}

export interface PrismBrandProps {
  logoSize?: number
  textSize?: string
  subtitle?: string
  showSubtitle?: boolean
  className?: string
}

export const PrismBrand: React.FC<PrismBrandProps> = ({
  logoSize = 26,
  textSize = 'text-sm sm:text-base',
  subtitle,
  showSubtitle = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PrismLogo size={logoSize} />
      <div className="flex flex-col leading-none">
        <PrismBrandText className={textSize} />
        {showSubtitle && subtitle && (
          <span className="hidden sm:block text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
