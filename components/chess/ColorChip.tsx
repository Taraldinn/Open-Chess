interface ColorChipProps {
  color: 'white' | 'black';
  showLabel?: boolean;
}

export function ColorChip({ color, showLabel = true }: ColorChipProps) {
  return (
    <span className="color-chip" title={color === 'white' ? 'Plays White' : 'Plays Black'}>
      <span className={`color-chip__swatch color-chip__swatch--${color}`} />
      {showLabel && (
        <span className="color-chip__label">{color === 'white' ? 'White' : 'Black'}</span>
      )}
    </span>
  );
}
