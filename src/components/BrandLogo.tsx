import React, { useId } from 'react';
import { motion } from 'motion/react';

export interface BrandLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
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

            {/* Vector Multi-Colored ReFIREly Emblem (Flame + Palm Frond + Global Orbit & Jet) */}
            <svg
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[86%] h-[86%] relative z-10 overflow-visible"
              aria-hidden="true"
            >
              <defs>
                {/* FIRE Flame Gradient (Rose -> Orange -> Amber Gold) */}
                <linearGradient id={`flameMain-${uid}`} x1="15%" y1="95%" x2="70%" y2="5%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="48%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>

                <linearGradient id={`flameInner-${uid}`} x1="25%" y1="90%" x2="75%" y2="15%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>

                {/* Tropical Palm Frond Gradient (Emerald -> Teal -> Cyan) */}
                <linearGradient id={`palmGrad-${uid}`} x1="20%" y1="90%" x2="95%" y2="20%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="52%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>

                {/* Global Orbit Gradient (Sky -> Indigo -> Violet) */}
                <linearGradient id={`orbitGrad-${uid}`} x1="5%" y1="85%" x2="95%" y2="65%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
              </defs>

              {/* Ambient Orbs inside SVG */}
              <circle cx="42" cy="44" r="30" fill="#f97316" fillOpacity="0.18" />
              <circle cx="84" cy="62" r="28" fill="#14b8a6" fillOpacity="0.2" />

              {/* Animated FIRE Flame */}
              <motion.g
                variants={{
                  rest: { y: 0, scale: 1 },
                  hover: { y: -2.5, scale: 1.05 },
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                style={{ originX: '48px', originY: '85px' }}
              >
                <path
                  d="M30 94C19 81 17 60 28 43C30 51 35 54 38 49C35 34 43 18 56 9C54 23 63 32 68 45C72 55 69 68 62 77C58 62 50 55 43 65C38 73 40 85 30 94Z"
                  fill={`url(#flameMain-${uid})`}
                />
                <path
                  d="M40 89C33 79 34 65 42 55C43 61 48 62 50 57C49 46 55 34 62 27C62 37 67 45 67 56C67 67 57 80 40 89Z"
                  fill={`url(#flameInner-${uid})`}
                  fillOpacity="0.92"
                />
              </motion.g>

              {/* Animated Tropical Palm Frond */}
              <motion.g
                variants={{
                  rest: { rotate: 0 },
                  hover: { rotate: 4 },
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                style={{ originX: '48px', originY: '96px' }}
              >
                <path
                  d="M46 99C44 76 54 54 77 40C89 33 100 28 108 21C106 31 99 40 90 45C97 44 104 41 110 36C105 45 96 51 85 54C93 54 101 53 107 50C101 57 91 61 80 62C87 63 94 63 100 61C92 67 82 70 72 69C78 71 84 72 90 71C81 76 70 78 60 75C54 83 51 91 51 99H46Z"
                  fill={`url(#palmGrad-${uid})`}
                />
              </motion.g>

              {/* Global Orbit Arc */}
              <path
                d="M15 89C22 106 56 110 88 92L84 87L99 85L93 99L90 95C56 116 19 112 15 89Z"
                fill={`url(#orbitGrad-${uid})`}
              />
              <path
                d="M32 104C47 114 75 113 98 96C81 116 47 119 32 104Z"
                fill={`url(#orbitGrad-${uid})`}
                fillOpacity="0.78"
              />

              {/* Animated Ascending Airplane */}
              <motion.g
                variants={{
                  rest: { x: 0, y: 0 },
                  hover: { x: 3.5, y: -3.5 },
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <path
                  d="M97 75L115 67L117 69L108 80L113 90L110 92L101 83L94 87L93 92L90 93L91 85L84 82L86 79L91 82L98 77L91 67L94 65L103 73L97 75Z"
                  fill="#ffffff"
                />
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
