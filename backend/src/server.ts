import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import propertyRoutes from './routes/properties.js';
import newsRoutes from './routes/news.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());  // Allow frontend to call this API
app.use(express.json());  // Parse JSON request bodies

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/news', newsRoutes);

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