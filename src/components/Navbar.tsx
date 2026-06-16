import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Trophy, CheckSquare, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/add', label: 'إضافة مهمة', icon: PlusCircle },
  { path: '/achievements', label: 'الإنجازات', icon: Trophy },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function Navbar() {
  const location = useLocation();
  const { profile, isGuest, signOut } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <nav className="bg-[#1E2A4A] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#4A90D9] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <CheckSquare size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide">Taskly</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#4A90D9] text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title={dark ? 'الوضع النهاري' : 'الوضع الداكن'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User */}
          <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-3">
            <div className="w-8 h-8 bg-[#4A90D9]/30 rounded-full flex items-center justify-center text-sm font-bold text-[#4A90D9]">
              {(profile?.full_name || 'م')[0]}
            </div>
            <span className="hidden lg:block text-sm text-gray-300 max-w-24 truncate">
              {profile?.full_name || 'مستخدم'}
            </span>
            {!isGuest && (
              <button
                onClick={signOut}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
