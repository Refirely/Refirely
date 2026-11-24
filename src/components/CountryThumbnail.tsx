import React, { useState, useEffect } from 'react';
import { Country } from '../types';
import { COUNTRY_LANDMARK_PHOTOS, CountryPhotoConfig } from '../data/countryLandmarkPhotos';

interface CountryThumbnailProps {
  country: Country;
  className?: string;
  children?: React.ReactNode;
  hideLandmarkLabel?: boolean;
}

const DEFAULT_PHOTO: CountryPhotoConfig = {
  photoUrl:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Lisbon_%2836831596786%29_%28cropped%29.jpg/960px-Lisbon_%2836831596786%29_%28cropped%29.jpg',
  fallbackPhotoUrl:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Lake_Bled_from_the_Mountain.jpg/960px-Lake_Bled_from_the_Mountain.jpg',
  landmarkLabel: 'Verified Retirement Haven',
  gradientFallback: 'from-teal-900 via-slate-900 to-slate-950',
};

function isAdminUploadedCustomImage(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.includes('firebasestorage.googleapis.com') ||
    trimmed.includes('storage.googleapis.com')
  );
}

export function getCountryPhotoConfig(countryId: string, customImageUrl?: string): {
  photoUrl: string;
  fallbackPhotoUrl: string;
  landmarkLabel: string;
  gradientFallback: string;
  candidateUrls: string[];
} {
  const curated = COUNTRY_LANDMARK_PHOTOS[countryId];
  const config = curated || DEFAULT_PHOTO;

  // Prefer verified iconic landmark photography over legacy generic stock URLs,
  // while still honoring explicit admin-uploaded custom images.
  const ordered = isAdminUploadedCustomImage(customImageUrl)
    ? [customImageUrl, config.photoUrl, config.fallbackPhotoUrl]
    : curated
      ? [config.photoUrl, config.fallbackPhotoUrl, customImageUrl]
      : [customImageUrl, config.photoUrl, config.fallbackPhotoUrl];

  const candidateUrls = Array.from(
    new Set(
      [...ordered, DEFAULT_PHOTO.photoUrl, DEFAULT_PHOTO.fallbackPhotoUrl].filter(
        (u): u is string => Boolean(u && u.trim())
      )
    )
  );

  return {
    photoUrl: candidateUrls[0] || DEFAULT_PHOTO.photoUrl,
    fallbackPhotoUrl: config.fallbackPhotoUrl,
    landmarkLabel: config.landmarkLabel,
    gradientFallback: config.gradientFallback,
    candidateUrls,
  };
}

export const CountryThumbnail: React.FC<CountryThumbnailProps> = ({
  country,
  className = 'h-48',
  children,
  hideLandmarkLabel = false,
}) => {
  const photoConfig = getCountryPhotoConfig(country.id, country.imageUrl);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    setAttempt(0);
  }, [country.id, country.imageUrl]);

  const sources = photoConfig.candidateUrls;
  const activeSrc = attempt < sources.length ? sources[attempt] : null;

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${photoConfig.gradientFallback} select-none ${className}`}
    >
      {activeSrc && (
        <img
          src={activeSrc}
          alt={`${country.name} — ${photoConfig.landmarkLabel}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setAttempt(prev => prev + 1)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      )}

      {/* Balanced Contrast Scrim: keeps upper landmark crisp & clear while anchoring WCAG AA text at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Subtle Landmark Kicker Top-Left (hidden when card renders custom top badges) */}
      {!hideLandmarkLabel && (
        <div className="absolute top-3 left-3.5 text-[11px] font-medium text-white/95 tracking-wide drop-shadow-xs pointer-events-none">
          {photoConfig.landmarkLabel}
        </div>
      )}

      {/* Overlaid Content Slot */}
      {children}
    </div>
  );
};
