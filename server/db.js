const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'vaqt.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS businesses (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    slug           TEXT    NOT NULL UNIQUE,
    category       TEXT    NOT NULL,
    city           TEXT    NOT NULL DEFAULT 'Toshkent',
    address        TEXT,
    phone          TEXT,
    email          TEXT    NOT NULL UNIQUE,
    password_hash  TEXT    NOT NULL,
    working_hours  TEXT    NOT NULL DEFAULT '{}',
    status         TEXT    NOT NULL DEFAULT 'active',
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id      INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name             TEXT    NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price_uzs        INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id     INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id      INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    customer_name   TEXT    NOT NULL,
    customer_phone  TEXT    NOT NULL,
    booking_date    TEXT    NOT NULL,
    booking_time    TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'pending',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const seedBusiness = db.prepare('SELECT id FROM businesses WHERE slug = ?').get('shakhzod-sartaroshxona');

if (!seedBusiness) {
  const passwordHash = bcrypt.hashSync('demo123', 10);

  const workingHours = {
    mon: { open: true,  start: '09:00', end: '19:00' },
    tue: { open: true,  start: '09:00', end: '19:00' },
    wed: { open: true,  start: '09:00', end: '19:00' },
    thu: { open: true,  start: '09:00', end: '19:00' },
    fri: { open: true,  start: '09:00', end: '19:00' },
    sat: { open: true,  start: '09:00', end: '17:00' },
    sun: { open: false, start: '09:00', end: '17:00' },
  };

  const bizResult = db.prepare(`
    INSERT INTO businesses (name, slug, category, city, address, phone, email, password_hash, working_hours, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(
    'Shakhzod Sartaroshxona', 'shakhzod-sartaroshxona', 'barbershop',
    'Toshkent', 'Chilonzor tumani, 7-kvartal, 15-uy', '+998901234567',
    'shakhzod@demo.com', passwordHash, JSON.stringify(workingHours)
  );

  const bizId = bizResult.lastInsertRowid;

  const svc1 = db.prepare(`INSERT INTO services (business_id, name, duration_minutes, price_uzs) VALUES (?, ?, ?, ?)`).run(bizId, 'Soch olish (erkaklar)', 30, 50000);
  const svc2 = db.prepare(`INSERT INTO services (business_id, name, duration_minutes, price_uzs) VALUES (?, ?, ?, ?)`).run(bizId, 'Soqol olish', 20, 35000);
  const svc3 = db.prepare(`INSERT INTO services (business_id, name, duration_minutes, price_uzs) VALUES (?, ?, ?, ?)`).run(bizId, 'Soch + Soqol kompleks', 50, 75000);

  const today     = new Date().toISOString().split('T')[0];
  const tomorrow  = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const ins = db.prepare(`
    INSERT INTO bookings (business_id, service_id, customer_name, customer_phone, booking_date, booking_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  ins.run(bizId, svc1.lastInsertRowid, 'Azizbek Rahimov',  '+998901112233', today,     '10:00', 'confirmed');
  ins.run(bizId, svc2.lastInsertRowid, 'Bobur Karimov',    '+998902223344', today,     '11:00', 'pending');
  ins.run(bizId, svc3.lastInsertRowid, 'Jasur Toshmatov',  '+998903334455', today,     '14:00', 'confirmed');
  ins.run(bizId, svc1.lastInsertRowid, 'Sherzod Yusupov',  '+998904445566', tomorrow,  '10:30', 'pending');
  ins.run(bizId, svc2.lastInsertRowid, 'Nodir Abdullayev', '+998905556677', yesterday, '09:00', 'completed');

  console.log('Seed: Shakhzod Sartaroshxona — shakhzod@demo.com / demo123');
}

module.exports = db;
