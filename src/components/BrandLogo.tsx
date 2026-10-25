import React from 'react';
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
          <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-white via-slate-50 to-indigo-50/70 flex items-center justify-center relative overflow-hidden p-1">
            {/* Internal Subtle Shimmer Sweep on Hover */}
            <motion.div
              variants={{
                rest: { x: '-130%', opacity: 0 },
                hover: { x: '130%', opacity: 0.55 },
              }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 pointer-events-none z-20"
            />

            {/* Authentic ReFIREly Favicon/Emblem Image with Hover Lift Animation */}
            <motion.img
              src="/assets/aistudio/refirely-icon.png"
              alt="ReFIREly Emblem"
              variants={{
                rest: { y: 0, scale: 1 },
                hover: { y: -1.5, scale: 1.07 },
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              className="w-full h-full object-contain relative z-10 select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </motion.div>
      </div>

      {/* Multi-Colored Wordmark & Optional Subtitle (Unchanged) */}
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
