'use client';

import { Suspense, useState } from 'react';
import { AlertCircleIcon, ArrowLeftIcon, Loader2Icon, MailIcon, TrophyIcon } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { notify } from '@/lib/notify';
import { createClient } from '@/lib/supabase/client';
import { getCanonicalSiteUrl } from '@/lib/utils/url';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const siteUrl = getCanonicalSiteUrl();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    if (error) {
      notify({
        title: 'Sign In Failed',
        message: error.message,
        color: 'red',
      });
    } else {
      setMagicLinkSent(true);
      notify({
        title: 'Check Your Email',
        message: `Magic sign-in link sent to ${email}`,
        color: 'green',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    const siteUrl = getCanonicalSiteUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      notify({
        title: 'Google Sign In Failed',
        message: error.message,
        color: 'red',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <TrophyIcon className="size-9 text-primary" />
        <CardTitle className="text-xl">Welcome to OpenVChess</CardTitle>
        <CardDescription>
          Sign in to create tournaments, manage pairings, and enter results.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errorParam && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Sign in error</AlertTitle>
            <AlertDescription>
              {errorParam === 'oauth_failed'
                ? 'Google sign-in could not be completed. Please check your provider settings in Supabase.'
                : errorParam === 'unauthorized'
                ? 'Please sign in to access organizer and tournament management.'
                : 'Authentication failed. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {magicLinkSent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-semibold">Magic link sent</p>
            <p className="text-sm text-muted-foreground">
              Check your inbox at <strong className="text-foreground">{email}</strong> to sign in
              instantly.
            </p>
            <Button variant="outline" onClick={() => setMagicLinkSent(false)}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
            <Button type="button" variant="outline" size="lg" onClick={handleGoogleSignIn}>
              <GoogleIcon className="size-4" />
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Separator className="flex-1" />
              Or with email magic link
              <Separator className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="arbiter@chessclub.org"
                  className="pl-8"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading && <Loader2Icon className="animate-spin" />}
              Send magic link
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-20">
      <Link href="/" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}>
        <ArrowLeftIcon />
        Home
      </Link>
      <Suspense fallback={<Card className="p-8 text-sm text-muted-foreground">Loading...</Card>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
