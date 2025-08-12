import { useState, useEffect } from "react";
import { mergeProps, usePress, useLongPress } from "react-aria";
import { useHaptics } from "../hooks/useHaptics";

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
  onChange,
}: DualCardCounterProps) {
  const [positiveCount, setPositiveCount] = useState(value.positive);
  const [negativeCount, setNegativeCount] = useState(value.negative);
  const haptics = useHaptics();

  // Sync with parent value
  useEffect(() => {
    setPositiveCount(value.positive);
    setNegativeCount(value.negative);
  }, [value]);

  const handlePositiveClick = () => {
    const newPositive = positiveCount + 1;
    setPositiveCount(newPositive);
    onChange({ positive: newPositive, negative: negativeCount });
  };

  const handleNegativeClick = () => {
    const newNegative = negativeCount - 1;
    setNegativeCount(newNegative);
    onChange({ positive: positiveCount, negative: newNegative });
  };

  const resetPositive = () => {
    setPositiveCount(0);
    onChange({ positive: 0, negative: negativeCount });
    haptics.strong();
  };

  const resetNegative = () => {
    setNegativeCount(0);
    onChange({ positive: positiveCount, negative: 0 });
    haptics.strong();
  };

  const { pressProps: posPress } = usePress({ onPress: handlePositiveClick });
  const { longPressProps: posLong } = useLongPress({
    onLongPress: resetPositive,
    threshold: 500,
    accessibilityDescription: "Long press to reset the plus counter",
  });
  const positiveProps = mergeProps(posPress, posLong);

  const { pressProps: negPress } = usePress({ onPress: handleNegativeClick });
  const { longPressProps: negLong } = useLongPress({
    onLongPress: resetNegative,
    threshold: 500,
    accessibilityDescription: "Long press to reset the minus counter",
  });
  const negativeProps = mergeProps(negPress, negLong);

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface/60 border border-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{icon}</span>
        <span className="opacity-80">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          {...negativeProps}
          className="btn btn-ghost px-2 py-1 border border-red-500 text-red-500 hover:text-white"
        >
          <span className="text-sm font-medium">
            {negativeCount === 0 ? "-" : negativeCount}
          </span>
        </button>
        <button
          {...positiveProps}
          className="btn btn-ghost px-2 py-1 border border-green-500 text-green-500 hover:text-white"
        >
          <span className="text-sm font-medium">
            {positiveCount === 0 ? "+" : positiveCount}
          </span>
        </button>
      </div>
    </div>
  );
}