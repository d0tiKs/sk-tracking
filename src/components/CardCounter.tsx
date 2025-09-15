export default function CardCounter({
  icon,
  label,
  value,
  onChange
}: {
  icon: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  // Haptics disabled for mobile/PWA reliability
  const vibrate = () => {};
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface/60 border border-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{icon}</span>
        <span className="opacity-80">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost px-2 py-1"
          onClick={() => {
            onChange(value - 1);
            vibrate();
          }}
          aria-label={`remove ${label}`}
        >
          −
        </button>
        <div className="w-10 text-center tabular-nums">{value}</div>
        <button
          className="btn btn-ghost px-2 py-1"
          onClick={() => {
            onChange(value + 1);
            vibrate();
          }}
          aria-label={`add ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}