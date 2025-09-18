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
      <div className="flex items-center gap-1">
        <span className="text-xl leading-none">{icon}</span>
        <span className="opacity-80">{label}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`btn-xs btn-ghost px-2 py-1 ${disableNegative ? 'opacity-40 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
          aria-label={`minus`}
          onClick={disableNegative ? undefined : decNegative}
          disabled={disableNegative}
        >
          {disableNegative ? '' : (neg !== 0 ? neg : '−')}
        </button>

        <button
          type="button"
          className="btn-xs btn-ghost btn-xs px-2 py-1"
          aria-label={`reset`}
          title="Réinitialiser"
          onClick={reset}
        >
          🔃
        </button>

        <button
          type="button"
          className={`btn-xs btn-ghost px-2 py-1 ${disablePositive ? 'opacity-40 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
          aria-label={`plus`}
          onClick={disablePositive ? undefined : incPositive}
          disabled={disablePositive}
        >
          {disablePositive ? '' : (pos > 0 ? `+${pos}` : '+')}
        </button>
      </div>
    </div>
  );
}