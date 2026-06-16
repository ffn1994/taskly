interface Props {
  emoji: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

export default function StatsCard({ emoji, label, count, color, bgColor }: Props) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 border border-white/50 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-3xl font-bold" style={{ color }}>{count}</span>
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}
