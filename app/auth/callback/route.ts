import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseUrl =
    !isLocalEnv && forwardedHost
      ? `${forwardedProto || 'https'}://${forwardedHost}`
      : origin;
  const next =
    requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
    console.error('Auth code exchange error:', error.message);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Redirect to login with error code if code is missing or exchange failed
  return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
}
