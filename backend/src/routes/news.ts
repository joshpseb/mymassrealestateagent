import express from 'express';
import { createCuratedNews, getNews } from '../controllers/newsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getNews);
router.post('/curated', verifyToken, createCuratedNews);

export default router;