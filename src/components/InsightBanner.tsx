import { Lightbulb } from 'lucide-react';

interface Props {
  insight: string;
  loading?: boolean;
}

export default function InsightBanner({ insight, loading }: Props) {
  return (
    <div className="bg-gradient-to-l from-[#1E2A4A] to-[#2a3d6b] text-white rounded-2xl p-5 flex items-start gap-4 shadow-md">
      <div className="w-10 h-10 bg-[#4A90D9]/30 rounded-xl flex items-center justify-center flex-shrink-0">
        <Lightbulb size={20} className="text-[#4A90D9]" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-[#4A90D9] font-semibold mb-1 uppercase tracking-wider">رؤية الذكاء الاصطناعي</p>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-gray-200">{insight}</p>
        )}
      </div>
    </div>
  );
}
