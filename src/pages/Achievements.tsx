import { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Calendar, BarChart3, Target } from 'lucide-react';
import type { Task } from '../types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types';
import { getAllTasks } from '../lib/storage';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO, isToday, isThisWeek } from 'date-fns';

type Period = 'today' | 'week' | 'all';

export default function Achievements() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('today');

  useEffect(() => {
    getAllTasks().then(all => {
      setTasks(all.filter(t => t.status === 'completed'));
      setLoading(false);
    });
  }, []);

  const filtered = tasks.filter(t => {
    if (!t.completed_at) return false;
    const date = parseISO(t.completed_at);
    if (period === 'today') return isToday(date);
    if (period === 'week') return isThisWeek(date, { weekStartsOn: 6 });
    return true;
  });

  const byCategory = filtered.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byPriority = filtered.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const todayCount = tasks.filter(t => t.completed_at && isToday(parseISO(t.completed_at))).length;
  const weekCount = tasks.filter(t => t.completed_at && isThisWeek(parseISO(t.completed_at), { weekStartsOn: 6 })).length;

  const periodLabel = {
    today: 'اليوم',
    week: 'هذا الأسبوع',
    all: 'الكل',
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A4A] flex items-center gap-2">
            <Trophy className="text-[#F39C12]" size={26} />
            الإنجازات
          </h1>
          <p className="text-gray-500 text-sm mt-1">احتفل بإنجازاتك وتابع تقدمك</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-[#4A90D9] mb-1">{todayCount}</div>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <CheckCircle2 size={13} className="text-green-500" />
            اليوم
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-[#E67E22] mb-1">{weekCount}</div>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <Calendar size={13} className="text-orange-500" />
            هذا الأسبوع
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-[#27AE60] mb-1">{tasks.length}</div>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <Trophy size={13} className="text-yellow-500" />
            المجموع الكلي
          </p>
        </div>
      </div>

      {/* Motivational Banner */}
      {todayCount > 0 && (
        <div className="bg-gradient-to-l from-[#2ECC71] to-[#27AE60] text-white rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="text-4xl">🎉</div>
          <div>
            <p className="font-bold text-lg">إنجازات اليوم</p>
            <p className="text-green-100 text-sm">
              أحسنت! لقد أنجزت {todayCount} مهام اليوم. استمر في هذا المستوى الرائع!
            </p>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="flex items-center gap-2 mb-6">
        {(['today', 'week', 'all'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p
                ? 'bg-[#4A90D9] text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#4A90D9] hover:text-[#4A90D9]'
            }`}
          >
            {periodLabel[p]}
          </button>
        ))}
        <span className="text-sm text-gray-400 mr-auto">
          {filtered.length} مهمة مكتملة
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="md:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">🎯</div>
              <p className="font-semibold text-[#1E2A4A] mb-2">لا توجد إنجازات في هذه الفترة</p>
              <p className="text-gray-500 text-sm">
                {period === 'today' ? 'أتمم بعض المهام اليوم لتظهر هنا!' : 'لم تُكمل أي مهام في هذه الفترة'}
              </p>
            </div>
          ) : (
            filtered.map(task => {
              const catConfig = CATEGORY_CONFIG[task.category];
              const prConfig = PRIORITY_CONFIG[task.priority];
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 animate-fade-in border-r-4"
                  style={{ borderRightColor: prConfig.color + '60' }}
                >
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={15} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2C3E50] line-through text-gray-400 mb-1">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={task.priority} size="sm" />
                      <span className="text-xs text-gray-400">{catConfig.emoji} {catConfig.label}</span>
                      {task.completed_at && (
                        <span className="text-xs text-green-600 font-medium">
                          ✅ {format(parseISO(task.completed_at), 'HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {/* By Priority */}
          {Object.keys(byPriority).length > 0 && (
            <div className="card">
              <h3 className="font-bold text-[#1E2A4A] mb-4 flex items-center gap-2 text-sm">
                <Target size={15} className="text-[#4A90D9]" />
                حسب الأولوية
              </h3>
              <div className="space-y-3">
                {Object.entries(byPriority).map(([priority, count]) => {
                  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
                  const pct = Math.round((count / filtered.length) * 100);
                  return (
                    <div key={priority}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{config.emoji} {config.label}</span>
                        <span className="font-bold" style={{ color: config.color }}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: config.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Category */}
          {Object.keys(byCategory).length > 0 && (
            <div className="card">
              <h3 className="font-bold text-[#1E2A4A] mb-4 flex items-center gap-2 text-sm">
                <BarChart3 size={15} className="text-[#4A90D9]" />
                حسب التصنيف
              </h3>
              <div className="space-y-2">
                {Object.entries(byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
                    return (
                      <div key={cat} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{config.emoji} {config.label}</span>
                        <span className="font-bold text-[#1E2A4A] bg-gray-50 rounded-lg px-2 py-0.5 text-xs">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="bg-[#1E2A4A] text-white rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="font-bold text-lg">{filtered.length}</p>
              <p className="text-gray-300 text-sm">مهمة مكتملة في {periodLabel[period]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
