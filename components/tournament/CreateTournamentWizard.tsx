'use client';

import { useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  Loader2Icon,
  MapPinIcon,
  SettingsIcon,
  SparklesIcon,
  TrophyIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
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
      notify({
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
        notify({
          title: 'Tournament Created!',
          message: `Tournament ${name} successfully initialized.`,
          color: 'green',
        });
        router.push(`/t/${res.slug}/manage/players`);
      }
    } catch (err: any) {
      notify({
        title: 'Creation Failed',
        message: err.message || 'An unexpected error occurred.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatItems = [
    { value: 'swiss', label: 'Swiss System (Non-elimination, score-based)' },
    { value: 'round_robin', label: 'Round Robin (Everyone plays everyone)' },
    { value: 'double_round_robin', label: 'Double Round Robin (Home & Away colors)' },
    { value: 'knockout', label: 'Single Elimination (Knockout Bracket)' },
  ];

  const tieBreakItems = [
    { value: 'buchholz', label: 'Buchholz (Sum of opponents scores)' },
    { value: 'buchholz_cut1', label: 'Buchholz Cut-1 (Lowest score dropped)' },
    { value: 'median_buchholz', label: 'Median Buchholz (Highest and lowest dropped)' },
    { value: 'sonneborn_berger', label: 'Sonneborn-Berger' },
    { value: 'wins', label: 'Most Total Wins' },
    { value: 'direct_encounter', label: 'Direct Encounter (Head-to-head)' },
  ];

  const steps = [
    { label: 'Basics', description: 'Name & venue', icon: TrophyIcon },
    { label: 'Format & rounds', description: 'Rules & structure', icon: SettingsIcon },
    { label: 'Scoring', description: 'Points & order', icon: TrophyIcon },
    { label: 'Review', description: 'Confirm', icon: CheckIcon },
  ];

  const toggleTieBreak = (value: string, checked: boolean) =>
    setTieBreaks((prev) => (checked ? [...prev, value] : prev.filter((v) => v !== value)));

  return (
    <Card className="mx-auto my-6 max-w-3xl gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create tournament</h1>
          <p className="text-sm text-muted-foreground">
            Set up your format, rules, and rounds in 3 easy steps
          </p>
        </div>
        <Badge variant="secondary">Step {active < 3 ? active + 1 : 3} of 3</Badge>
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.label}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                i === active ? 'border-primary bg-primary/5' : 'hover:bg-muted',
                i < active && 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  i <= active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {i < active ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{step.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{step.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {active === 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="t-name">Tournament name</Label>
            <Input
              id="t-name"
              placeholder="e.g. City Open Rapid Chess Championship"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="t-desc">Description (optional)</Label>
            <Textarea
              id="t-desc"
              placeholder="FIDE rated, 5-round classical event open to all club members..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="t-tc">Time control</Label>
              <div className="relative">
                <ClockIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="t-tc"
                  className="pl-8"
                  placeholder="10m + 5s"
                  value={timeControl}
                  onChange={(e) => setTimeControl(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="t-venue">Venue or platform</Label>
              <div className="relative">
                <MapPinIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="t-venue"
                  className="pl-8"
                  placeholder="Club Hall / Online"
                  value={venue}
                  onChange={(e) => setVenue(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tournament visibility</Label>
            <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as any)}>
              {[
                ['public', 'Public (discoverable on public home)'],
                ['unlisted', 'Unlisted (only anyone with the link)'],
                ['private', 'Private (organizer only)'],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={value} />
                  {label}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      )}

      {active === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tournament format</Label>
            <Select items={formatItems} value={format} onValueChange={(v) => handleFormatChange(v as string | null)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="t-players">Estimated player count</Label>
              <Input
                id="t-players"
                type="number"
                min={2}
                max={500}
                value={playerEstimate}
                onChange={(e) => handlePlayerEstimateChange(e.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="t-rounds">Total rounds</Label>
              <Input
                id="t-rounds"
                type="number"
                min={1}
                max={50}
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.currentTarget.value) || 1)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SparklesIcon className="size-4" />
              Suggested rounds:
              <Badge>{suggested} rounds</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTotalRounds(suggested)}>
              Use suggested ({suggested})
            </Button>
          </div>
        </div>
      )}

      {active === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Win points', winPoints, setWinPoints],
              ['Draw points', drawPoints, setDrawPoints],
              ['Bye points', byePoints, setByePoints],
            ].map(([label, value, setter]: any) => (
              <div key={label} className="flex flex-col gap-2">
                <Label>{label}</Label>
                <Input
                  type="number"
                  step={0.5}
                  min={0}
                  value={value}
                  onChange={(e) => setter(Number(e.currentTarget.value))}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Round 1 pairing method</Label>
            <RadioGroup value={firstRound} onValueChange={(v) => setFirstRound(v as any)}>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="random" />
                Random (Standard Swiss rapid/casual)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="seeded" />
                Seeded by Rating (FIDE style: top half vs bottom half)
              </label>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tie-break order</Label>
            <p className="text-xs text-muted-foreground">
              Evaluated in order when players have matching scores
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {tieBreakItems.map((item) => (
                <label key={item.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={tieBreaks.includes(item.value)}
                    onCheckedChange={(c) => toggleTieBreak(item.value, !!c)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <Switch checked={allowLateEntry} onCheckedChange={setAllowLateEntry} />
            Allow late entry (players can join after Round 1)
          </label>
        </div>
      )}

      {active === 3 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-1 text-lg font-semibold">{name || 'Untitled Tournament'}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {description || 'No description provided.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Format', format.replace(/_/g, ' ')],
                ['Total rounds', `${totalRounds} rounds`],
                ['Time control', timeControl || 'None'],
                ['Venue', venue || 'Online'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ready to initialize tournament. You will be directed to add players next.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        {active > 0 ? (
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeftIcon />
            Back
          </Button>
        ) : (
          <span />
        )}
        {active < 3 ? (
          <Button onClick={nextStep}>
            Next step
            <ArrowRightIcon />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
            Create &amp; proceed to players
          </Button>
        )}
      </div>
    </Card>
  );
}
