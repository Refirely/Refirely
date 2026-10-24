import React, { useId } from 'react';
import { motion } from 'motion/react';

export interface BrandLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showDotCom?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
  showDotCom = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const dotComSizes = {
    sm: 'text-[10px] sm:text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base',
  };

  return (
    <motion.div
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      initial="rest"
      animate="rest"
      className={`inline-flex items-center gap-2.5 select-none group/logo ${className}`}
    >
      {/* Multi-Colored Animated Emblem Box */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Breathing Multi-Colored Ambient Glow Halo */}
        <motion.div
          variants={{
            rest: { opacity: 0.45, scale: 0.96 },
            hover: { opacity: 0.9, scale: 1.12, rotate: 8 },
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-teal-400 via-indigo-500 to-amber-500 blur-xs pointer-events-none"
        />

        {/* Crisp Squircle Emblem Container with Gradient Border */}
        <motion.div
          variants={{
            rest: { scale: 1, rotate: 0 },
            hover: { scale: 1.06, rotate: -3 },
          }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className={`relative ${iconSizes[size]} p-[1.5px] bg-gradient-to-br from-teal-400 via-indigo-500 via-60% to-amber-500 shadow-md overflow-hidden`}
        >
          <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-950 flex items-center justify-center relative overflow-hidden">
            {/* Internal Subtle Shimmer Sweep on Hover */}
            <motion.div
              variants={{
                rest: { x: '-130%', opacity: 0 },
                hover: { x: '130%', opacity: 0.35 },
              }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 pointer-events-none"
            />

            {/* Authentic Vector ReFIREly Emblem (3-Tongue Flame + 5-Leaflet Palm Frond + Curved Globe Flight-Path Arrow + Passenger Jet) */}
            <svg
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[88%] h-[88%] relative z-10 overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`flameLeft-${uid}`} x1="34" y1="146" x2="96" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="52%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>

                <linearGradient id={`flameRight-${uid}`} x1="62" y1="146" x2="114" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="55%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>

                <linearGradient id={`palmGrad-${uid}`} x1="72" y1="154" x2="166" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="52%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>

                <linearGradient id={`flightPath-${uid}`} x1="24" y1="136" x2="160" y2="128" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="55%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
              </defs>

              {/* Ambient Orbs inside SVG */}
              <circle cx="68" cy="70" r="44" fill="#f97316" fillOpacity="0.16" />
              <circle cx="128" cy="96" r="40" fill="#14b8a6" fillOpacity="0.18" />

              {/* 1. Animated FIRE Flame (3 Tongues + S-Curve Split + Lower Wisp) */}
              <motion.g
                variants={{
                  rest: { y: 0, scale: 1 },
                  hover: { y: -3, scale: 1.04 },
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                style={{ originX: '75px', originY: '135px' }}
              >
                <path
                  d="M 70 146 C 40 130 32 98 48 66 C 50 76 55 82 59 77 C 56 58 64 44 74 36 C 73 48 77 56 81 60 C 83 42 91 27 100 18 C 91 48 64 76 58 112 C 55 126 61 138 70 146 Z"
                  fill={`url(#flameLeft-${uid})`}
                />
                <path
                  d="M 75 146 C 63 116 69 84 94 56 C 102 46 106 34 105 22 C 118 42 117 74 100 102 C 89 120 80 132 75 146 Z"
                  fill={`url(#flameRight-${uid})`}
                />
                <path
                  d="M 39 138 C 28 128 27 111 36 98 C 35 113 40 125 49 134 C 45 138 42 139 39 138 Z"
                  fill={`url(#flameLeft-${uid})`}
                />
              </motion.g>

              {/* 2. Animated Tropical Palm Frond (5 Distinct Leaflets) */}
              <motion.g
                variants={{
                  rest: { rotate: 0 },
                  hover: { rotate: 4 },
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                style={{ originX: '74px', originY: '154px' }}
              >
                <path
                  d="M 72 154 C 76 110 104 66 164 46 C 153 55 141 61 126 64 L 168 62 C 155 72 141 78 121 80 L 162 80 C 147 90 133 95 113 96 L 150 98 C 135 107 121 110 103 110 L 136 115 C 121 123 107 125 93 123 C 85 134 80 144 78 154 Z"
                  fill={`url(#palmGrad-${uid})`}
                />
              </motion.g>

              {/* 3. Globe Cradle & Curved Flight-Path Arrow */}
              <path
                d="M 46 155 C 76 183 118 181 146 153"
                stroke={`url(#flightPath-${uid})`}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M 68 156 L 62 166 M 91 161 L 89 175 M 114 157 L 117 171"
                stroke={`url(#flightPath-${uid})`}
                strokeWidth="3.8"
                strokeLinecap="round"
              />
              <path
                d="M 22 130 C 48 160 100 163 135 139 L 128 130 L 153 131 L 143 152 L 139 144 C 102 172 46 168 22 130 Z"
                fill={`url(#flightPath-${uid})`}
              />

              {/* 4. Animated Ascending Passenger Jet Airplane */}
              <motion.g
                variants={{
                  rest: { x: 0, y: 0 },
                  hover: { x: 5, y: -4 },
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <g transform="translate(168, 111) rotate(-38)">
                  <path
                    d="M 25 0 C 25 -3.0 18.5 -4.0 11 -4.0 L 5.5 -4.0 L -6 -24 L -11 -24 L -3.5 -3.8 L -14.5 -2.7 L -21.5 -11 L -24.5 -11 L -20 -1.5 L -22.5 0 L -20 1.5 L -24.5 11 L -21.5 11 L -14.5 2.7 L -3.5 3.8 L -11 24 L -6 24 L 5.5 4.0 L 11 4.0 C 18.5 4.0 25 3.0 25 0 Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M 1.5 -11.2 L 7 -11.2 C 8.2 -11.2 8.2 -8.2 7 -8.2 L 0.5 -8.2 Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M 1.5 11.2 L 7 11.2 C 8.2 11.2 8.2 8.2 7 8.2 L 0.5 8.2 Z"
                    fill="#ffffff"
                  />
                </g>
              </motion.g>
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Multi-Colored Wordmark & Optional Subtitle */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-black tracking-tight flex items-baseline ${textSizes[size]}`}>
            <span className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
              Re
            </span>
            <motion.span
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.04 },
              }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent px-[0.5px] drop-shadow-[0_1px_8px_rgba(249,115,22,0.22)]"
            >
              FIRE
            </motion.span>
            <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
              ly
            </span>
            {showDotCom && (
              <span className={`font-extrabold text-slate-500 ml-[1px] tracking-normal ${dotComSizes[size]}`}>
                .com
              </span>
            )}
          </div>

          {/* Animated Multi-Colored Accent Ribbon under Wordmark */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-[2.5px] w-full rounded-full bg-slate-200/70 overflow-hidden relative">
              <motion.div
                variants={{
                  rest: { scaleX: 0.72, originX: 0 },
                  hover: { scaleX: 1, originX: 0 },
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="h-full w-full rounded-full bg-gradient-to-r from-teal-400 via-indigo-500 via-55% to-amber-500"
              />
            </div>
          </div>

          {showTagline && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-teal-700 via-indigo-700 to-amber-700 bg-clip-text text-transparent mt-1">
              Freedom Goes Further
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
