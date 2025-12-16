// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/email';
import casesRoutes from './routes/cases';
import db from './models/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/cases', casesRoutes);

// Initialize database
console.log('Database initialized');

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/emails - Process an email`);
  console.log(`  GET /api/cases - Get all cases`);
  console.log(`  GET /api/cases/:id - Get case by ID`);
});

