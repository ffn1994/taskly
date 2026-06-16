import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Edit3, Check, Trash2, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import type { Task, Priority, TaskCategory } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../types';
import { getTaskById, updateTask, completeTask, deleteTask } from '../lib/storage';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});

  useEffect(() => {
    if (!id) return;
    getTaskById(id).then(t => {
      setTask(t);
      setEditData(t || {});
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, editData);
      setTask(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    const updated = await completeTask(task.id);
    setTask(updated);
  };

  const handleDelete = async () => {
    if (!task) return;
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      await deleteTask(task.id);
      navigate('/dashboard');
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <LoadingSpinner />
    </div>
  );

  if (!task) return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-500">لم يتم العثور على المهمة</p>
      <Link to="/dashboard" className="btn-primary mt-4 inline-block">العودة للوحة التحكم</Link>
    </div>
  );

  const config = PRIORITY_CONFIG[task.priority];
  const catConfig = CATEGORY_CONFIG[task.category];
  const isCompleted = task.status === 'completed';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#4A90D9] mb-6 text-sm transition-colors">
        <ArrowRight size={16} />
        العودة للوحة التحكم
      </Link>

      {/* Header card */}
      <div
        className="card mb-6 border-r-4"
        style={{ borderRightColor: config.color }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={editData.title || ''}
                onChange={e => setEditData({ ...editData, title: e.target.value })}
                className="input-field text-lg font-bold mb-3"
              />
            ) : (
              <h1 className={`text-xl font-bold text-[#1E2A4A] mb-3 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-50 rounded-full px-3 py-1">
                {catConfig.emoji} {catConfig.label}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 rounded-full px-3 py-1">
                  <CheckCircle2 size={14} />
                  مكتملة
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className="p-2 text-gray-400 hover:text-[#4A90D9] hover:bg-blue-50 rounded-xl transition-colors"
                  title={editing ? 'حفظ' : 'تعديل'}
                >
                  {editing ? <Check size={18} /> : <Edit3 size={18} />}
                </button>
                {editing && (
                  <button
                    onClick={() => { setEditing(false); setEditData(task); }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    إلغاء
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="حذف"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card mb-6 space-y-5">
        <h2 className="font-bold text-[#1E2A4A] border-b border-gray-100 pb-3">تفاصيل المهمة</h2>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">الوصف</label>
          {editing ? (
            <textarea
              value={editData.description || ''}
              onChange={e => setEditData({ ...editData, description: e.target.value || undefined })}
              className="input-field resize-none h-24 text-sm"
              placeholder="أضف وصفاً..."
            />
          ) : (
            <p className="text-gray-600 text-sm">{task.description || 'لا يوجد وصف'}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">الأولوية</label>
          {editing ? (
            <select
              value={editData.priority || task.priority}
              onChange={e => setEditData({ ...editData, priority: e.target.value as Priority })}
              className="input-field text-sm"
            >
              {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.emoji} {c.label}</option>
              ))}
            </select>
          ) : (
            <div>
              <PriorityBadge priority={task.priority} />
              <p className="text-xs text-gray-400 mt-1">{config.description}</p>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">التصنيف</label>
          {editing ? (
            <select
              value={editData.category || task.category}
              onChange={e => setEditData({ ...editData, category: e.target.value as TaskCategory })}
              className="input-field text-sm"
            >
              {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.emoji} {c.label}</option>
              ))}
            </select>
          ) : (
            <span className="inline-flex items-center gap-2 text-gray-600">
              {catConfig.emoji} {catConfig.label}
            </span>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} />
              تاريخ الاستحقاق
            </label>
            {editing ? (
              <input
                type="date"
                value={editData.due_date || ''}
                onChange={e => setEditData({ ...editData, due_date: e.target.value || undefined })}
                className="input-field text-sm"
              />
            ) : (
              <p className="text-gray-600 text-sm">
                {task.due_date
                  ? format(parseISO(task.due_date), 'EEEE، d MMMM yyyy', { locale: ar })
                  : 'غير محدد'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} />
              الوقت
            </label>
            {editing ? (
              <input
                type="time"
                value={editData.due_time || ''}
                onChange={e => setEditData({ ...editData, due_time: e.target.value || undefined })}
                className="input-field text-sm"
              />
            ) : (
              <p className="text-gray-600 text-sm">{task.due_time || 'غير محدد'}</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">المدة التقديرية</label>
          {editing ? (
            <input
              type="number"
              value={editData.estimated_duration || ''}
              onChange={e => setEditData({ ...editData, estimated_duration: e.target.value ? parseInt(e.target.value) : undefined })}
              className="input-field text-sm"
              placeholder="بالدقائق"
            />
          ) : (
            <p className="text-gray-600 text-sm">
              {task.estimated_duration ? `${task.estimated_duration} دقيقة` : 'غير محدد'}
            </p>
          )}
        </div>

        {/* Timestamps */}
        <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <p className="font-medium mb-1">تاريخ الإضافة</p>
            <p>{format(parseISO(task.created_at), 'd MMM yyyy، HH:mm', { locale: ar })}</p>
          </div>
          {task.completed_at && (
            <div>
              <p className="font-medium mb-1 text-green-600">تاريخ الإنجاز</p>
              <p>{format(parseISO(task.completed_at), 'd MMM yyyy، HH:mm', { locale: ar })}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            إتمام المهمة
          </button>
        </div>
      )}
    </div>
  );
}
