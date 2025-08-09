import { useState } from "react";

interface DualCardCounterProps {
  icon: string;
  label: string;
  value: { positive: number; negative: number };
  onChange: (newValue: { positive: number; negative: number }) => void;
}

export default function DualCardCounter({
  icon,
  label,
  value,
  onChange
}: DualCardCounterProps) {
  const [positiveCount, setPositiveCount] = useState(value.positive);
  const [negativeCount, setNegativeCount] = useState(value.negative);

  const handlePositiveClick = () => {
    const newPositive = positiveCount + 1;
    setPositiveCount(newPositive);
    onChange({ positive: newPositive, negative: negativeCount });
  };

  const handleNegativeClick = () => {
    const newNegative = negativeCount - 1; // decrement for negative values
    setNegativeCount(newNegative);
    onChange({ positive: positiveCount, negative: newNegative });
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface/60 border border-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{icon}</span>
        <span className="opacity-80">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {/* Negative counter on the left */}
        <button
          className="btn btn-ghost px-2 py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          onClick={handleNegativeClick}
          aria-label={`${label} negative`}
          aria-valuenow={negativeCount}
          aria-valuemin={-99}
          aria-valuemax={0}
          role="spinbutton"
          data-testid="negative-button"
        >
          <span className="text-sm font-medium">
            {negativeCount === 0 ? "-" : negativeCount}
          </span>
        </button>

        {/* Positive counter on the right */}
        <button
          className="btn btn-ghost px-2 py-1 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          onClick={handlePositiveClick}
          aria-label={`${label} positive`}
          aria-valuenow={positiveCount}
          aria-valuemin={0}
          aria-valuemax={99}
          role="spinbutton"
          data-testid="positive-button"
        >
          <span className="text-sm font-medium">
            {positiveCount === 0 ? "+" : positiveCount}
          </span>
        </button>
      </div>
    </div>
  );
}