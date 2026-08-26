require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const productRoutes = require('./routes/products');
const calculateRoutes = require('./routes/calculate');
const adminRoutes = require('./routes/admin');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '100kb' }));

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim());
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins
  })
);

// --- Serve the frontend (single-service deployment) ---
app.use(express.static(path.join(__dirname, '../frontend')));

// --- API routes ---
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/products', productRoutes);
app.use('/api', calculateRoutes);
app.use('/api/admin', adminRoutes);

// Fallback to index.html for any non-API route (simple SPA-style serving)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Paras Pavers server running on port ${PORT}`);
});
