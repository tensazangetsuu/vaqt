import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Scissors, SlidersHorizontal,
  LogOut, Globe, ExternalLink, Menu, X,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',          icon: LayoutDashboard,    label: 'dashboard'   },
  { to: '/dashboard/bookings', icon: CalendarDays,        label: 'allBookings' },
  { to: '/dashboard/services', icon: Scissors,            label: 'services'    },
  { to: '/dashboard/profile',  icon: SlidersHorizontal,   label: 'profile'     },
];

export default function DashboardLayout() {
  const { business, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-espresso flex flex-col
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        {/* Logo */}
        <div className="px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terra rounded-2xl flex items-center justify-center shadow-terra">
              <span className="font-heading font-bold text-white text-xl leading-none">V</span>
            </div>
            <div>
              <div className="font-heading font-bold text-cream-100 text-xl leading-tight">Vaqt</div>
              <div className="text-cream-100/40 text-xs">{t('tagline')}</div>
            </div>
          </div>
        </div>

        {/* Business chip */}
        <div className="mx-4 mb-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/8">
          <div className="text-cream-100/50 text-[11px] uppercase tracking-widest mb-1">{t('businessName')}</div>
          <div className="text-cream-100 font-semibold text-sm truncate leading-snug">{business?.name}</div>
          <a
            href={`/book/${business?.slug}`}
            target="_blank" rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-terra text-xs hover:text-terra-light transition-colors"
          >
            <ExternalLink size={11} />
            /book/{business?.slug}
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ` +
                (isActive
                  ? 'bg-terra text-white shadow-terra'
                  : 'text-cream-100/60 hover:bg-white/8 hover:text-cream-100')
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-6 border-t border-white/8 pt-4 mt-4 space-y-0.5">
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-cream-100/60 hover:bg-white/8 hover:text-cream-100 transition-all"
          >
            <Globe size={16} strokeWidth={1.75} />
            <span>{lang === 'uz' ? 'Русский' : "O'zbekcha"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-cream-100/60 hover:bg-red-500/15 hover:text-red-300 transition-all"
          >
            <LogOut size={16} strokeWidth={1.75} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-espresso/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-cream/80 backdrop-blur border-b border-cream-300 px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-espresso text-cream-100"
          >
            <Menu size={18} />
          </button>
          <span className="font-heading font-bold text-espresso text-xl">Vaqt</span>
        </header>

        <main className="flex-1 p-5 lg:p-10 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
