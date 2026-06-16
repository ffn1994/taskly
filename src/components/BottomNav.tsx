import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Trophy, Settings } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/add', label: 'إضافة', icon: PlusCircle },
  { path: '/achievements', label: 'الإنجازات', icon: Trophy },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-stretch">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          const isAdd = path === '/add';
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] transition-colors ${
                isAdd
                  ? 'relative'
                  : active
                  ? 'text-[#4A90D9]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isAdd ? (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  active ? 'bg-[#1E2A4A]' : 'bg-[#4A90D9]'
                } -mt-5`}>
                  <Icon size={22} className="text-white" />
                </div>
              ) : (
                <>
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className={`text-[10px] font-medium ${active ? 'text-[#4A90D9]' : ''}`}>{label}</span>
                  {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4A90D9] rounded-full" />}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
