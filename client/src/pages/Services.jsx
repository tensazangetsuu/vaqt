import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api, formatUZS } from '../api';
import { Plus, Pencil, Trash2, Scissors, Clock, Banknote, X } from 'lucide-react';

function ServiceModal({ service, onSave, onClose, t }) {
  const [form, setForm] = useState({
    name:             service?.name             ?? '',
    duration_minutes: service?.duration_minutes ?? 30,
    price_uzs:        service?.price_uzs        ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onSave({ ...form, duration_minutes: +form.duration_minutes, price_uzs: +form.price_uzs });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-espresso/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream w-full max-w-sm rounded-3xl shadow-warm-lg animate-slide-up">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-cream-300">
          <h3 className="font-heading font-bold text-espresso text-xl">
            {service ? t('edit') : t('addService')}
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-200 text-espresso/50 transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('serviceName')}</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Soch olish..." required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">
                {t('duration')} ({t('minutes')})
              </label>
              <input type="number" className="input" min="5" max="240" step="5"
                value={form.duration_minutes} onChange={set('duration_minutes')} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-espresso/70 mb-1.5">{t('price')} (UZS)</label>
              <input type="number" className="input" min="0" step="1000"
                value={form.price_uzs} onChange={set('price_uzs')} required />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? t('loading') : t('save')}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">{t('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Services() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);

  async function load() {
    try { setServices(await api.services.list()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await api.services.update(modal.id, data);
    else           await api.services.create(data);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm(`${t('delete')}?`)) return;
    await api.services.delete(id);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">{t('services')}</h1>
          <p className="text-espresso/50 text-sm mt-1">{services.length} ta xizmat</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary gap-2">
          <Plus size={16} strokeWidth={2.5} />
          {t('addService')}
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-espresso/30 animate-pulse font-heading text-xl">{t('loading')}</div>
      ) : services.length === 0 ? (
        <div className="card text-center py-20">
          <Scissors size={44} strokeWidth={1.25} className="mx-auto text-espresso/20 mb-4" />
          <div className="font-heading font-semibold text-espresso text-xl mb-2">{t('noServices')}</div>
          <p className="text-espresso/50 text-sm mb-6">Birinchi xizmatni qo'shing</p>
          <button onClick={() => setModal('add')} className="btn-primary mx-auto">{t('addService')}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(svc => (
            <div key={svc.id} className="card-hover flex items-center gap-4 animate-slide-up">
              {/* Icon */}
              <div className="w-12 h-12 bg-terra/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Scissors size={20} strokeWidth={1.5} className="text-terra" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-espresso">{svc.name}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-espresso/50">
                    <Clock size={11} strokeWidth={2} />
                    {svc.duration_minutes} {t('minutes')}
                  </span>
                  <span className="text-cream-300">·</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-terra">
                    <Banknote size={11} strokeWidth={2} />
                    {formatUZS(svc.price_uzs)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setModal(svc)}
                  className="w-9 h-9 flex items-center justify-center bg-cream-200 hover:bg-cream-300 text-espresso/70 rounded-xl transition-colors"
                  title={t('edit')}
                >
                  <Pencil size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                  title={t('delete')}
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ServiceModal service={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} t={t} />
      )}
    </div>
  );
}
