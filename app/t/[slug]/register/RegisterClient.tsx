'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  LockIcon,
  MapPinIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TrophyIcon,
  UserCheckIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notify } from '@/lib/notify';
import { submitRegistrationAction } from '@/lib/actions/registrations';

interface Props {
  tournament: any;
  token: string | null;
}

export function RegisterClient({ tournament, token }: Props) {
  const settings = tournament.settings || {};
  const isRegistrationOpen = settings.registrationOpen !== false;
  const expectedToken = settings.registrationToken;
  const isTokenValid = !expectedToken || token === expectedToken;

  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [club, setClub] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [checkInNow, setCheckInNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify({ title: 'Validation Error', message: 'Please enter your name.', color: 'red' });
      return;
    }

    setLoading(true);
    try {
      const res = await submitRegistrationAction({
        tournamentSlug: tournament.slug,
        token,
        name: name.trim(),
        rating: typeof rating === 'number' ? rating : null,
        club: club.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        checkInNow,
      });

      if (res.success) {
        setSubmitted(true);
        notify({
          title: 'Registration Submitted',
          message: 'Your registration was received and is pending organizer approval.',
          color: 'green',
        });
      }
    } catch (err: any) {
      notify({
        title: 'Registration Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-xl">
        {/* Tournament Brand Header */}
        <div className="mb-6 text-center">
          <Link href={`/t/${tournament.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground hover:text-foreground">
            <TrophyIcon className="size-4 text-primary" />
            {tournament.name}
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Player Registration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register to participate in this official chess tournament.
          </p>
        </div>

        {/* Check Token & Registration Status */}
        {!isTokenValid ? (
          <Card className="border-destructive/40 bg-destructive/5 text-center p-6">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <LockIcon className="size-6" />
            </div>
            <CardHeader className="p-0 pt-4">
              <CardTitle className="text-lg">Private Registration Link Required</CardTitle>
              <CardDescription className="text-sm">
                This tournament requires a valid private invitation token to register. The link you used is missing or has an expired token.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center p-0 pt-6">
              <Link href={`/t/${tournament.slug}`} className={buttonVariants({ variant: 'outline' })}>
                View Tournament Public Page
              </Link>
            </CardFooter>
          </Card>
        ) : !isRegistrationOpen ? (
          <Card className="text-center p-6">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShieldAlertIcon className="size-6" />
            </div>
            <CardHeader className="p-0 pt-4">
              <CardTitle className="text-lg">Registration Is Closed</CardTitle>
              <CardDescription className="text-sm">
                Registration for this tournament has been closed by the organizer.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center p-0 pt-6">
              <Link href={`/t/${tournament.slug}`} className={buttonVariants({ variant: 'outline' })}>
                View Tournament Public Page
              </Link>
            </CardFooter>
          </Card>
        ) : submitted ? (
          <Card className="border-emerald-500/30 bg-emerald-500/5 p-6 text-center shadow-lg">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-8" />
            </div>
            <CardHeader className="p-0 pt-4">
              <CardTitle className="text-xl">Registration Received!</CardTitle>
              <CardDescription className="text-sm">
                Thank you, <strong className="text-foreground">{name}</strong>. Your application has been submitted to the tournament organizer.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 text-xs text-muted-foreground">
              Once accepted by the host, your name will appear on the official players list and pairings will be drawn for Round 1.
            </CardContent>
            <CardFooter className="flex flex-wrap justify-center gap-3 p-0 pt-6">
              <Link href={`/t/${tournament.slug}`} className={buttonVariants({ variant: 'default' })}>
                Go to Tournament Page
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setName('');
                  setRating('');
                  setClub('');
                  setEmail('');
                  setPhone('');
                  setNotes('');
                  setSubmitted(false);
                }}
              >
                Register Another Player
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-lg">
            {/* Quick Tournament Overview Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="uppercase font-mono text-[10px]">
                  {tournament.format?.replace(/_/g, ' ')}
                </Badge>
                {tournament.time_control && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    {tournament.time_control}
                  </span>
                )}
              </div>
              {tournament.venue && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="size-3" />
                  {tournament.venue}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Participant Information</CardTitle>
                <CardDescription>
                  Please fill out the form accurately. Required fields are marked with *.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="player-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="player-name"
                    required
                    placeholder="e.g. Hikaru Nakamura"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="player-rating">Rating (Optional)</Label>
                    <Input
                      id="player-rating"
                      type="number"
                      min={0}
                      max={3500}
                      placeholder="e.g. 2100"
                      value={rating}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRating(val === '' ? '' : Number(val));
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="player-club">Club / School / Team</Label>
                    <Input
                      id="player-club"
                      placeholder="e.g. Chess Club"
                      value={club}
                      onChange={(e) => setClub(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="player-email">Email (Optional)</Label>
                    <Input
                      id="player-email"
                      type="email"
                      placeholder="player@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="player-phone">Phone / WhatsApp</Label>
                    <Input
                      id="player-phone"
                      type="tel"
                      placeholder="+1 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="player-notes">FIDE ID / Notes for Arbiter</Label>
                  <Textarea
                    id="player-notes"
                    placeholder="FIDE ID or notes regarding arrival time, byes request, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {settings.allowSelfCheckIn && (
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
                    <Checkbox
                      id="check-in-now"
                      checked={checkInNow}
                      onCheckedChange={(c) => setCheckInNow(Boolean(c))}
                    />
                    <Label htmlFor="check-in-now" className="cursor-pointer text-xs font-normal">
                      <strong>Check in immediately</strong> (Confirms you will be present for Round 1 pairings)
                    </Label>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/10 pt-4">
                <Link href={`/t/${tournament.slug}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  Cancel
                </Link>
                <Button type="submit" disabled={!name.trim() || loading} className="gap-2">
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <UserCheckIcon className="size-4" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
