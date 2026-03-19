const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── Timeslot generation helper ────────────────────────────────────────────────

/**
 * Generate all possible start times for a day given:
 * - dayStart / dayEnd: "HH:MM" strings
 * - durationMinutes: service duration
 * Returns array of "HH:MM" strings
 */
function generateSlots(dayStart, dayEnd, durationMinutes) {
  const slots = [];
  const [startH, startM] = dayStart.split(':').map(Number);
  const [endH, endM] = dayEnd.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += 30; // 30-minute grid
  }

  return slots;
}

// Day-of-week keys
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// GET /api/bookings/available-slots?businessId=&serviceId=&date=
router.get('/available-slots', (req, res) => {
  const { businessId, serviceId, date } = req.query;

  if (!businessId || !serviceId || !date) {
    return res.status(400).json({ error: 'businessId, serviceId, date talab qilinadi' });
  }

  const business = db.prepare('SELECT working_hours FROM businesses WHERE id = ?').get(businessId);
  if (!business) return res.status(404).json({ error: 'Biznes topilmadi' });

  const service = db.prepare('SELECT duration_minutes FROM services WHERE id = ? AND business_id = ?').get(serviceId, businessId);
  if (!service) return res.status(404).json({ error: 'Xizmat topilmadi' });

  const workingHours = JSON.parse(business.working_hours);
  const dayKey = DAY_KEYS[new Date(date).getDay()];
  const dayConfig = workingHours[dayKey];

  if (!dayConfig || !dayConfig.open) {
    return res.json({ slots: [], message: 'Bu kun ish kuni emas' });
  }

  const allSlots = generateSlots(dayConfig.start, dayConfig.end, service.duration_minutes);

  // Get already-booked times for this business/date (active bookings only)
  const bookedRows = db.prepare(`
    SELECT b.booking_time, s.duration_minutes
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.business_id = ?
      AND b.booking_date = ?
      AND b.status NOT IN ('cancelled')
  `).all(businessId, date);

  // Build a set of occupied minute ranges
  const occupied = new Set();
  for (const row of bookedRows) {
    const [h, m] = row.booking_time.split(':').map(Number);
    const startMin = h * 60 + m;
    for (let t = startMin; t < startMin + row.duration_minutes; t++) {
      occupied.add(t);
    }
  }

  // Filter: a slot is available if none of its minutes are occupied
  const available = allSlots.filter(slot => {
    const [h, m] = slot.split(':').map(Number);
    const startMin = h * 60 + m;
    for (let t = startMin; t < startMin + service.duration_minutes; t++) {
      if (occupied.has(t)) return false;
    }
    return true;
  });

  res.json({ slots: available });
});

// GET /api/bookings/stats — monthly stats for authenticated business
router.get('/stats', authMiddleware, (req, res) => {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const today = now.toISOString().split('T')[0];

  const totalThisMonth = db.prepare(`
    SELECT COUNT(*) as count FROM bookings
    WHERE business_id = ? AND booking_date >= ? AND status != 'cancelled'
  `).get(req.businessId, monthStart);

  const revenueThisMonth = db.prepare(`
    SELECT COALESCE(SUM(s.price_uzs), 0) as total
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.business_id = ? AND b.booking_date >= ? AND b.status IN ('confirmed', 'completed')
  `).get(req.businessId, monthStart);

  const todayCount = db.prepare(`
    SELECT COUNT(*) as count FROM bookings
    WHERE business_id = ? AND booking_date = ? AND status != 'cancelled'
  `).get(req.businessId, today);

  const pendingCount = db.prepare(`
    SELECT COUNT(*) as count FROM bookings
    WHERE business_id = ? AND status = 'pending'
  `).get(req.businessId);

  res.json({
    totalThisMonth: totalThisMonth.count,
    revenueThisMonth: revenueThisMonth.total,
    todayCount: todayCount.count,
    pendingCount: pendingCount.count,
  });
});

// GET /api/bookings — all bookings for authenticated business
router.get('/', authMiddleware, (req, res) => {
  const { date, status } = req.query;

  let query = `
    SELECT b.*, s.name as service_name, s.duration_minutes, s.price_uzs
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.business_id = ?
  `;
  const params = [req.businessId];

  if (date) { query += ' AND b.booking_date = ?'; params.push(date); }
  if (status) { query += ' AND b.status = ?'; params.push(status); }

  query += ' ORDER BY b.booking_date ASC, b.booking_time ASC';

  const bookings = db.prepare(query).all(...params);
  res.json(bookings);
});

// POST /api/bookings — create booking (public, no auth)
router.post('/', (req, res) => {
  const { business_id, service_id, customer_name, customer_phone, booking_date, booking_time } = req.body;

  if (!business_id || !service_id || !customer_name || !customer_phone || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'Barcha maydonlar to\'ldirilishi shart' });
  }

  // Verify business and service exist
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND business_id = ?').get(service_id, business_id);
  if (!service) return res.status(404).json({ error: 'Xizmat topilmadi' });

  // Check the slot is still available
  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE business_id = ? AND booking_date = ? AND booking_time = ? AND status != 'cancelled'
  `).get(business_id, booking_date, booking_time);

  if (conflict) {
    return res.status(409).json({ error: 'Bu vaqt allaqachon band. Iltimos, boshqa vaqt tanlang.' });
  }

  const result = db.prepare(`
    INSERT INTO bookings (business_id, service_id, customer_name, customer_phone, booking_date, booking_time, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(business_id, service_id, customer_name, customer_phone, booking_date, booking_time);

  const booking = db.prepare(`
    SELECT b.*, s.name as service_name, s.duration_minutes, s.price_uzs,
           bus.name as business_name, bus.address, bus.phone as business_phone
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    JOIN businesses bus ON bus.id = b.business_id
    WHERE b.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(booking);
});

// PUT /api/bookings/:id/status — update status (auth required)
router.put('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Noto\'g\'ri status' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);
  if (!booking) return res.status(404).json({ error: 'Buyurtma topilmadi' });

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);

  const updated = db.prepare(`
    SELECT b.*, s.name as service_name, s.duration_minutes, s.price_uzs
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.id = ?
  `).get(req.params.id);

  res.json(updated);
});

module.exports = router;
