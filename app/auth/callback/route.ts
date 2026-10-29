import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Determine the best base URL for the post-auth redirect.
      // Priority: explicitly configured site URL → x-forwarded-host (custom domain on
      // Vercel/proxy) → request origin. We must NEVER redirect back to a *.vercel.app
      // URL because deployment protection would intercept the request.
      const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      let baseUrl: string;
      if (isLocalEnv) {
        baseUrl = origin;
      } else if (configuredUrl && !configuredUrl.includes('localhost')) {
        baseUrl = configuredUrl;
      } else if (forwardedHost && !forwardedHost.endsWith('.vercel.app')) {
        baseUrl = `https://${forwardedHost}`;
      } else {
        baseUrl = origin;
      }

      return NextResponse.redirect(`${baseUrl}${next}`);
    }
    console.error('Auth code exchange error:', error.message);
  }

  // Redirect to login with error if code is missing or exchange failed
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const errorBase = (configuredUrl && !configuredUrl.includes('localhost')) ? configuredUrl : origin;
  return NextResponse.redirect(`${errorBase}/login?error=oauth_failed`);
}
