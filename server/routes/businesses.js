const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/businesses/me — authenticated business owner's profile
router.get('/me', authMiddleware, (req, res) => {
  const business = db.prepare(`
    SELECT id, name, slug, category, city, address, phone, email, working_hours, created_at
    FROM businesses WHERE id = ?
  `).get(req.businessId);

  if (!business) return res.status(404).json({ error: 'Biznes topilmadi' });

  business.working_hours = JSON.parse(business.working_hours);
  res.json(business);
});

// PUT /api/businesses/me — update profile
router.put('/me', authMiddleware, (req, res) => {
  const { name, category, city, address, phone, working_hours } = req.body;

  db.prepare(`
    UPDATE businesses
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        city = COALESCE(?, city),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        working_hours = COALESCE(?, working_hours)
    WHERE id = ?
  `).run(
    name || null,
    category || null,
    city || null,
    address || null,
    phone || null,
    working_hours ? JSON.stringify(working_hours) : null,
    req.businessId
  );

  const updated = db.prepare(`
    SELECT id, name, slug, category, city, address, phone, email, working_hours
    FROM businesses WHERE id = ?
  `).get(req.businessId);

  updated.working_hours = JSON.parse(updated.working_hours);
  res.json(updated);
});

// GET /api/businesses/:slug — public profile for booking page
router.get('/:slug', (req, res) => {
  const business = db.prepare(`
    SELECT id, name, slug, category, city, address, phone, working_hours
    FROM businesses WHERE slug = ?
  `).get(req.params.slug);

  if (!business) return res.status(404).json({ error: 'Biznes topilmadi' });

  business.working_hours = JSON.parse(business.working_hours);

  // Also return services
  const services = db.prepare('SELECT * FROM services WHERE business_id = ?').all(business.id);
  res.json({ ...business, services });
});

module.exports = router;
