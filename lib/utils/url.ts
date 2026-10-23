/**
 * Helper to get the canonical site URL for redirects and sharing.
 * Prioritizes custom domains over vercel.app deployments.
 */
export function getCanonicalSiteUrl(): string {
  // If running in browser:
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;

    // During local development, always stick to localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return origin;
    }

    // If configured with custom production domain in env, prefer it over vercel.app
    if (
      process.env.NEXT_PUBLIC_SITE_URL &&
      !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
    ) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    }

    return origin;
  }

  // Server-side fallback
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  return 'https://chess.shebafi.xyz';
}
