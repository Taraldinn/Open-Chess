'use client';

import { useState, useEffect } from 'react';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  QrCodeIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserPlusIcon,
  UserXIcon,
  XIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { notify } from '@/lib/notify';
import {
  getTournamentRegistrationsAction,
  acceptRegistrationAction,
  rejectRegistrationAction,
  acceptAllRegistrationsAction,
  updateRegistrationSettingsAction,
} from '@/lib/actions/registrations';
import { useRouter } from 'next/navigation';

interface Props {
  tournamentId: string;
  tournamentSlug: string;
  settings: any;
  onPlayerAccepted?: () => void;
}

export function RegistrationRequestsCard({
  tournamentId,
  tournamentSlug,
  settings: initialSettings,
  onPlayerAccepted,
}: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings || {});
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Registration URL
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const token = settings.registrationToken || '';
  const registerUrl = `${origin}/t/${tournamentSlug}/register${token ? `?token=${token}` : ''}`;

  const fetchRegistrations = async () => {
    try {
      const data = await getTournamentRegistrationsAction(tournamentId);
      setRegistrations(data || []);
    } catch (err: any) {
      console.warn('Could not fetch registrations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [tournamentId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    notify({
      title: 'Link Copied',
      message: 'Private registration link copied to clipboard.',
      color: 'green',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleOpen = async (checked: boolean) => {
    try {
      const res = await updateRegistrationSettingsAction(tournamentId, {
        registrationOpen: checked,
      });
      setSettings(res.settings);
      notify({
        title: checked ? 'Registration Opened' : 'Registration Closed',
        message: checked
          ? 'Participants can now submit registration forms via the private link.'
          : 'Registration has been temporarily paused.',
        color: checked ? 'green' : 'orange',
      });
    } catch (err: any) {
      notify({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  const handleRegenerateToken = async () => {
    const newToken = `reg_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    try {
      const res = await updateRegistrationSettingsAction(tournamentId, {
        registrationToken: newToken,
      });
      setSettings(res.settings);
      notify({
        title: 'New Link Generated',
        message: 'Old registration link has been invalidated.',
        color: 'blue',
      });
    } catch (err: any) {
      notify({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  const handleAccept = async (regId: string, name: string) => {
    setActionLoading(regId);
    try {
      const res = await acceptRegistrationAction(tournamentId, regId);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, status: 'approved' } : r))
        );
        notify({
          title: 'Participant Accepted',
          message: `${name} has been added to the tournament players list.`,
          color: 'green',
        });
        onPlayerAccepted?.();
        router.refresh();
      }
    } catch (err: any) {
      notify({ title: 'Accept Failed', message: err.message, color: 'red' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (regId: string, name: string) => {
    setActionLoading(regId);
    try {
      const res = await rejectRegistrationAction(tournamentId, regId);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, status: 'rejected' } : r))
        );
        notify({
          title: 'Participant Rejected',
          message: `${name}'s registration was rejected.`,
          color: 'gray',
        });
      }
    } catch (err: any) {
      notify({ title: 'Reject Failed', message: err.message, color: 'red' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptAll = async () => {
    setActionLoading('all');
    try {
      const res = await acceptAllRegistrationsAction(tournamentId);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.status === 'pending' ? { ...r, status: 'approved' } : r))
        );
        notify({
          title: 'All Participants Accepted',
          message: `${res.count} participant(s) added to tournament.`,
          color: 'green',
        });
        onPlayerAccepted?.();
        router.refresh();
      }
    } catch (err: any) {
      notify({ title: 'Batch Accept Failed', message: err.message, color: 'red' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = registrations.filter((r) => r.status === 'pending');
  const isRegistrationOpen = settings.registrationOpen !== false;

  return (
    <Card className="gap-5 p-4 sm:p-6">
      {/* Header and Private Link Control */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GlobeIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Private Registration &amp; Applications</h3>
              <p className="text-xs text-muted-foreground">
                Share this private link with players so they can register. Host can accept or reject each participant.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Registration:</span>
              <Switch checked={isRegistrationOpen} onCheckedChange={handleToggleOpen} />
              <Badge variant={isRegistrationOpen ? 'default' : 'secondary'} className="text-[10px]">
                {isRegistrationOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Private URL Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2.5">
          <Input
            readOnly
            value={registerUrl}
            className="flex-1 bg-background font-mono text-xs select-all"
          />
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
            {copied ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQrModalOpen(true)} className="gap-1.5">
            <QrCodeIcon className="size-3.5" />
            QR Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerateToken}
            title="Generate new invite token"
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCwIcon className="size-3.5" />
            Reset link
          </Button>
        </div>
      </div>

      {/* Pending Applications Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Pending Registration Requests</h4>
            <Badge variant={pendingRequests.length > 0 ? 'default' : 'secondary'}>
              {pendingRequests.length} pending
            </Badge>
          </div>

          {pendingRequests.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptAll}
                disabled={actionLoading === 'all'}
                className="gap-1.5 text-xs"
              >
                {actionLoading === 'all' ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <UserCheckIcon className="size-3.5 text-emerald-500" />
                )}
                Accept All ({pendingRequests.length})
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6 text-sm text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin mr-2" /> Loading applications...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            <ShieldCheckIcon className="mb-2 size-8 text-muted-foreground/60" />
            <p className="font-medium">No pending registration requests</p>
            <p className="text-xs">
              When players submit their entry through the private registration link, they will appear here for your approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Club / School</TableHead>
                  <TableHead>Contact (Email / Phone)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-36 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold">{req.name}</TableCell>
                    <TableCell>{req.rating || '-'}</TableCell>
                    <TableCell>{req.club || '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {req.email || req.phone ? (
                        <span>
                          {req.email} {req.phone ? `(${req.phone})` : ''}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground" title={req.notes || ''}>
                      {req.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAccept(req.id, req.name)}
                          disabled={actionLoading === req.id}
                          className="h-8 gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          {actionLoading === req.id ? (
                            <Loader2Icon className="size-3 animate-spin" />
                          ) : (
                            <UserCheckIcon className="size-3.5" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(req.id, req.name)}
                          disabled={actionLoading === req.id}
                          className="h-8 gap-1 text-destructive hover:bg-destructive/10"
                        >
                          <UserXIcon className="size-3.5" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={(open) => !open && setQrModalOpen(false)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Scan to Register</DialogTitle>
            <DialogDescription>
              Players can scan this QR code with their mobile phone to register for the tournament.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <QRCodeSVG value={registerUrl} size={220} level="H" />
            </div>
            <p className="mt-3 font-mono text-xs break-all text-muted-foreground">{registerUrl}</p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
