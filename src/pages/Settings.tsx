import { useState } from 'react';
import { User, Clock, LogOut, Save, CheckCircle2, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import { requestNotificationPermission, getNotificationPermission } from '../lib/notifications';

export default function Settings() {
  const { profile, updateProfile, signOut, user, isGuest } = useAuth();
  const { dark, toggle: toggleDark } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifStatus, setNotifStatus] = useState(getNotificationPermission);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
  };
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    working_hours_start: profile?.working_hours_start || '09:00',
    working_hours_end: profile?.working_hours_end || '17:00',
  });

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E2A4A]">الإعدادات</h1>
        <p className="text-gray-500 text-sm mt-1">إدارة حسابك وتفضيلاتك</p>
      </div>

      {/* Account Info */}
      <div className="card mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#4A90D9]/10 rounded-2xl flex items-center justify-center">
            <User size={26} className="text-[#4A90D9]" />
          </div>
          <div>
            <p className="font-bold text-[#1E2A4A]">{profile?.full_name || 'مستخدم'}</p>
            <p className="text-sm text-gray-500">{user?.email || (isGuest ? 'وضع الضيف — بيانات محلية' : '')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">الاسم الكامل</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="input-field"
              placeholder="اسمك الكامل"
            />
          </div>

          {!isGuest && user?.email && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">البريد الإلكتروني</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-field opacity-60 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Working Hours */}
      <div className="card mb-5">
        <h2 className="font-bold text-[#1E2A4A] flex items-center gap-2 mb-5">
          <Clock size={18} className="text-[#4A90D9]" />
          ساعات العمل
        </h2>
        <p className="text-sm text-gray-500 mb-4">يستخدمها الذكاء الاصطناعي لتخطيط يومك</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">وقت البداية</label>
            <input
              type="time"
              value={form.working_hours_start}
              onChange={e => setForm({ ...form, working_hours_start: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">وقت النهاية</label>
            <input
              type="time"
              value={form.working_hours_end}
              onChange={e => setForm({ ...form, working_hours_end: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-[#4A90D9]">
          ⏰ وقت العمل اليومي:{' '}
          {(() => {
            const [sh, sm] = form.working_hours_start.split(':').map(Number);
            const [eh, em] = form.working_hours_end.split(':').map(Number);
            const mins = (eh * 60 + em) - (sh * 60 + sm);
            return mins > 0 ? `${Math.floor(mins / 60)} ساعة و${mins % 60} دقيقة` : '—';
          })()}
        </div>
      </div>

      {/* Appearance & Notifications */}
      <div className="card mb-5 space-y-4">
        <h2 className="font-bold text-[#1E2A4A] dark:text-slate-100">التفضيلات</h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between py-3 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            {dark ? <Moon size={18} className="text-[#4A90D9]" /> : <Sun size={18} className="text-amber-500" />}
            <div>
              <p className="font-medium text-sm">الوضع {dark ? 'الداكن' : 'النهاري'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">تغيير مظهر التطبيق</p>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${dark ? 'bg-[#4A90D9]' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${dark ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-[#4A90D9]" />
            <div>
              <p className="font-medium text-sm">التذكيرات</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">إشعار قبل 15 دقيقة من المهمة</p>
            </div>
          </div>
          {notifStatus === 'granted' ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">✅ مفعّل</span>
          ) : notifStatus === 'denied' ? (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">محظور</span>
          ) : notifStatus === 'unsupported' ? (
            <span className="text-xs text-gray-400">غير مدعوم</span>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="text-xs bg-[#4A90D9] text-white px-3 py-1.5 rounded-full font-semibold hover:bg-[#3a7bc8] transition-colors"
            >
              تفعيل
            </button>
          )}
        </div>
      </div>

      {/* Tech Info */}
      <div className="card mb-5">
        <h2 className="font-bold text-[#1E2A4A] mb-4">حالة التكامل</h2>
        <div className="space-y-3">
          {[
            { label: 'Supabase (قاعدة البيانات)', active: isSupabaseConfigured() },
            { label: 'OpenAI (الذكاء الاصطناعي)', active: !!import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here' },
          ].map(({ label, active }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{label}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {active ? '✅ مفعّل' : '⚪ غير مفعّل'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saved
            ? <><CheckCircle2 size={18} /> تم الحفظ!</>
            : saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جارٍ الحفظ...</>
            : <><Save size={18} /> حفظ التغييرات</>
          }
        </button>

        {!isGuest && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        )}
      </div>
    </div>
  );
}
