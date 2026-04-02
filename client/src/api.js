const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getToken() { return localStorage.getItem('vaqt_token'); }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server xatosi');
  return data;
}

export const api = {
  auth: {
    login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  },
  businesses: {
    me:        ()     => request('/businesses/me'),
    update:    (body) => request('/businesses/me', { method: 'PUT', body: JSON.stringify(body) }),
    getBySlug: (slug) => request(`/businesses/${slug}`),
  },
  services: {
    list:   ()        => request('/services'),
    create: (body)    => request('/services',      { method: 'POST',   body: JSON.stringify(body) }),
    update: (id,body) => request(`/services/${id}`,{ method: 'PUT',    body: JSON.stringify(body) }),
    delete: (id)      => request(`/services/${id}`,{ method: 'DELETE' }),
  },
  bookings: {
    list:           (params={}) => request(`/bookings?${new URLSearchParams(params)}`),
    create:         (body)      => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus:   (id,status) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    availableSlots: (params)    => request(`/bookings/available-slots?${new URLSearchParams(params)}`),
    stats:          ()          => request('/bookings/stats'),
  },
};

export function formatUZS(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

export function formatPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('998')) {
    return `+${d.slice(0,3)} ${d.slice(3,5)} ${d.slice(5,8)}-${d.slice(8,10)}-${d.slice(10)}`;
  }
  return raw;
}
