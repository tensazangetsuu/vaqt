const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 50);
}

function uniqueSlug(base) {
  let slug = base, n = 1;
  while (db.prepare('SELECT id FROM businesses WHERE slug = ?').get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, category, city, address, phone } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Ism, email va parol talab qilinadi' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });

  if (db.prepare('SELECT id FROM businesses WHERE email = ?').get(email))
    return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const slug = uniqueSlug(generateSlug(name));

  const defaultHours = {
    mon: { open: true,  start: '09:00', end: '18:00' },
    tue: { open: true,  start: '09:00', end: '18:00' },
    wed: { open: true,  start: '09:00', end: '18:00' },
    thu: { open: true,  start: '09:00', end: '18:00' },
    fri: { open: true,  start: '09:00', end: '18:00' },
    sat: { open: true,  start: '09:00', end: '16:00' },
    sun: { open: false, start: '09:00', end: '16:00' },
  };

  try {
    const result = db.prepare(`
      INSERT INTO businesses (name, slug, category, city, address, phone, email, password_hash, working_hours, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      name, slug, category || 'other', city || 'Toshkent',
      address || '', phone || '', email, passwordHash, JSON.stringify(defaultHours)
    );

    const token = jwt.sign({ businessId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '30d' });
    const business = db.prepare(
      'SELECT id, name, slug, category, city, address, phone, email, status, working_hours FROM businesses WHERE id = ?'
    ).get(result.lastInsertRowid);
    business.working_hours = JSON.parse(business.working_hours);

    res.status(201).json({ token, business });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email va parol talab qilinadi' });

  const business = db.prepare('SELECT * FROM businesses WHERE email = ?').get(email);
  if (!business || !bcrypt.compareSync(password, business.password_hash))
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

  const token = jwt.sign({ businessId: business.id }, JWT_SECRET, { expiresIn: '30d' });
  const { password_hash, ...safe } = business;
  safe.working_hours = JSON.parse(safe.working_hours);

  res.json({ token, business: safe });
});

module.exports = router;
