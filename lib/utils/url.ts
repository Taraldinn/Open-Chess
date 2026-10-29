/**
 * Helper to get the canonical site URL for redirects and sharing.
 * Prioritizes NEXT_PUBLIC_SITE_URL, then custom domains, then falls back to
 * the hardcoded production URL. Never returns a *.vercel.app URL for sharing
 * because those URLs have Vercel Deployment Protection and will redirect
 * visitors to Vercel login instead of the public tournament page.
 */
export function getCanonicalSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const isConfiguredProduction = configuredUrl && !configuredUrl.includes('localhost');

  // Always prefer an explicitly configured production URL
  if (isConfiguredProduction) {
    return configuredUrl;
  }

  // If running in browser:
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const hostname = window.location.hostname;

    // Local dev
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin;
    }

    // Never use a *.vercel.app URL — it has deployment protection that breaks
    // public sharing and OAuth redirects. Fall through to the hardcoded fallback.
    if (hostname.endsWith('.vercel.app')) {
      return 'https://chess.shebafi.xyz';
    }

    // Custom domain — safe to use
    return origin;
  }

  return 'https://chess.shebafi.xyz';
}
