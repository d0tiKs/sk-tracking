interface DualCardCounterProps {
  icon: string;
  label: string;
  value: { positive: number; negative: number };
  onChange: (newValue: { positive: number; negative: number }) => void;
  disablePositive?: boolean;
  disableNegative?: boolean;
}

/**
 * Simplified buttons for iOS reliability.
 * Model it like other counters (Harry and +/-10): plain onClick, no capture, no special touch handlers.
 */
export default function DualCardCounter({
  icon,
  label,
  value,
  onChange,
  disablePositive = false,
  disableNegative = false,
}: DualCardCounterProps) {
  const pos = value?.positive ?? 0;
  const neg = value?.negative ?? 0;

  const incPositive = () => {
    onChange({ positive: pos + 1, negative: neg });
  };

  const decNegative = () => {
    onChange({ positive: pos, negative: neg - 1 });
  };

  const reset = () => {
    onChange({ positive: 0, negative: 0 });
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface/60 border border-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{icon}</span>
        <span className="opacity-80">{label}</span>
        {(pos !== 0 || neg !== 0) && (
          <span className="font-mono ml-1 opacity-80">
            {neg !== 0 ? neg : ''}{neg !== 0 && pos > 0 ? '|' : ''}{pos > 0 ? `+${pos}` : ''}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!disableNegative && (
          <button
            type="button"
            className="btn btn-ghost px-2 py-1"
            aria-label={`${label} minus`}
            onClick={decNegative}
          >
            −
          </button>
        )}

        <button
          type="button"
          className="btn btn-ghost px-2 py-1"
          aria-label={`${label} reset`}
          title="Réinitialiser"
          onClick={reset}
        >
          🔃
        </button>

        {!disablePositive && (
          <button
            type="button"
            className="btn btn-ghost px-2 py-1"
            aria-label={`${label} plus`}
            onClick={incPositive}
          >
            +
          </button>
        )}


      </div>
    </div>
  );
}