import { Request, Response } from 'express';
import { getRealEstateNews } from '../services/newsService.js';
import { NewsArticle } from '../models/NewsArticle.js';

export const getNews = async (req: Request, res: Response) => {
  try {
    const news = await getRealEstateNews();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const createCuratedNews = async (req: Request, res: Response) => {
  try {
    const { title, summary, date, imageUrl, sourceName, sourceUrl } = req.body;

    if (!title || !summary || !date || !sourceName || !sourceUrl) {
      return res.status(400).json({ error: 'Missing required article fields' });
    }

    const article = await NewsArticle.create({
      title,
      summary,
      date,
      imageUrl: imageUrl || '',
      sourceName,
      sourceUrl,
      publishedAt: new Date(date),
      fetchedAt: new Date(),
      isCurated: true,
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create curated news article' });
  }
};