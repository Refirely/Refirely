import React, { useState } from 'react';
import { WORLD_COUNTRIES } from '../data/userAccounts';

interface CountryFlagProps {
  countryCode?: string;
  countryName?: string;
  fallbackEmoji?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  alt?: string;
}

/**
 * Extracts 2-letter ISO country code from Unicode Regional Indicator emoji (e.g., "🇵🇹" -> "PT")
 */
export const getCountryCodeFromEmoji = (emoji?: string): string | null => {
  if (!emoji) return null;
  const chars = Array.from(emoji);
  if (chars.length >= 2) {
    const cp1 = chars[0].codePointAt(0);
    const cp2 = chars[1].codePointAt(0);
    if (
      cp1 && cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff &&
      cp2 && cp2 >= 0x1f1e6 && cp2 <= 0x1f1ff
    ) {
      return (
        String.fromCharCode(cp1 - 0x1f1e6 + 65) +
        String.fromCharCode(cp2 - 0x1f1e6 + 65)
      ).toUpperCase();
    }
  }
  return null;
};

const COMMON_COUNTRY_ALIASES: Record<string, string> = {
  'usa': 'US',
  'united states of america': 'US',
  'united states': 'US',
  'uk': 'GB',
  'united kingdom': 'GB',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'south korea': 'KR',
  'korea': 'KR',
  'vietnam': 'VN',
  'czechia': 'CZ',
  'czech republic': 'CZ',
};

// Size presets for standard usage
const SIZE_CLASSES: Record<NonNullable<CountryFlagProps['size']>, { container: string; text: string }> = {
  xs: { container: 'w-4 h-2.5', text: 'text-xs' },
  sm: { container: 'w-5 h-3.5', text: 'text-sm' },
  md: { container: 'w-6 h-4', text: 'text-base' },
  lg: { container: 'w-8 h-5.5', text: 'text-xl' },
  xl: { container: 'w-10 h-7', text: 'text-2xl' },
  '2xl': { container: 'w-14 h-9.5', text: 'text-4xl' },
};

/**
 * Universal CountryFlag component.
 * 
 * Windows PC operating systems (Windows 10, Windows 11) deliberately do not include
 * country flag glyphs in Segoe UI Emoji, causing standard Unicode flag emojis to display
 * as two-letter text or missing box glyphs on desktop computers.
 * 
 * This component renders crisp, high-DPI official flag graphics via FlagCDN with graceful
 * fallback to Unicode emoji / code pill, guaranteeing flags render consistently across
 * all desktop computers (Windows, Mac, Linux) and mobile devices (iOS, Android).
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  countryName,
  fallbackEmoji,
  className = '',
  size = 'md',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);

  // Determine ISO 2-letter code
  let iso = (countryCode || '').trim().toUpperCase();
  let emoji = fallbackEmoji;

  if (!iso && countryName) {
    const cleanName = countryName.trim().toLowerCase();
    if (COMMON_COUNTRY_ALIASES[cleanName]) {
      iso = COMMON_COUNTRY_ALIASES[cleanName];
    } else {
      const match = WORLD_COUNTRIES.find(
        c => c.name.toLowerCase() === cleanName
      );
      if (match) {
        iso = match.code;
        if (!emoji) emoji = match.flag;
      }
    }
  }

  if (!iso && emoji) {
    iso = getCountryCodeFromEmoji(emoji) || '';
  }

  const label = alt || countryName || (iso ? `${iso} flag` : 'Country flag');
  const sizeConfig = SIZE_CLASSES[size];

  // If no valid ISO code can be deduced or if image failed to load, render fallback emoji
  if (!iso || hasError) {
    return (
      <span
        role="img"
        aria-label={label}
        className={`inline-flex items-center justify-center select-none leading-none shrink-0 ${sizeConfig.text} ${className}`}
      >
        {fallbackEmoji || '🌍'}
      </span>
    );
  }

  const lowerIso = iso.toLowerCase();
  const cdnUrl = `https://flagcdn.com/w80/${lowerIso}.png`;
  const cdnUrl2x = `https://flagcdn.com/w160/${lowerIso}.png`;

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden shrink-0 select-none ${sizeConfig.container} ${className}`}
      title={label}
    >
      <img
        src={cdnUrl}
        srcSet={`${cdnUrl2x} 2x`}
        alt={label}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover rounded-xs"
      />
    </span>
  );
};
