import { Request, Response } from 'express';
import { getRealEstateNews } from '../services/geminiService.js';

export const getNews = async (req: Request, res: Response) => {
  try {
    const news = await getRealEstateNews();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};