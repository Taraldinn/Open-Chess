'use client';

import { Suspense, useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Divider,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconMail,
  IconBrandGoogle,
  IconArrowLeft,
  IconAlertCircle,
  IconTrophy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { createClient } from '@/lib/supabase/client';
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    if (error) {
      notifications.show({
        title: 'Sign In Failed',
        message: error.message,
        color: 'red',
      });
    } else {
      setMagicLinkSent(true);
      notifications.show({
        title: 'Check Your Email',
        message: `Magic sign-in link sent to ${email}`,
        color: 'green',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <Paper withBorder shadow="md" p={32} radius="xl" className="playful-card-glow">
      <Box className="playful-float" ta="center" mb="xs">
        <IconTrophy size={42} color="#fab005" />
      </Box>
      <Title order={2} ta="center" fw={900} mb="xs">
        Welcome to OpenVChess
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={24}>
        Sign in to create tournaments, manage pairings, and enter results.
      </Text>

      {errorParam && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Sign In Error"
          color="red"
          mb="md"
          radius="md"
        >
          {errorParam === 'oauth_failed'
            ? 'Google sign-in could not be completed. Please check your provider settings in Supabase.'
            : errorParam === 'unauthorized'
            ? 'Please sign in to access organizer and tournament management.'
            : 'Authentication failed. Please try again.'}
        </Alert>
      )}

      {magicLinkSent ? (
        <Stack gap="md" ta="center">
          <Text fw={600} c="green">
            Magic Link Sent!
          </Text>
          <Text size="sm" c="dimmed">
            Check your inbox at <strong>{email}</strong> to sign in instantly.
          </Text>
          <Button variant="default" onClick={() => setMagicLinkSent(false)}>
            Back to Sign In
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleMagicLink}>
          <Stack gap="md">
            <Button
              variant="default"
              size="md"
              leftSection={<IconBrandGoogle size={20} />}
              onClick={handleGoogleSignIn}
              fullWidth
            >
              Continue with Google
            </Button>

            <Divider label="Or with email magic link" labelPosition="center" my="xs" />

            <TextInput
              label="Email Address"
              placeholder="arbiter@chessclub.org"
              required
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <Button
              type="submit"
              color="yellow"
              c="dark.9"
              fw={700}
              size="md"
              loading={loading}
              fullWidth
            >
              Send Magic Link
            </Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
}

export default function LoginPage() {
  return (
    <Container size="xs" py={80}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconArrowLeft size={14} />}
          mb="md"
        >
          Home
        </Button>
      </Link>
      <Suspense fallback={<Paper p={30} withBorder radius="md">Loading...</Paper>}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
