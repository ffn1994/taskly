import type { Priority } from '../types';
import { PRIORITY_CONFIG } from '../types';

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, size = 'md' }: Props) {
  const config = PRIORITY_CONFIG[priority];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${config.bgColor} border ${config.borderColor}`}
      style={{ color: config.color }}
    >
      {config.emoji} {config.label}
    </span>
  );
}
