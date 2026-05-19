import { useLocation, useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { formatUZS, formatPhone } from '../api';
import { CheckCircle2, Phone, MapPin, Scissors, CalendarDays, Clock, Banknote, User, Hash } from 'lucide-react';

export default function BookingConfirm() {
  const { state } = useLocation();
  const { slug }  = useParams();
  const { t }     = useLang();
  const booking   = state?.booking;

  if (!booking) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="font-heading text-xl text-espresso mb-6">Sahifa topilmadi</div>
        <Link to={`/book/${slug}`} className="btn-primary">{t('back')}</Link>
      </div>
    </div>
  );

  const details = [
    { icon: Scissors,    label: 'Xizmat',  value: booking.service_name },
    { icon: CalendarDays,label: 'Sana',    value: booking.booking_date },
    { icon: Clock,       label: 'Vaqt',    value: booking.booking_time },
    { icon: User,        label: 'Mijoz',   value: booking.customer_name },
    { icon: Phone,       label: 'Telefon', value: formatPhone(booking.customer_phone) },
  ];

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-5">
      <div className="w-full max-w-sm animate-scale-in">

        {/* Success mark */}
        <div className="text-center mb-8">
          <CheckCircle2 size={72} strokeWidth={1.25} className="mx-auto text-green-500 mb-5" />
          <h1 className="font-heading font-bold text-espresso text-3xl">{t('bookingSuccess')}</h1>
          <p className="text-espresso/50 text-sm mt-2">{t('bookingConfirmed')}</p>
        </div>

        {/* Business */}
        <div className="text-center mb-5">
          <div className="font-heading font-bold text-terra text-xl">{booking.business_name}</div>
          {booking.address && (
            <div className="flex items-center justify-center gap-1 text-sm text-espresso/50 mt-1">
              <MapPin size={12} strokeWidth={2} /> {booking.address}
            </div>
          )}
          {booking.business_phone && (
            <div className="flex items-center justify-center gap-1 text-sm text-espresso/50 mt-0.5">
              <Phone size={12} strokeWidth={2} /> {formatPhone(booking.business_phone)}
            </div>
          )}
        </div>

        {/* Detail card */}
        <div className="card shadow-warm mb-5">
          <div className="space-y-3">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-espresso/50">
                  <Icon size={13} strokeWidth={2} /> {label}
                </span>
                <span className="font-semibold text-espresso">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-cream-300">
              <span className="flex items-center gap-1.5 text-espresso/50 text-sm">
                <Banknote size={13} strokeWidth={2} /> Narx
              </span>
              <span className="font-heading font-bold text-terra text-xl">{formatUZS(booking.price_uzs)}</span>
            </div>
          </div>
        </div>

        {/* Reference number */}
        <div className="bg-espresso rounded-2xl px-5 py-4 text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 text-cream-100/50 text-xs uppercase tracking-widest mb-1">
            <Hash size={11} strokeWidth={2.5} /> Buyurtma raqami
          </div>
          <div className="font-mono font-bold text-cream-100 text-xl tracking-wider">
            VAQT-{String(booking.id).padStart(5, '0')}
          </div>
        </div>

        <Link to={`/book/${slug}`} className="btn-primary w-full text-center block py-3.5 text-base">
          {t('bookAnother')}
        </Link>
      </div>
    </div>
  );
}
