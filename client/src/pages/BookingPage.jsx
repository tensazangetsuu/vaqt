import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api, formatUZS } from '../api';
import { format, addDays, startOfToday } from 'date-fns';
import {
  Scissors, Sparkles, Star, Stethoscope, Camera, Store,
  ChevronLeft, Check, Clock, Banknote, Globe, CalendarDays, Phone, User,
} from 'lucide-react';

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

const CAT_ICON = {
  barbershop:   Scissors,
  beauty_salon: Sparkles,
  nail_studio:  Star,
  clinic:       Stethoscope,
  photography:  Camera,
  other:        Store,
};

function getNextDates(wh, count = 14) {
  const dates = [];
  let d = startOfToday(), tries = 0;
  while (dates.length < count && tries < 60) {
    if (wh[DAY_KEYS[d.getDay()]]?.open) dates.push(new Date(d));
    d = addDays(d, 1);
    tries++;
  }
  return dates;
}

function StepBar({ step, labels }) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
      {labels.map((label, i) => {
        const n = i + 1;
        const done   = n < step;
        const active = n === step;
        return (
          <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
            ${done   ? 'bg-terra/15 text-terra-dark' :
              active ? 'bg-espresso text-cream-100 shadow-warm-sm' :
                       'bg-cream-200 text-espresso/40'}`}>
            {done
              ? <Check size={11} strokeWidth={3} />
              : <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px]
                  ${active ? 'bg-terra text-white' : 'bg-cream-300 text-espresso/50'}`}>{n}</span>}
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BookingPage() {
  const { slug } = useParams();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [step, setStep]           = useState(1);
  const [selectedService, setService] = useState(null);
  const [selectedDate, setDate]   = useState(null);
  const [selectedSlot, setSlot]   = useState(null);
  const [slots, setSlots]         = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerName, setName]   = useState('');
  const [customerPhone, setPhone] = useState('+998 ');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    api.businesses.getBySlug(slug)
      .then(d => { setBusiness(d); setLoading(false); })
      .catch(() => { setError('Biznes topilmadi'); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setSlotsLoading(true);
    setSlots([]); setSlot(null);
    api.bookings.availableSlots({
      businessId: business.id,
      serviceId: selectedService.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
    }).then(d => setSlots(d.slots || [])).finally(() => setSlotsLoading(false));
  }, [selectedService, selectedDate]);

  const handleConfirm = async () => {
    if (!customerName.trim()) { setSubmitError('Ismingizni kiriting'); return; }
    if (customerPhone.replace(/\D/g,'').length < 9) { setSubmitError('Telefon raqamini to\'g\'ri kiriting'); return; }
    setSubmitting(true); setSubmitError('');
    try {
      const booking = await api.bookings.create({
        business_id: business.id, service_id: selectedService.id,
        customer_name: customerName.trim(), customer_phone: customerPhone.trim(),
        booking_date: format(selectedDate, 'yyyy-MM-dd'), booking_time: selectedSlot,
      });
      navigate(`/book/${slug}/confirm`, { state: { booking } });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <span className="font-heading text-xl text-espresso/30 animate-pulse">{t('loading')}</span>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Store size={48} strokeWidth={1} className="mx-auto text-espresso/20 mb-4" />
        <div className="font-heading text-xl text-espresso">{error}</div>
      </div>
    </div>
  );

  const dates = getNextDates(business.working_hours);
  const stepLabels = [t('selectService'), t('selectDate'), t('selectTime'), t('confirmBooking')];
  const CatIcon = CAT_ICON[business.category] || Store;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-espresso px-5 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="w-14 h-14 bg-terra/20 border border-terra/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CatIcon size={24} strokeWidth={1.5} className="text-terra-light" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-cream-100 text-xl truncate">{business.name}</h1>
            <div className="text-cream-100/60 text-sm">
              {business.city}{business.address ? `, ${business.address}` : ''}
            </div>
          </div>
          <button onClick={toggleLang}
            className="flex items-center gap-1 text-cream-100/50 hover:text-cream-100 text-xs font-bold transition-colors px-2">
            <Globe size={13} strokeWidth={2} />
            {lang === 'uz' ? 'RU' : 'UZ'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-7">
        <StepBar step={step} labels={stepLabels} />

        {/* ── Step 1: Service ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-slide-up space-y-3">
            <h2 className="section-title mb-5">{t('selectService')}</h2>
            {business.services.length === 0 ? (
              <div className="text-center py-12 text-espresso/40">{t('noServices')}</div>
            ) : business.services.map(svc => (
              <button key={svc.id}
                onClick={() => { setService(svc); setStep(2); }}
                className="w-full text-left p-5 rounded-3xl border-2 border-cream-300 bg-cream-50
                           hover:border-terra/50 hover:shadow-warm-sm transition-all duration-150 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-espresso text-base">{svc.name}</div>
                    <div className="flex items-center gap-1 text-sm text-espresso/50 mt-0.5">
                      <Clock size={12} strokeWidth={2} />
                      {svc.duration_minutes} {t('minutes')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-heading font-bold text-terra text-lg group-hover:scale-105 transition-transform">
                    <Banknote size={16} strokeWidth={1.75} />
                    {formatUZS(svc.price_uzs)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Date ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(1)} className="btn-ghost py-2 px-3 text-sm flex items-center gap-1">
                <ChevronLeft size={15} strokeWidth={2.5} /> {t('back')}
              </button>
              <div>
                <h2 className="section-title">{t('selectDate')}</h2>
                <div className="text-xs text-espresso/50">{selectedService?.name}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dates.map(d => {
                const ds = format(d, 'yyyy-MM-dd');
                const sel = selectedDate && format(selectedDate,'yyyy-MM-dd') === ds;
                return (
                  <button key={ds} onClick={() => { setDate(d); setStep(3); }}
                    className={`rounded-2xl p-3 text-center transition-all duration-150
                      ${sel ? 'bg-espresso text-cream-100 shadow-warm' : 'bg-cream-50 border border-cream-300 hover:border-terra/50 hover:shadow-warm-xs'}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${sel ? 'text-terra' : 'text-espresso/40'}`}>
                      {format(d,'EEE').slice(0,2)}
                    </div>
                    <div className={`font-heading font-bold text-xl leading-tight mt-0.5 ${sel ? 'text-cream-100' : 'text-espresso'}`}>
                      {format(d,'d')}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${sel ? 'text-cream-100/60' : 'text-espresso/40'}`}>
                      {format(d,'MMM')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Time ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(2)} className="btn-ghost py-2 px-3 text-sm flex items-center gap-1">
                <ChevronLeft size={15} strokeWidth={2.5} /> {t('back')}
              </button>
              <div>
                <h2 className="section-title">{t('selectTime')}</h2>
                <div className="text-xs text-espresso/50">
                  {selectedService?.name} · {selectedDate && format(selectedDate,'d MMM yyyy')}
                </div>
              </div>
            </div>

            {slotsLoading ? (
              <div className="py-16 text-center text-espresso/30 animate-pulse font-heading text-lg">{t('loading')}</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays size={44} strokeWidth={1.25} className="mx-auto text-espresso/20 mb-4" />
                <div className="font-heading text-espresso text-xl mb-2">{t('noSlotsAvailable')}</div>
                <button onClick={() => setStep(2)} className="btn-outline mt-4 flex items-center gap-2 mx-auto">
                  <ChevronLeft size={15} strokeWidth={2.5} /> {t('pickAnotherDate')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots.map(slot => (
                  <button key={slot} onClick={() => { setSlot(slot); setStep(4); }}
                    className={`py-3.5 rounded-2xl text-center font-heading font-semibold text-base transition-all duration-150
                      ${selectedSlot === slot
                        ? 'bg-terra text-white shadow-terra scale-105'
                        : 'bg-cream-50 border border-cream-300 text-espresso hover:border-terra/50 hover:shadow-warm-xs'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Confirm ──────────────────────────────────────── */}
        {step === 4 && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(3)} className="btn-ghost py-2 px-3 text-sm flex items-center gap-1">
                <ChevronLeft size={15} strokeWidth={2.5} /> {t('back')}
              </button>
              <h2 className="section-title">{t('confirmBooking')}</h2>
            </div>

            {/* Summary card */}
            <div className="bg-espresso rounded-3xl p-5 mb-6 space-y-3">
              {[
                [t('selectService'), selectedService?.name],
                [t('bookingDate'),   selectedDate && format(selectedDate, 'd MMMM yyyy')],
                [t('bookingTime'),   selectedSlot],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-cream-100/50">{label}</span>
                  <span className="font-semibold text-cream-100">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="flex items-center gap-1.5 text-cream-100/50 text-sm">
                  <Banknote size={14} strokeWidth={1.75} /> {t('price')}
                </span>
                <span className="font-heading font-bold text-terra text-xl">{formatUZS(selectedService?.price_uzs)}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-espresso/70 mb-1.5">
                  <span className="flex items-center gap-1.5"><User size={13} strokeWidth={2} /> {t('yourName')}</span>
                </label>
                <input className="input" placeholder="Azizbek Rahimov"
                  value={customerName} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-espresso/70 mb-1.5">
                  <span className="flex items-center gap-1.5"><Phone size={13} strokeWidth={2} /> {t('yourPhone')}</span>
                </label>
                <input className="input" type="tel" placeholder="+998 90 123-45-67"
                  value={customerPhone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-4 text-sm">
                {submitError}
              </div>
            )}

            <button onClick={handleConfirm} disabled={submitting || !customerName.trim()}
              className="btn-primary w-full py-4 text-base">
              {submitting ? t('loading') : t('confirmBooking')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
