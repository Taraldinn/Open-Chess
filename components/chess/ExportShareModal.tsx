'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notify } from '@/lib/notify';
import { getCanonicalSiteUrl } from '@/lib/utils/url';

interface ExportShareModalProps {
  opened: boolean;
  onClose: () => void;
  tournamentSlug: string;
  tournamentName: string;
}

export function ExportShareModal({ opened, onClose, tournamentSlug }: ExportShareModalProps) {
  const [copied, setCopied] = useState(false);
  const siteUrl = getCanonicalSiteUrl();
  const shareUrl = `${siteUrl}/t/${tournamentSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    notify({
      title: 'Link copied',
      message: 'Tournament public link copied to clipboard.',
      color: 'green',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleDownloadCSV = () => {
    if (typeof window !== 'undefined') window.open(`/api/export/${tournamentSlug}`, '_blank');
  };

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &amp; export tournament</DialogTitle>
          <DialogDescription>
            Spectators and players can scan this QR code to view live pairings and standings without
            signing in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border bg-white p-3">
            <QRCodeSVG value={shareUrl} size={180} level="M" />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="share-url">Public tournament link</Label>
            <div className="flex gap-2">
              <Input id="share-url" value={shareUrl} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={handleDownloadCSV}>
              <DownloadIcon />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon />
              Print sheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
