import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Calendar, Trash2, ChevronLeft } from 'lucide-react';
import type { Task } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../types';
import PriorityBadge from './PriorityBadge';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  completed?: boolean;
}

export default function TaskCard({ task, onComplete, onDelete, showActions = true, completed = false }: Props) {
  const [completing, setCompleting] = useState(false);
  const config = PRIORITY_CONFIG[task.priority];
  const catConfig = CATEGORY_CONFIG[task.category];

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onComplete || completing) return;
    setCompleting(true);
    await onComplete(task.id);
    setCompleting(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onDelete) return;
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      await onDelete(task.id);
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-2xl border-r-4 shadow-sm hover:shadow-md transition-all duration-200 p-4 animate-fade-in ${
        completed ? 'opacity-75' : ''
      }`}
      style={{ borderRightColor: config.color }}
    >
      <div className="flex items-start gap-3">
        {/* Complete button */}
        {showActions && !completed && onComplete && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              completing
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
            title="إتمام المهمة"
          >
            {completing && <CheckCircle2 size={14} className="text-white animate-check" />}
          </button>
        )}

        {completed && (
          <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold text-[#2C3E50] dark:text-slate-100 leading-snug ${completed ? 'line-through text-gray-400 dark:text-slate-500' : ''}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {showActions && onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <Link
                to={`/tasks/${task.id}`}
                className="p-1.5 text-gray-400 hover:text-[#4A90D9] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ChevronLeft size={14} />
              </Link>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-2 mt-3">
            <PriorityBadge priority={task.priority} size="sm" />

            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 rounded-full px-2 py-0.5">
              {catConfig.emoji} {catConfig.label}
            </span>

            {task.due_date && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={11} />
                {format(parseISO(task.due_date), 'd MMM', { locale: ar })}
              </span>
            )}

            {task.due_time && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock size={11} />
                {task.due_time}
              </span>
            )}

            {task.estimated_duration && (
              <span className="text-xs text-gray-400">{task.estimated_duration} د</span>
            )}
          </div>

          {completed && task.completed_at && (
            <p className="text-xs text-green-600 mt-2">
              ✅ أُنجز في {format(parseISO(task.completed_at), 'HH:mm')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
