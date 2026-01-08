const express = require('express');
const cors = require('cors');

require('./db');

const authRoutes     = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const serviceRoutes  = require('./routes/services');
const bookingRoutes  = require('./routes/bookings');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'https://vaqt-seven.vercel.app'], credentials: true }));
app.use(express.json());

app.use('/api/auth',       authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/services',   serviceRoutes);
app.use('/api/bookings',   bookingRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Vaqt API' }));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Vaqt server running on http://localhost:${PORT}`);
  console.log(`Demo login: shakhzod@demo.com / demo123`);
});
