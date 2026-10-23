'use client';

import { useEffect, useState } from 'react';
import {
  Menu,
  Button,
  Avatar,
  Group,
  Text,
  UnstyledButton,
  Skeleton,
} from '@mantine/core';
import {
  IconLogout,
  IconTrophy,
  IconPlus,
  IconChevronDown,
  IconBrandGoogle,
  IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth state changes (e.g. login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <Skeleton height={36} width={90} radius="xl" />;
  }

  if (!user) {
    return (
      <Link href="/login" style={{ textDecoration: 'none' }}>
        <Button
          variant="light"
          color="yellow"
          size="sm"
          leftSection={<IconUser size={16} />}
        >
          Sign In
        </Button>
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Organizer';

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '4px 8px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--mantine-color-default-hover)',
          }}
        >
          <Group gap="xs">
            <Avatar src={avatarUrl} alt={displayName} size="sm" radius="xl" color="yellow">
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Text size="sm" fw={600} visibleFrom="sm" maw={120} truncate>
              {displayName}
            </Text>
            <IconChevronDown size={14} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="xs" fw={700}>
            {displayName}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {user.email}
          </Text>
        </Menu.Label>
        <Menu.Divider />

        <Menu.Item
          component={Link}
          href="/dashboard"
          leftSection={<IconTrophy size={16} />}
        >
          My Tournaments
        </Menu.Item>

        <Menu.Item
          component={Link}
          href="/t/new"
          leftSection={<IconPlus size={16} />}
        >
          Create Tournament
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleSignOut}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
