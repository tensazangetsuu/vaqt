import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import translations from '../i18n';
import { Globe } from 'lucide-react';

const CATEGORIES = [
  { value: 'barbershop',   emoji: '✂️' },
  { value: 'beauty_salon', emoji: '💅' },
  { value: 'nail_studio',  emoji: '💅' },
  { value: 'clinic',       emoji: '🏥' },
  { value: 'photography',  emoji: '📷' },
  { value: 'other',        emoji: '🏪' },
];

export default function Register() {
  const { register } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const cities = translations[lang].cities;

  const [form, setForm] = useState({
    name: '', email: '', password: '', category: 'barbershop', city: 'Toshkent', phone: '', address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <button
        onClick={toggleLang}
        className="fixed top-5 right-5 text-espresso/50 hover:text-espresso text-sm font-medium transition-colors"
      >
        <Globe size={14} strokeWidth={2} /> {lang === 'uz' ? 'RU' : 'UZ'}
      </button>

      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-terra rounded-2xl flex items-center justify-center shadow-terra">
              <span className="font-heading font-bold text-white text-xl">V</span>
            </div>
            <span className="font-heading font-bold text-espresso text-2xl">Vaqt</span>
          </div>
          <h1 className="font-heading font-bold text-espresso text-3xl">{t('registerTitle')}</h1>
        </div>

        <div className="card shadow-warm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('businessName')}</label>
              <input className="input" placeholder="Jamshid Sartaroshxona" value={form.name} onChange={set('name')} required />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-2">{t('category')}</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: c.value }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-xs font-medium transition-all
                      ${form.category === c.value
                        ? 'border-terra bg-terra/8 text-espresso'
                        : 'border-cream-300 text-espresso/60 hover:border-terra/40'}`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-center leading-tight">{t(c.value)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('city')}</label>
                <select value={form.city} onChange={set('city')}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('phone')}</label>
                <input className="input" placeholder="+998 90 123-45-67" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('email')}</label>
              <input type="email" className="input" placeholder="siz@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('password')}</label>
              <input type="password" className="input" placeholder="Kamida 6 ta belgi" value={form.password} onChange={set('password')} required minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? t('loading') : t('signUp')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-espresso/50">
            {t('hasAccount')}{' '}
            <Link to="/login" className="text-terra font-semibold hover:text-terra-dark transition-colors">{t('signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
