/**
 * Privacy sanitizers ensuring user email addresses (Gmail or any provider)
 * are never exposed in public profile bios, handles, or directory cards.
 */

export const DEFAULT_PUBLIC_MEMBER_BIO =
  'Exploring global retirement havens and expat communities.';

const EMAIL_IN_PARENS_REGEX =
  /\s*\(\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*\)\s*/gi;

const RAW_EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

export function containsEmailAddress(text?: string | null): boolean {
  if (!text || typeof text !== 'string') return false;
  RAW_EMAIL_REGEX.lastIndex = 0;
  return RAW_EMAIL_REGEX.test(text);
}

/**
 * Strips legacy auto-generated "(user@gmail.com)" suffixes and any raw email
 * addresses from public bio / aboutMe text while preserving natural punctuation.
 */
export function sanitizePublicBio(bio?: string | null): string {
  if (!bio || typeof bio !== 'string') return '';
  const trimmed = bio.trim();
  if (!trimmed) return '';

  let cleaned = trimmed
    .replace(EMAIL_IN_PARENS_REGEX, ' ')
    .replace(RAW_EMAIL_REGEX, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (
    cleaned.toLowerCase() ===
    'exploring global retirement havens and expat communities'
  ) {
    cleaned = DEFAULT_PUBLIC_MEMBER_BIO;
  }

  return cleaned;
}

/**
 * Ensures public @handles never leak a full email address (e.g. if a username
 * was ever stored as an email address, strips the @domain portion).
 */
export function sanitizePublicHandle(handle?: string | null): string {
  if (!handle || typeof handle !== 'string') return '';
  const trimmed = handle.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0].trim();
  }
  return trimmed;
}
