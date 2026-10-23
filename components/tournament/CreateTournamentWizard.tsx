'use client';

import { useState } from 'react';
import {
  Stepper,
  Button,
  Group,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Radio,
  Stack,
  Card,
  Title,
  Text,
  Badge,
  Switch,
  MultiSelect,
  SimpleGrid,
  Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconTrophy,
  IconClock,
  IconMapPin,
  IconSettings,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconSparkles,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { createTournamentAction } from '@/lib/actions/tournaments';
import type { CreateTournamentInput } from '@/lib/validations/tournament';
import { getFormatEngine } from '@/lib/formats';

export function CreateTournamentWizard() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timeControl, setTimeControl] = useState('10 min + 5s');
  const [venue, setVenue] = useState('Chess Club Hall');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  const [format, setFormat] = useState<string>('swiss');
  const [playerEstimate, setPlayerEstimate] = useState<number>(16);
  const [totalRounds, setTotalRounds] = useState<number>(5);

  const [winPoints, setWinPoints] = useState<number>(1);
  const [drawPoints, setDrawPoints] = useState<number>(0.5);
  const [byePoints, setByePoints] = useState<number>(1);
  const [firstRound, setFirstRound] = useState<'random' | 'seeded'>('random');
  const [tieBreaks, setTieBreaks] = useState<string[]>([
    'buchholz',
    'sonneborn_berger',
    'wins',
    'direct_encounter',
  ]);
  const [allowLateEntry, setAllowLateEntry] = useState(true);

  // Dynamic suggested rounds calculation
  const engine = getFormatEngine(format as any);
  const suggested = engine.suggestedRounds(playerEstimate, {
    winPoints,
    drawPoints,
    byePoints,
    firstRound,
    tieBreaks: tieBreaks as any,
    allowLateEntry,
  });

  const handleFormatChange = (newFormat: string | null) => {
    if (!newFormat) return;
    setFormat(newFormat);
    const eng = getFormatEngine(newFormat as any);
    setTotalRounds(
      eng.suggestedRounds(playerEstimate, {
        winPoints,
        drawPoints,
        byePoints,
        firstRound,
        tieBreaks: tieBreaks as any,
        allowLateEntry,
      })
    );
  };

  const handlePlayerEstimateChange = (val: string | number) => {
    const num = Number(val) || 2;
    setPlayerEstimate(num);
    setTotalRounds(
      engine.suggestedRounds(num, {
        winPoints,
        drawPoints,
        byePoints,
        firstRound,
        tieBreaks: tieBreaks as any,
        allowLateEntry,
      })
    );
  };

  const nextStep = () => {
    if (active === 0 && !name.trim()) {
      notifications.show({
        title: 'Required Field',
        message: 'Please enter a tournament name.',
        color: 'red',
      });
      return;
    }
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: CreateTournamentInput = {
        name,
        description,
        format: format as any,
        visibility,
        totalRounds,
        timeControl,
        venue,
        startDate: new Date().toISOString(),
        settings: {
          winPoints,
          drawPoints,
          byePoints,
          firstRound,
          tieBreaks: tieBreaks as any,
          allowLateEntry,
        },
      };

      const res = await createTournamentAction(payload);
      if (res.success) {
        notifications.show({
          title: 'Tournament Created!',
          message: `Tournament ${name} successfully initialized.`,
          color: 'green',
        });
        router.push(`/t/${res.slug}/manage/players`);
      }
    } catch (err: any) {
      notifications.show({
        title: 'Creation Failed',
        message: err.message || 'An unexpected error occurred.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="md" padding="xl" radius="lg" withBorder maw={840} mx="auto" my="xl" className="playful-card-glow">
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2} size="1.8rem" fw={900}>
            Create Tournament
          </Title>
          <Text c="dimmed" size="sm">
            Set up your format, rules, and rounds in 3 easy steps
          </Text>
        </div>
        <Badge color="yellow" variant="light" size="lg">
          Step {active < 3 ? active + 1 : 3} of 3
        </Badge>
      </Group>

      <Stepper active={active} onStepClick={setActive} color="yellow" mb="xl">
        <Stepper.Step label="Basics" description="Name & Venue" icon={<IconTrophy size={18} />}>
          <Stack gap="md" mt="md">
            <TextInput
              label="Tournament Name"
              placeholder="e.g. City Open Rapid Chess Championship"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <Textarea
              label="Description (Optional)"
              placeholder="FIDE rated, 5-round classical event open to all club members..."
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Time Control"
                leftSection={<IconClock size={16} />}
                placeholder="10m + 5s"
                value={timeControl}
                onChange={(e) => setTimeControl(e.currentTarget.value)}
              />
              <TextInput
                label="Venue or Platform"
                leftSection={<IconMapPin size={16} />}
                placeholder="Club Hall / Online"
                value={venue}
                onChange={(e) => setVenue(e.currentTarget.value)}
              />
            </SimpleGrid>
            <Radio.Group
              label="Tournament Visibility"
              value={visibility}
              onChange={(v) => setVisibility(v as any)}
            >
              <Group mt="xs">
                <Radio value="public" label="Public (discoverable on public home)" />
                <Radio value="unlisted" label="Unlisted (only anyone with the link)" />
                <Radio value="private" label="Private (organizer only)" />
              </Group>
            </Radio.Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Format & Rounds"
          description="Rules & Structure"
          icon={<IconSettings size={18} />}
        >
          <Stack gap="md" mt="md">
            <Select
              label="Tournament Format"
              value={format}
              onChange={handleFormatChange}
              data={[
                { value: 'swiss', label: 'Swiss System (Non-elimination, score-based)' },
                { value: 'round_robin', label: 'Round Robin (Everyone plays everyone)' },
                { value: 'double_round_robin', label: 'Double Round Robin (Home & Away colors)' },
                { value: 'knockout', label: 'Single Elimination (Knockout Bracket)' },
              ]}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label="Estimated Player Count"
                min={2}
                max={500}
                value={playerEstimate}
                onChange={handlePlayerEstimateChange}
              />
              <NumberInput
                label="Total Rounds"
                min={1}
                max={50}
                value={totalRounds}
                onChange={(val) => setTotalRounds(Number(val) || 1)}
              />
            </SimpleGrid>

            <Paper p="md" radius="lg" className="playful-accent-box">
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Group gap="xs">
                  <IconSparkles size={20} color="#fab005" />
                  <Text size="sm" fw={700}>
                    Suggested Rounds:
                  </Text>
                  <Badge color="yellow" c="dark.9" variant="filled" size="md">
                    {suggested} Rounds
                  </Badge>
                </Group>
                <Button
                  size="xs"
                  variant="light"
                  color="yellow"
                  radius="xl"
                  fw={700}
                  onClick={() => setTotalRounds(suggested)}
                >
                  Use Suggested ({suggested})
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Scoring & Tie-breaks"
          description="Points & Order"
          icon={<IconTrophy size={18} />}
        >
          <Stack gap="md" mt="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <NumberInput
                label="Win Points"
                step={0.5}
                min={0}
                value={winPoints}
                onChange={(v) => setWinPoints(Number(v))}
              />
              <NumberInput
                label="Draw Points"
                step={0.5}
                min={0}
                value={drawPoints}
                onChange={(v) => setDrawPoints(Number(v))}
              />
              <NumberInput
                label="Bye Points"
                step={0.5}
                min={0}
                value={byePoints}
                onChange={(v) => setByePoints(Number(v))}
              />
            </SimpleGrid>

            <Radio.Group
              label="Round 1 Pairing Method"
              value={firstRound}
              onChange={(v) => setFirstRound(v as any)}
            >
              <Group mt="xs">
                <Radio value="random" label="Random (Standard Swiss rapid/casual)" />
                <Radio value="seeded" label="Seeded by Rating (FIDE style: top half vs bottom half)" />
              </Group>
            </Radio.Group>

            <MultiSelect
              label="Tie-break Order"
              description="Evaluated in order when players have matching scores"
              data={[
                { value: 'buchholz', label: 'Buchholz (Sum of opponents scores)' },
                { value: 'buchholz_cut1', label: 'Buchholz Cut-1 (Lowest score dropped)' },
                { value: 'median_buchholz', label: 'Median Buchholz (Highest and lowest dropped)' },
                { value: 'sonneborn_berger', label: 'Sonneborn-Berger' },
                { value: 'wins', label: 'Most Total Wins' },
                { value: 'direct_encounter', label: 'Direct Encounter (Head-to-head)' },
              ]}
              value={tieBreaks}
              onChange={setTieBreaks}
            />

            <Switch
              label="Allow Late Entry (Players can join after Round 1)"
              checked={allowLateEntry}
              onChange={(e) => setAllowLateEntry(e.currentTarget.checked)}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack gap="md" mt="md">
            <Paper p="lg" withBorder radius="md">
              <Title order={3} mb="xs">
                {name || 'Untitled Tournament'}
              </Title>
              <Text c="dimmed" size="sm" mb="md">
                {description || 'No description provided.'}
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <div>
                  <Text size="xs" c="dimmed">
                    FORMAT
                  </Text>
                  <Text fw={600} tt="capitalize">
                    {format.replace(/_/g, ' ')}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    TOTAL ROUNDS
                  </Text>
                  <Text fw={600}>{totalRounds} Rounds</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    TIME CONTROL
                  </Text>
                  <Text fw={600}>{timeControl || 'None'}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    VENUE
                  </Text>
                  <Text fw={600}>{venue || 'Online'}</Text>
                </div>
              </SimpleGrid>
            </Paper>

            <Text size="sm" c="dimmed">
              Ready to initialize tournament. You will be directed to add players next.
            </Text>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        {active > 0 && (
          <Button variant="default" onClick={prevStep} leftSection={<IconArrowLeft size={16} />}>
            Back
          </Button>
        )}
        <div style={{ marginLeft: 'auto' }}>
          {active < 3 ? (
            <Button
              color="yellow"
              c="dark.9"
              fw={700}
              onClick={nextStep}
              rightSection={<IconArrowRight size={16} />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              color="yellow"
              c="dark.9"
              fw={700}
              onClick={handleSubmit}
              loading={loading}
              rightSection={<IconCheck size={16} />}
            >
              Create & Proceed to Players
            </Button>
          )}
        </div>
      </Group>
    </Card>
  );
}
