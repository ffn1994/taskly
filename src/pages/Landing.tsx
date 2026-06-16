import { Link } from 'react-router-dom';
import { CheckSquare, Brain, Zap, Target, Calendar, BarChart3, ArrowLeft } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'إدخال بلغة طبيعية',
    desc: 'اكتب مهمتك كما تتحدث، والذكاء الاصطناعي يستخرج كل التفاصيل تلقائياً',
    color: '#4A90D9',
    bg: 'bg-blue-50',
  },
  {
    icon: Target,
    title: 'تصنيف أيزنهاور الذكي',
    desc: 'تصنيف تلقائي للمهام حسب الأولوية والإلحاح دون أي جهد منك',
    color: '#E74C3C',
    bg: 'bg-red-50',
  },
  {
    icon: Calendar,
    title: 'تخطيط اليوم بالذكاء الاصطناعي',
    desc: 'حدد وقتك المتاح والذكاء الاصطناعي يرتب مهامك للحصول على أقصى إنتاجية',
    color: '#27AE60',
    bg: 'bg-green-50',
  },
  {
    icon: Zap,
    title: 'رؤى ذكية يومية',
    desc: 'تحليل يومي لمهامك مع توصيات للتركيز على ما يحقق 80% من قيمتك',
    color: '#F39C12',
    bg: 'bg-yellow-50',
  },
  {
    icon: BarChart3,
    title: 'متابعة الإنجازات',
    desc: 'تتبع تقدمك اليومي واحتفل بإنجازاتك مع إحصائيات مفصلة',
    color: '#E67E22',
    bg: 'bg-orange-50',
  },
  {
    icon: CheckSquare,
    title: 'واجهة نظيفة وسريعة',
    desc: 'تصميم حديث مريح للعين يساعدك على التركيز دون أي تشتيت',
    color: '#8E44AD',
    bg: 'bg-purple-50',
  },
];

const matrix = [
  { emoji: '🔴', q: 'افعل الآن', label: 'عاجل ومهم', color: '#E74C3C', bg: 'bg-red-50', border: 'border-red-200' },
  { emoji: '🟠', q: 'جدول', label: 'مهم وغير عاجل', color: '#E67E22', bg: 'bg-orange-50', border: 'border-orange-200' },
  { emoji: '🟡', q: 'فوّض', label: 'عاجل وغير مهم', color: '#F39C12', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { emoji: '🟢', q: 'أزل أو أجّل', label: 'غير عاجل وغير مهم', color: '#27AE60', bg: 'bg-green-50', border: 'border-green-200' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero */}
      <div className="bg-[#1E2A4A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4A90D9] rounded-xl flex items-center justify-center">
              <CheckSquare size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold">Taskly</span>
          </div>
          <Link to="/dashboard" className="btn-primary text-sm py-2 px-5">
            ابدأ الآن
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-[#4A90D9]/20 text-[#4A90D9] rounded-full px-4 py-2 text-sm mb-6 border border-[#4A90D9]/30">
            <Brain size={16} />
            مساعدك التنفيذي الذكي
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            أنجز أكثر بجهد{' '}
            <span className="text-[#4A90D9]">أقل</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Taskly ليس مجرد قائمة مهام. إنه مساعدك التنفيذي الذكي الذي يفهم مهامك،
            يصنفها، ويخطط يومك تلقائياً.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-2 justify-center">
              ابدأ مجاناً الآن
              <ArrowLeft size={20} />
            </Link>
            <Link to="/add" className="btn-secondary text-lg py-4 px-8 inline-flex items-center gap-2 justify-center bg-white/10 text-white border-white/20 hover:bg-white/20">
              جرّب الآن
            </Link>
          </div>
        </div>
      </div>

      {/* AI Demo */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-400 mb-3 font-medium">مثال حقيقي — اكتب بلغتك الطبيعية:</p>
          <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm mb-4 border border-gray-200">
            "لدي اجتماع مهم غداً الساعة 10 صباحاً مع الموردين"
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'العنوان', value: 'اجتماع مع الموردين', icon: '📝' },
              { label: 'التاريخ', value: 'غداً', icon: '📅' },
              { label: 'الوقت', value: '10:00 صباحاً', icon: '⏰' },
              { label: 'الأولوية', value: '🔴 عاجل ومهم', icon: '🎯' },
            ].map(item => (
              <div key={item.label} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-[#4A90D9] font-semibold mb-1">{item.icon} {item.label}</p>
                <p className="text-sm font-medium text-[#1E2A4A]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E2A4A] mb-4">كل ما تحتاجه لتكون منتجاً</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Taskly يجمع الذكاء الاصطناعي مع منهجيات الإنتاجية المجربة في تجربة سلسة وبسيطة</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card hover:shadow-md transition-shadow duration-200">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} style={{ color }} />
              </div>
              <h3 className="font-bold text-[#1E2A4A] mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eisenhower Matrix */}
      <div className="bg-[#1E2A4A]/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1E2A4A] mb-3">مصفوفة أيزنهاور</h2>
            <p className="text-gray-500">المنهجية التي يستخدمها أنجح المديرين في العالم — مدمجة في Taskly</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {matrix.map(item => (
              <div key={item.label} className={`${item.bg} ${item.border} border-2 rounded-2xl p-5 text-center`}>
                <div className="text-4xl mb-2">{item.emoji}</div>
                <p className="font-bold text-sm" style={{ color: item.color }}>{item.q}</p>
                <p className="text-xs text-gray-600 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-[#1E2A4A] mb-4">جاهز لتغيير طريقة عملك؟</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">ابدأ الآن مجاناً. لا حاجة لتسجيل. فقط اكتب مهمتك الأولى وشاهد الذكاء الاصطناعي يعمل.</p>
        <Link to="/add" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
          اكتب مهمتك الأولى
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Footer */}
      <div className="bg-[#1E2A4A] text-gray-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckSquare size={16} className="text-[#4A90D9]" />
          <span className="text-white font-semibold">Taskly</span>
        </div>
        <p>مساعدك التنفيذي الذكي لإدارة المهام باللغة العربية</p>
      </div>
    </div>
  );
}
