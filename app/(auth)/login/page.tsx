'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Divider,
} from '@mantine/core';
import { IconMail, IconBrandGoogle, IconArrowLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
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
        emailRedirectTo: `${window.location.origin}/dashboard`,
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
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

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

      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} ta="center" fw={900} mb="xs">
          Welcome to ChessFlow
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Sign in to create tournaments, manage pairings, and enter results.
        </Text>

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
                leftSection={<IconBrandGoogle size={18} />}
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
                loading={loading}
                fullWidth
              >
                Send Magic Link
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
    </Container>
  );
}
