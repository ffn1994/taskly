import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, Check, Clock, Calendar, Tag } from 'lucide-react';
import { extractTaskFromNaturalLanguage, isAIConfigured } from '../lib/ai';
import { createTask } from '../lib/storage';
import type { AIExtractedTask, Priority, TaskCategory } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../types';
import PriorityBadge from '../components/PriorityBadge';

const examplePrompts = [
  'اتصل بالمحاسب اليوم الساعة 5 مساءً',
  'اجتماع مهم مع العملاء غداً صباحاً',
  'إنهاء مقترح المشروع الأسبوع القادم',
  'مراجعة العقود قبل الجمعة',
  'لدي اجتماع مهم مع الموردين غداً الساعة 10 صباحاً',
];

export default function AddTask() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [extracted, setExtracted] = useState<AIExtractedTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await extractTaskFromNaturalLanguage(input.trim());
      setExtracted(result);
    } catch (e) {
      setError('حدث خطأ أثناء تحليل المهمة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extracted) return;
    setSaving(true);
    try {
      await createTask(extracted);
      navigate('/dashboard');
    } catch (e) {
      setError('حدث خطأ أثناء حفظ المهمة.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !loading) {
      e.preventDefault();
      handleExtract();
    }
  };

  const updateExtracted = (field: keyof AIExtractedTask, value: string | number | undefined) => {
    if (!extracted) return;
    setExtracted({ ...extracted, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E2A4A] mb-2">إضافة مهمة جديدة</h1>
        <p className="text-gray-500">اكتب مهمتك بلغتك الطبيعية والذكاء الاصطناعي سيفهمها</p>
      </div>

      {!isAIConfigured() && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">وضع التحليل الأساسي</p>
            <p>لم يتم تكوين مفتاح OpenAI API. يعمل التطبيق بتحليل أساسي للغة. لتفعيل الذكاء الاصطناعي الكامل، أضف VITE_OPENAI_API_KEY في ملف .env</p>
          </div>
        </div>
      )}

      {/* Main Input */}
      <div className="card mb-6">
        <label className="block text-sm font-semibold text-[#1E2A4A] mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#4A90D9]" />
          اكتب مهمتك
        </label>
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="مثال: اجتماع مهم مع الموردين غداً الساعة 10 صباحاً"
            className="input-field resize-none h-28 text-base"
            disabled={loading}
          />
        </div>

        {/* Example prompts */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-2">أمثلة:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map(p => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="text-xs bg-gray-50 hover:bg-blue-50 hover:text-[#4A90D9] text-gray-500 border border-gray-200 hover:border-blue-200 rounded-full px-3 py-1.5 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-3 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <button
          onClick={handleExtract}
          disabled={!input.trim() || loading}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جارٍ التحليل...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              تحليل المهمة بالذكاء الاصطناعي
            </>
          )}
        </button>
      </div>

      {/* Extracted Result */}
      {extracted && (
        <div className="card animate-fade-in space-y-5">
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <Check size={18} />
            تم تحليل المهمة بنجاح
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">العنوان</label>
            <input
              type="text"
              value={extracted.title}
              onChange={e => updateExtracted('title', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">الوصف (اختياري)</label>
            <textarea
              value={extracted.description || ''}
              onChange={e => updateExtracted('description', e.target.value || undefined)}
              className="input-field resize-none h-20 text-sm"
              placeholder="أضف وصفاً إضافياً..."
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Tag size={11} />
                الأولوية
              </label>
              <select
                value={extracted.priority}
                onChange={e => updateExtracted('priority', e.target.value as Priority)}
                className="input-field text-sm"
              >
                {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.emoji} {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">التصنيف</label>
              <select
                value={extracted.category}
                onChange={e => updateExtracted('category', e.target.value as TaskCategory)}
                className="input-field text-sm"
              >
                {Object.entries(CATEGORY_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.emoji} {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={11} />
                تاريخ الاستحقاق
              </label>
              <input
                type="date"
                value={extracted.due_date || ''}
                onChange={e => updateExtracted('due_date', e.target.value || undefined)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Clock size={11} />
                الوقت
              </label>
              <input
                type="time"
                value={extracted.due_time || ''}
                onChange={e => updateExtracted('due_time', e.target.value || undefined)}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              المدة التقديرية (بالدقائق)
            </label>
            <input
              type="number"
              value={extracted.estimated_duration || ''}
              onChange={e => updateExtracted('estimated_duration', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="30"
              min={5}
              max={480}
            />
          </div>

          {/* Priority Preview */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">معاينة الأولوية:</p>
            <PriorityBadge priority={extracted.priority} />
            <p className="text-xs text-gray-500 mt-2">{PRIORITY_CONFIG[extracted.priority].description}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !extracted.title.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Check size={18} />
                  حفظ المهمة
                </>
              )}
            </button>
            <button
              onClick={() => { setExtracted(null); setInput(''); }}
              className="btn-secondary px-4"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
