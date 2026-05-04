import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api, formatUZS } from '../api';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import {
  CalendarCheck, Clock, BarChart3, Banknote,
  ArrowUpRight, Inbox, ChevronRight, Check,
} from 'lucide-react';

const STATUS_BADGE = {
  pending:   'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card-hover">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${accent || 'bg-terra/10'}`}>
        <Icon size={20} strokeWidth={1.75} className="text-espresso/70" />
      </div>
      <div className="text-espresso/50 text-sm font-medium">{label}</div>
      <div className="font-heading font-bold text-espresso text-2xl mt-1 tracking-tight">{value}</div>
    </div>
  );
}

function BookingRow({ booking, t, onStatusChange }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-cream-300 last:border-0 group">
      <div className="w-14 h-10 rounded-xl bg-cream-200 flex items-center justify-center flex-shrink-0">
        <span className="font-heading font-bold text-espresso text-sm">{booking.booking_time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-espresso text-sm truncate">{booking.customer_name}</div>
        <div className="text-xs text-espresso/50 truncate">{booking.service_name}</div>
      </div>
      <span className={STATUS_BADGE[booking.status]}>{t(booking.status)}</span>
      {booking.status === 'pending' && (
        <button
          onClick={() => onStatusChange(booking.id, 'confirmed')}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center
                     bg-terra text-white rounded-xl hover:bg-terra-dark transition-all"
        >
          <Check size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function WeekCalendar({ bookings, t }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="card">
      <div className="section-title mb-5">{t('weekCalendar')}</div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const count = bookings.filter(b => b.booking_date === dateStr).length;
          const isToday = isSameDay(day, today);
          return (
            <div key={dateStr}
              className={`rounded-2xl p-2 text-center transition-all
                ${isToday ? 'bg-espresso text-cream-100 shadow-warm-sm' : 'hover:bg-cream-200'}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-terra' : 'text-espresso/40'}`}>
                {t(format(day, 'EEE').toLowerCase().slice(0, 3))}
              </div>
              <div className={`font-heading font-bold text-lg leading-none ${isToday ? 'text-cream-100' : 'text-espresso'}`}>
                {format(day, 'd')}
              </div>
              {count > 0 && (
                <div className={`mt-1.5 text-xs font-bold ${isToday ? 'text-saffron' : 'text-terra'}`}>{count}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { business } = useAuth();
  const { t } = useLang();

  const [stats, setStats]           = useState(null);
  const [todayBookings, setToday]   = useState([]);
  const [upcoming, setUpcoming]     = useState([]);
  const [allBookings, setAll]       = useState([]);
  const [loading, setLoading]       = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  async function load() {
    try {
      const [s, all] = await Promise.all([api.bookings.stats(), api.bookings.list()]);
      setStats(s);
      setAll(all.filter(b => b.status !== 'cancelled'));
      setToday(all.filter(b => b.booking_date === today && b.status !== 'cancelled'));
      setUpcoming(all.filter(b => b.booking_date > today && b.status !== 'cancelled').slice(0, 5));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await api.bookings.updateStatus(id, status);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <span className="font-heading text-xl text-espresso/30 animate-pulse">{t('loading')}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-espresso/40 text-sm font-medium mb-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</div>
          <h1 className="page-title">Salom, {business?.name?.split(' ')[0]}</h1>
        </div>
        <a href={`/book/${business?.slug}`} target="_blank" rel="noreferrer"
          className="btn-secondary text-sm hidden sm:flex items-center gap-2">
          <ArrowUpRight size={15} strokeWidth={2} />
          {t('bookNow')}
        </a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CalendarCheck} label={t('todayBookings')}   value={stats.todayCount}                     accent="bg-saffron/15" />
          <StatCard icon={Clock}         label={t('pendingApprovals')} value={stats.pendingCount}                   accent="bg-terra/10" />
          <StatCard icon={BarChart3}     label={t('totalThisMonth')}   value={stats.totalThisMonth}                 />
          <StatCard icon={Banknote}      label={t('revenueEstimate')}  value={formatUZS(stats.revenueThisMonth)}    accent="bg-sage/15" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's bookings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-1">
              <div className="section-title">{t('todayBookings')}</div>
              <Link to="/dashboard/bookings"
                className="flex items-center gap-1 text-terra text-sm font-semibold hover:text-terra-dark transition-colors">
                {t('allBookings')} <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            <div className="text-espresso/40 text-xs mb-4">{format(new Date(), 'd MMMM')}</div>

            {todayBookings.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox size={36} strokeWidth={1.25} className="mx-auto text-espresso/20 mb-3" />
                <div className="text-espresso/40 text-sm">{t('noBookings')}</div>
              </div>
            ) : (
              todayBookings.map(b => (
                <BookingRow key={b.id} booking={b} t={t} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

        {/* Weekly calendar */}
        <WeekCalendar bookings={allBookings} t={t} />
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="card">
          <div className="section-title mb-4">{t('upcomingBookings')}</div>
          {upcoming.map(b => (
            <BookingRow key={b.id} booking={b} t={t} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
