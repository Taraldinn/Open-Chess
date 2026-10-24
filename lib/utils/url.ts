/**
 * Helper to get the canonical site URL for redirects and sharing.
 * Prioritizes custom domains over vercel.app deployments.
 */
export function getCanonicalSiteUrl(): string {
  // If running in browser:
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const hostname = window.location.hostname;

    // During local development, always stick to localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin;
    }

    // If user is already on a custom domain, keep it to avoid cross-domain auth redirects.
    if (!hostname.endsWith('.vercel.app')) {
      return origin;
    }

    // On vercel.app hosts (preview/internal), optionally prefer configured production domain.
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
