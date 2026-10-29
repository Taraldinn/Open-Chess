'use client';

import { useState } from 'react';
import { FileSpreadsheetIcon, Loader2Icon, UploadIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { notify } from '@/lib/notify';
import { bulkAddPlayersAction } from '@/lib/actions/players';

interface BulkImportModalProps {
  opened: boolean;
  onClose: () => void;
  tournamentId: string;
  onSuccess: () => void;
}

interface ParsedPlayer {
  name: string;
  rating: number | null;
  club: string | null;
}

export function BulkImportModal({
  opened,
  onClose,
  tournamentId,
  onSuccess,
}: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const parseLines = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const result: ParsedPlayer[] = [];

    for (const line of lines) {
      // Split by comma or tab
      const parts = line.split(/[,;\t]+/).map((p) => p.trim());
      if (parts.length === 0 || !parts[0]) continue;

      const name = parts[0];
      let rating: number | null = null;
      let club: string | null = null;

      if (parts.length >= 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num)) {
          rating = num;
          club = parts.slice(2).join(', ') || null;
        } else {
          club = parts.slice(1).join(', ') || null;
        }
      }

      result.push({ name, rating, club });
    }

    setParsed(result);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;
    setRawText(val);
    parseLines(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        parseLines(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setLoading(true);
    try {
      await bulkAddPlayersAction(tournamentId, parsed);
      notify({
        title: 'Import Successful',
        message: `Imported ${parsed.length} players.`,
        color: 'green',
      });
      setRawText('');
      setParsed([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      notify({
        title: 'Import Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk import players</DialogTitle>
          <DialogDescription>
            Paste a list of players (one per line). Format: <code>Name, Rating, Club</code> or simply{' '}
            <code>Name</code>. You can also upload a CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <FileSpreadsheetIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="file" accept=".csv,.txt" className="pl-8" onChange={handleFileUpload} />
          </div>

          <Textarea
            placeholder={'Magnus Carlsen, 2882, Norway\nHikaru Nakamura, 2875, USA\nFabiano Caruana, 2805'}
            rows={6}
            value={rawText}
            onChange={handleTextChange}
          />

          {parsed.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Preview parsed players</p>
                <Badge variant="secondary">{parsed.length} players detected</Badge>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Club</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.slice(0, 8).map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.rating || '-'}</TableCell>
                        <TableCell>{p.club || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsed.length > 8 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  + {parsed.length - 8} more players
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={parsed.length === 0 || loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
            Import {parsed.length > 0 ? `${parsed.length} players` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
