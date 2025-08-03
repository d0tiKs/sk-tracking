import { clsx } from 'clsx';

export default function NumberStepper({
  value,
  min = 0,
  max = 99,
  onChange
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const vibrate = () => {
    try {
      navigator.vibrate?.(10);
    } catch {}
  };
  const dec = () => {
    onChange(Math.max(min, value - 1));
    vibrate();
  };
  const inc = () => {
    onChange(Math.min(max, value + 1));
    vibrate();
  };
  return (
    <div className="inline-flex items-center gap-2">
      <button className="btn btn-ghost px-3 py-2" onClick={dec} aria-label="decrease">
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) =>
          onChange(Math.max(min, Math.min(max, Number(e.target.value))))
        }
        className={clsx('input w-16 text-center')}
      />
      <button className="btn btn-ghost px-3 py-2" onClick={inc} aria-label="increase">
        +
      </button>
    </div>
  );
}