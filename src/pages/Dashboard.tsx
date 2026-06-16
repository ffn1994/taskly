import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw, SortAsc, Search, X, Calendar, Settings } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import StatsCard from '../components/StatsCard';
import InsightBanner from '../components/InsightBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import DailyPlanModal from '../components/DailyPlanModal';
import type { Task } from '../types';
import { CATEGORY_CONFIG } from '../types';
import { generateDailyInsight } from '../lib/ai';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type SortBy = 'ai' | 'due_date' | 'priority' | 'created_at';
type FilterPriority = 'all' | Task['priority'];
type FilterCategory = 'all' | Task['category'];

const PRIORITY_ORDER = {
  'urgent-important': 0,
  'important-not-urgent': 1,
  'urgent-not-important': 2,
  'not-urgent-not-important': 3,
};

function sortTasks(tasks: Task[], by: SortBy): Task[] {
  return [...tasks].sort((a, b) => {
    switch (by) {
      case 'ai':
      case 'priority': return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      case 'created_at': return b.created_at.localeCompare(a.created_at);
    }
  });
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';
  return `${greet}، ${name} 👋`;
}

export default function Dashboard() {
  const { todayTasks, completedToday, stats, loading, error, refresh, handleComplete, handleDelete } = useTasks();
  const { profile } = useAuth();

  const [sortBy, setSortBy] = useState<SortBy>('ai');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [search, setSearch] = useState('');
  const [showPlan, setShowPlan] = useState(false);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const today = format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar });

  useEffect(() => {
    setInsightLoading(true);
    generateDailyInsight(
      todayTasks.map(t => ({ title: t.title, priority: t.priority, due_date: t.due_date }))
    ).then(text => { setInsight(text); setInsightLoading(false); });
  }, [todayTasks.length]);

  const filtered = sortTasks(todayTasks, sortBy).filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hasActiveFilters = filterPriority !== 'all' || filterCategory !== 'all' || search;

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><LoadingSpinner /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A4A]">{getGreeting(profile?.full_name || 'المستخدم')}</h1>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPlan(true)}
            className="p-2 text-gray-500 hover:text-[#4A90D9] hover:bg-blue-50 rounded-xl transition-colors"
            title="التخطيط اليومي">
            <Calendar size={18} />
          </button>
          <button onClick={refresh}
            className="p-2 text-gray-500 hover:text-[#4A90D9] hover:bg-blue-50 rounded-xl transition-colors"
            title="تحديث">
            <RefreshCw size={18} />
          </button>
          <Link to="/settings" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <Settings size={18} />
          </Link>
          <Link to="/add" className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
            <PlusCircle size={16} /> مهمة جديدة
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

      {/* AI Insight */}
      <InsightBanner insight={insight} loading={insightLoading} />

      {/* Stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">ملخص اليوم</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => setFilterPriority(p => p === 'urgent-important' ? 'all' : 'urgent-important')}
            className={`text-right transition-transform hover:scale-105 ${filterPriority === 'urgent-important' ? 'ring-2 ring-red-400 ring-offset-2 rounded-2xl' : ''}`}>
            <StatsCard emoji="🔴" label="عاجل ومهم" count={stats.urgentImportant} color="#E74C3C" bgColor="bg-red-50" />
          </button>
          <button onClick={() => setFilterPriority(p => p === 'important-not-urgent' ? 'all' : 'important-not-urgent')}
            className={`text-right transition-transform hover:scale-105 ${filterPriority === 'important-not-urgent' ? 'ring-2 ring-orange-400 ring-offset-2 rounded-2xl' : ''}`}>
            <StatsCard emoji="🟠" label="مهم" count={stats.importantNotUrgent} color="#E67E22" bgColor="bg-orange-50" />
          </button>
          <button onClick={() => setFilterPriority(p => p === 'urgent-not-important' ? 'all' : 'urgent-not-important')}
            className={`text-right transition-transform hover:scale-105 ${filterPriority === 'urgent-not-important' ? 'ring-2 ring-yellow-400 ring-offset-2 rounded-2xl' : ''}`}>
            <StatsCard emoji="🟡" label="عاجل" count={stats.urgentNotImportant} color="#F39C12" bgColor="bg-yellow-50" />
          </button>
          <button onClick={() => setFilterPriority(p => p === 'not-urgent-not-important' ? 'all' : 'not-urgent-not-important')}
            className={`text-right transition-transform hover:scale-105 ${filterPriority === 'not-urgent-not-important' ? 'ring-2 ring-green-400 ring-offset-2 rounded-2xl' : ''}`}>
            <StatsCard emoji="🟢" label="منخفض" count={stats.notUrgentNotImportant} color="#27AE60" bgColor="bg-green-50" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1E2A4A]">تقدم اليوم</h3>
            <p className="text-sm text-gray-500">{stats.completedToday} من {stats.totalToday} مهمة مكتملة</p>
          </div>
          <span className="text-3xl font-bold text-[#4A90D9]">{stats.completionRate}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-[#4A90D9] to-[#2ECC71] rounded-full transition-all duration-700"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        {stats.completionRate === 100 && stats.totalToday > 0 && (
          <p className="text-green-600 text-sm font-semibold mt-3 text-center">🎉 أحسنت! أتممت جميع مهام اليوم!</p>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في مهامك..."
            className="input-field pr-10 pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as FilterCategory)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
          >
            <option value="all">كل التصنيفات</option>
            {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.emoji} {c.label}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1.5 mr-auto">
            <SortAsc size={14} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
            >
              <option value="ai">توصية الذكاء الاصطناعي</option>
              <option value="due_date">تاريخ الاستحقاق</option>
              <option value="priority">الأولوية</option>
              <option value="created_at">تاريخ الإضافة</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setFilterPriority('all'); setFilterCategory('all'); setSearch(''); }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <X size={12} /> إلغاء الفلتر
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#1E2A4A]">
            مهام اليوم ({filtered.length}
            {hasActiveFilters && todayTasks.length !== filtered.length ? ` من ${todayTasks.length}` : ''})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">{hasActiveFilters ? '🔍' : '🎯'}</div>
            <p className="font-semibold text-[#1E2A4A] mb-2">
              {hasActiveFilters ? 'لا توجد مهام تطابق البحث' : 'لا توجد مهام لهذا اليوم'}
            </p>
            <p className="text-gray-500 text-sm mb-5">
              {hasActiveFilters ? 'جرّب تغيير معايير البحث' : 'ابدأ بإضافة مهامك'}
            </p>
            {!hasActiveFilters && (
              <Link to="/add" className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
                <PlusCircle size={16} /> أضف أول مهمة
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Today Section */}
      {completedToday.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full bg-gradient-to-l from-green-500 to-emerald-500 text-white rounded-2xl p-4 flex items-center justify-between hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div className="text-right">
                <p className="font-bold">إنجازات اليوم</p>
                <p className="text-green-100 text-sm">
                  {completedToday.length} مهمة مكتملة · {stats.completionRate}% معدل الإنجاز
                </p>
              </div>
            </div>
            <span className="text-green-100 text-sm">{showCompleted ? '▲ إخفاء' : '▼ عرض'}</span>
          </button>

          {showCompleted && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {completedToday.map(task => (
                <TaskCard key={task.id} task={task} completed showActions={false} />
              ))}
              <Link
                to="/achievements"
                className="block text-center text-sm text-[#4A90D9] hover:underline py-2"
              >
                عرض كل الإنجازات ←
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Daily Plan Modal */}
      {showPlan && (
        <DailyPlanModal tasks={todayTasks} onClose={() => setShowPlan(false)} />
      )}
    </div>
  );
}
