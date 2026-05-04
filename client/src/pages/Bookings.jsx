import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api, formatUZS, formatPhone } from '../api';
import { Inbox, Scissors, Phone, CalendarDays, Clock, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const BADGE = {
  pending:   'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const ACTIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const ACTION_STYLE = {
  confirmed: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  completed: 'bg-green-50 text-green-700 hover:bg-green-100',
  cancelled: 'bg-red-50 text-red-600 hover:bg-red-100',
};

export default function Bookings() {
  const { t } = useLang();
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate]     = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate)   params.date   = filterDate;
      setBookings(await api.bookings.list(params));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterStatus, filterDate]);

  const handleStatus = async (id, status) => {
    await api.bookings.updateStatus(id, status);
    load();
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">{t('allBookings')}</h1>
          <p className="text-espresso/50 text-sm mt-1">{bookings.length} ta natija</p>
        </div>
        <button
          onClick={() => { setFilterDate(today); setFilterStatus(''); }}
          className="text-terra text-sm font-semibold hover:text-terra-dark transition-colors"
        >
          Bugun
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Barcha statuslar</option>
          <option value="pending">{t('pending')}</option>
          <option value="confirmed">{t('confirmed')}</option>
          <option value="completed">{t('completed')}</option>
          <option value="cancelled">{t('cancelled')}</option>
        </select>

        <input type="date" className="input w-auto py-2.5 text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />

        {(filterStatus || filterDate) && (
          <button onClick={() => { setFilterStatus(''); setFilterDate(''); }}
            className="text-espresso/50 hover:text-espresso text-sm px-3 transition-colors">
            × Tozalash
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center text-espresso/30 animate-pulse font-heading text-xl">{t('loading')}</div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-20">
          <Inbox size={44} strokeWidth={1.25} className="mx-auto text-espresso/20 mb-4" />
          <div className="font-heading font-semibold text-espresso text-xl">{t('noBookings')}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="card animate-slide-up">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {/* Date/time block */}
                  <div className="w-14 h-14 rounded-2xl bg-cream-200 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-[10px] text-espresso/50 font-semibold">{b.booking_date.slice(5)}</div>
                    <div className="font-heading font-bold text-espresso text-sm leading-tight">{b.booking_time}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-espresso">{b.customer_name}</span>
                      <span className={BADGE[b.status]}>{t(b.status)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-espresso/60 mb-0.5">
                      <Scissors size={12} strokeWidth={2} />
                      {b.service_name}
                      <span className="text-espresso/30">·</span>
                      <Clock size={11} strokeWidth={2} />
                      {b.duration_minutes} {t('minutes')}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-espresso/50">
                      <Phone size={11} strokeWidth={2} />
                      {formatPhone(b.customer_phone)}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end font-heading font-bold text-terra text-lg">
                    <Banknote size={16} strokeWidth={1.75} />
                    {formatUZS(b.price_uzs)}
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {ACTIONS[b.status].map(action => (
                      <button key={action} onClick={() => handleStatus(b.id, action)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${ACTION_STYLE[action]}`}>
                        {t(`mark${action.charAt(0).toUpperCase() + action.slice(1)}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
