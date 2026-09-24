import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { updateSlaBreachStatus } from './services/slaService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Edumerge Student Support Ticket System',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.use(express.static(path.join(__dirname, '../public')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Periodic SLA Breach Checker (runs every 60 seconds)
setInterval(() => {
  updateSlaBreachStatus();
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Edumerge Support Server running on port ${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
  // Run initial SLA breach scan on boot
  updateSlaBreachStatus();
});
