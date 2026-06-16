import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

type Mode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, setGuestName } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabaseReady = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let err: string | null = null;
    if (mode === 'login') {
      err = await signIn(email, password);
    } else {
      if (!fullName.trim()) { setError('الاسم مطلوب'); setLoading(false); return; }
      err = await signUp(email, password, fullName);
      if (!err) {
        setSuccess('تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.');
        setLoading(false);
        return;
      }
    }

    if (err) {
      const msgs: Record<string, string> = {
        'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'User already registered': 'البريد الإلكتروني مسجل مسبقاً',
        'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      };
      setError(msgs[err] || err);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleGuest = () => {
    const name = fullName.trim() || 'المستخدم';
    setGuestName(name);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E2A4A] to-[#2a3d6b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#4A90D9] rounded-2xl flex items-center justify-center shadow-lg">
              <CheckSquare size={26} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Taskly</span>
          </div>
          <p className="text-gray-300 text-sm">مساعدك التنفيذي الذكي</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Tabs */}
          {supabaseReady && (
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              {(['login', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === m ? 'bg-white shadow-md text-[#1E2A4A]' : 'text-gray-500'
                  }`}
                >
                  {m === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
                </button>
              ))}
            </div>
          )}

          {!supabaseReady && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-700 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>Supabase غير مفعّل — يمكنك المتابعة كضيف مع حفظ البيانات محلياً</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === 'signup' || !supabaseReady) && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">الاسم</label>
                <div className="relative">
                  <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="فهد العمري"
                    className="input-field pr-10"
                  />
                </div>
              </div>
            )}

            {supabaseReady && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="fahad@example.com"
                      className="input-field pr-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pr-10 pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جارٍ التحميل...</>
                    : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'
                  }
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400">أو</span></div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleGuest}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {supabaseReady ? 'متابعة كضيف (بدون حساب)' : 'ابدأ الاستخدام'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          بياناتك محفوظة بأمان ومشفّرة
        </p>
      </div>
    </div>
  );
}
