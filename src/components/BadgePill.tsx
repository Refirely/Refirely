import React from 'react';
import { motion } from 'motion/react';
import { Globe, Languages, Compass, Sparkles, Award, Star, Crown, Flame, LucideIcon } from 'lucide-react';
import { EarnedBadge } from '../types/badges';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Languages,
  Compass,
  Sparkles,
  Award,
  Star,
  Crown,
  Flame,
};

interface BadgePillProps {
  badge: EarnedBadge;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetailsTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BadgePill: React.FC<BadgePillProps> = ({
  badge,
  size = 'sm',
  showDetailsTooltip = true,
  onClick,
  className = '',
}) => {
  const IconComponent = ICON_MAP[badge.iconName] || Award;

  const sizeStyles = {
    xs: {
      pill: 'px-1.5 py-0.5 text-[9px] gap-1 rounded-md',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      pill: 'px-2 py-0.5 text-[10px] gap-1 rounded-lg',
      icon: 'w-3 h-3',
    },
    md: {
      pill: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      pill: 'px-3 py-1.5 text-xs font-bold gap-2 rounded-xl',
      icon: 'w-4 h-4',
    },
  }[size];

  return (
    <motion.button
      type="button"
      whileHover={onClick ? { scale: 1.04, y: -1 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      title={showDetailsTooltip ? `${badge.tierName}: ${badge.description}` : undefined}
      className={`group relative inline-flex items-center font-bold tracking-tight border shadow-2xs transition-all cursor-pointer whitespace-nowrap ${badge.pillBgClass} ${sizeStyles.pill} ${className}`}
    >
      <IconComponent className={`${sizeStyles.icon} shrink-0 opacity-90 group-hover:scale-110 transition-transform`} />
      <span className="truncate">{badge.tierName}</span>

      {/* Subtle shine highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30 rounded-t-lg pointer-events-none" />
    </motion.button>
  );
};
