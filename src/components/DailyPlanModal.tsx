import { useState } from 'react';
import { X, Clock, Sparkles, Calendar } from 'lucide-react';
import type { Task } from '../types';
import { generateDailyPlan } from '../lib/ai';
import { useAuth } from '../context/AuthContext';

interface Props {
  tasks: Task[];
  onClose: () => void;
}

export default function DailyPlanModal({ tasks, onClose }: Props) {
  const { profile } = useAuth();
  const [startTime, setStartTime] = useState(profile?.working_hours_start || '09:00');
  const [endTime, setEndTime] = useState(profile?.working_hours_end || '17:00');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const getAvailableHours = () => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const hours = getAvailableHours();
    const result = await generateDailyPlan(
      tasks.map(t => ({
        title: t.title,
        priority: t.priority,
        due_date: t.due_date,
        estimated_duration: t.estimated_duration,
      })),
      hours
    );
    setPlan(result);
    setLoading(false);
  };

  const hours = getAvailableHours();
  const totalTaskMins = tasks.reduce((s, t) => s + (t.estimated_duration || 30), 0);
  const canFit = totalTaskMins <= hours * 60;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1E2A4A] text-white rounded-t-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4A90D9]/30 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-[#4A90D9]" />
              </div>
              <h2 className="text-lg font-bold">تخطيط اليوم بالذكاء الاصطناعي</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-300 text-sm">حدد وقتك المتاح وسيرتب الذكاء الاصطناعي مهامك</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Time Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} />
              الوقت المتاح اليوم
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">من</p>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">إلى</p>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <div className={`mt-3 rounded-xl p-3 text-sm flex items-center justify-between ${
              canFit ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
            }`}>
              <span>⏳ {hours.toFixed(1)} ساعة متاحة</span>
              <span>{Math.round(totalTaskMins / 60 * 10) / 10} ساعة مطلوبة ({tasks.length} مهام)</span>
            </div>
            {!canFit && (
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ المهام أكثر من الوقت المتاح — الذكاء الاصطناعي سيحدد الأولويات
              </p>
            )}
          </div>

          {/* Tasks summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">المهام ({tasks.length})</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {tasks.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate">{t.title}</span>
                  <span className="text-gray-400 flex-shrink-0 mr-2">{t.estimated_duration || 30} د</span>
                </div>
              ))}
              {tasks.length > 6 && (
                <p className="text-xs text-gray-400">و{tasks.length - 6} مهام أخرى...</p>
              )}
            </div>
          </div>

          {/* Plan Output */}
          {plan && (
            <div className="bg-[#1E2A4A]/5 border border-[#1E2A4A]/10 rounded-2xl p-4 animate-fade-in">
              <p className="text-xs font-semibold text-[#4A90D9] mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                خطة الذكاء الاصطناعي
              </p>
              <p className="text-sm text-[#2C3E50] leading-relaxed">{plan}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || hours <= 0 || tasks.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جارٍ التخطيط...</>
              : <><Sparkles size={18} /> {plan ? 'إعادة التخطيط' : 'توليد الخطة اليومية'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
