const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/services — all services for authenticated business
router.get('/', authMiddleware, (req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE business_id = ? ORDER BY id').all(req.businessId);
  res.json(services);
});

// POST /api/services — create service
router.post('/', authMiddleware, (req, res) => {
  const { name, duration_minutes, price_uzs } = req.body;

  if (!name || !duration_minutes) {
    return res.status(400).json({ error: 'Xizmat nomi va davomiyligi talab qilinadi' });
  }

  const result = db.prepare(`
    INSERT INTO services (business_id, name, duration_minutes, price_uzs)
    VALUES (?, ?, ?, ?)
  `).run(req.businessId, name, duration_minutes, price_uzs || 0);

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(service);
});

// PUT /api/services/:id — update service
router.put('/:id', authMiddleware, (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);
  if (!service) return res.status(404).json({ error: 'Xizmat topilmadi' });

  const { name, duration_minutes, price_uzs } = req.body;

  db.prepare(`
    UPDATE services
    SET name = COALESCE(?, name),
        duration_minutes = COALESCE(?, duration_minutes),
        price_uzs = COALESCE(?, price_uzs)
    WHERE id = ? AND business_id = ?
  `).run(name || null, duration_minutes || null, price_uzs !== undefined ? price_uzs : null, req.params.id, req.businessId);

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/services/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);
  if (!service) return res.status(404).json({ error: 'Xizmat topilmadi' });

  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
