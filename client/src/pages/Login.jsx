import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Globe } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden">
        {/* Background texture circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-terra/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-saffron/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-terra rounded-2xl flex items-center justify-center shadow-terra">
              <span className="font-heading font-bold text-white text-2xl">V</span>
            </div>
            <span className="font-heading font-bold text-cream-100 text-2xl">Vaqt</span>
          </div>

          <h2 className="font-heading font-bold text-cream-100 text-4xl leading-tight text-balance">
            Biznesingizni<br />
            <span className="text-terra">vaqt bilan</span><br />
            boshqaring.
          </h2>
          <p className="mt-4 text-cream-100/50 text-base leading-relaxed max-w-xs">
            O'zbekistondagi kichik bizneslar uchun onlayn yozilish tizimi.
          </p>
        </div>

        <div className="relative flex gap-4">
          {['Sartaroshxona', 'Go\'zallik saloni', 'Tirnoq studiyasi'].map(cat => (
            <div key={cat} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/12 text-cream-100/60 text-xs font-medium">
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="absolute top-5 right-5 flex items-center gap-1.5 text-espresso/50 hover:text-espresso text-sm font-medium transition-colors"
        >
          <Globe size={14} strokeWidth={2} /> {lang === 'uz' ? 'RU' : 'UZ'}
        </button>

        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-terra rounded-xl flex items-center justify-center">
              <span className="font-heading font-bold text-white text-lg">V</span>
            </div>
            <span className="font-heading font-bold text-espresso text-xl">Vaqt</span>
          </div>

          <h1 className="font-heading font-bold text-espresso text-3xl mb-1">{t('loginTitle')}</h1>
          <p className="text-espresso/50 text-sm mb-8">{t('tagline')}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('email')}</label>
              <input className="input" type="email" placeholder="siz@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('password')}</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 text-base">
              {loading ? t('loading') : t('signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-espresso/50">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-terra font-semibold hover:text-terra-dark transition-colors">
              {t('signUp')}
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-2xl bg-saffron-50 border border-saffron/25">
            <div className="text-xs font-semibold text-saffron-dark mb-1">Demo hisob</div>
            <div className="text-xs text-espresso/60 font-mono">shakhzod@demo.com / demo123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
