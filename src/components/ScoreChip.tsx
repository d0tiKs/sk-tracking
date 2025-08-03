export default function ScoreChip({ value }: { value: number }) {
  const positive = value >= 0;
  const cls = positive ? 'badge badge-ok' : 'badge badge-bad';
  return <span className={cls}>{positive ? `+${value}` : value}</span>;
}