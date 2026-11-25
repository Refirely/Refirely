/**
 * Platform detection utility for ReFIREly's dedicated "Native Android UI Mode".
 *
 * Returns `true` strictly when:
 * 1) Running inside Capacitor Android (`window.Capacitor?.isNativePlatform() === true`), OR
 * 2) `?app=android` is present in the URL query string (`new URLSearchParams(window.location.search).get('app') === 'android'`).
 *
 * When `false`, the live desktop/web website remains 100% unchanged.
 */

const LEGACY_ANDROID_PREVIEW_SESSION_KEY = 'refirely_android_app_mode';

export function checkIsAndroidApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Clear any legacy sessionStorage latch so removing ?app=android immediately restores normal web view
  try {
    sessionStorage.removeItem(LEGACY_ANDROID_PREVIEW_SESSION_KEY);
  } catch {
    // ignore storage restrictions
  }

  // 1. Check Capacitor native runtime
  const cap = (window as unknown as {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  }).Capacitor;

  if (typeof cap?.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return true;
  }

  // 2. Check explicit URL query param `?app=android`
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app')?.trim().toLowerCase() === 'android') {
      return true;
    }
  } catch {
    // ignore URL parsing errors
  }

  return false;
}
