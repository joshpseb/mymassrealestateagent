import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { connectDatabase } from './config/database.js';
import { getJwtSecret } from './config/env.js';
import propertyRoutes from './routes/properties.js';
import newsRoutes from './routes/news.js';
import authRoutes from './routes/auth.js';
import inquiryRoutes from './routes/inquiries.js';
import agentProfileRoutes from './routes/agentProfile.js';
import uploadRoutes from './routes/uploads.js';

// Load environment variables
dotenv.config();
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 3001;
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
const inquiryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());  // Allow frontend to call this API
app.use(express.json());  // Parse JSON request bodies

// Routes
app.use('/api/auth', authLimiter);
app.use('/api/inquiries', inquiryLimiter);
app.use('/api/properties', propertyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/agent-profile', agentProfileRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to database and start server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});