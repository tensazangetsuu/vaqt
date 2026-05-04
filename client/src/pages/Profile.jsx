import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../api';
import translations from '../i18n';

const CATEGORIES = ['barbershop','beauty_salon','nail_studio','clinic','photography','other'];
const DAY_ORDER  = ['mon','tue','wed','thu','fri','sat','sun'];

const TIMES = [];
for (let h = 6; h <= 23; h++) {
  for (let m of [0, 30]) {
    TIMES.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }
}

export default function Profile() {
  const { business, updateBusiness } = useAuth();
  const { t, lang } = useLang();
  const cities = translations[lang].cities;

  const [form, setForm]     = useState({ name:'', category:'', city:'', address:'', phone:'', working_hours:{} });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (business) setForm({
      name: business.name, category: business.category, city: business.city,
      address: business.address || '', phone: business.phone || '',
      working_hours: business.working_hours || {},
    });
  }, [business]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setHours = (day, field, value) =>
    setForm(f => ({ ...f, working_hours: { ...f.working_hours, [day]: { ...f.working_hours[day], [field]: value } } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      updateBusiness(await api.businesses.update(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">{t('profile')}</h1>
        {business?.slug && (
          <p className="text-espresso/50 text-sm mt-1.5">
            Umumiy havola:{' '}
            <a href={`/book/${business.slug}`} target="_blank" rel="noreferrer"
              className="text-terra font-medium hover:underline">
              /book/{business.slug}
            </a>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-5">
          <div className="section-title border-b border-cream-300 pb-4">Asosiy ma'lumotlar</div>

          <div>
            <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('businessName')}</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('category')}</label>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('city')}</label>
              <select value={form.city} onChange={set('city')}>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('address')}</label>
            <input className="input" value={form.address} onChange={set('address')} placeholder="Ko'cha, uy raqami..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('phone')}</label>
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="+998 90 123-45-67" />
          </div>
        </div>

        {/* Working hours */}
        <div className="card">
          <div className="section-title border-b border-cream-300 pb-4 mb-5">{t('workingHours')}</div>
          <div className="space-y-3">
            {DAY_ORDER.map(day => {
              const cfg = form.working_hours[day] || { open: false, start: '09:00', end: '18:00' };
              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-9 text-sm font-bold text-espresso/60 text-right">{t(day)}</div>

                  <input type="checkbox"
                    checked={cfg.open} onChange={e => setHours(day, 'open', e.target.checked)} />

                  {cfg.open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select value={cfg.start} onChange={e => setHours(day, 'start', e.target.value)}>
                        {TIMES.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                      </select>
                      <span className="text-espresso/40 text-sm font-medium">—</span>
                      <select value={cfg.end} onChange={e => setHours(day, 'end', e.target.value)}>
                        {TIMES.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="text-espresso/35 text-sm italic">{t('closed')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">{error}</div>}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? t('loading') : t('save')}
          </button>
          {saved && <span className="text-green-600 text-sm font-semibold">✓ Saqlandi</span>}
        </div>
      </form>
    </div>
  );
}
