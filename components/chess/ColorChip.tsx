import { cn } from '@/lib/utils';

interface ColorChipProps {
  color: 'white' | 'black';
  showLabel?: boolean;
  className?: string;
}

export function ColorChip({ color, showLabel = true, className }: ColorChipProps) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-1.5', className)}
      title={color === 'white' ? 'Plays White' : 'Plays Black'}
    >
      <span
        className={cn(
          'size-3.5 rounded-[4px] border',
          color === 'white'
            ? 'border-zinc-400 bg-white'
            : 'border-zinc-900 bg-zinc-900 dark:border-zinc-500'
        )}
      />
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {color === 'white' ? 'White' : 'Black'}
        </span>
      )}
    </span>
  );
}
