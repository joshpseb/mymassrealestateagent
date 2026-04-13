import { NewsArticle } from '../models/NewsArticle.js';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

interface NewsDataItem {
  title?: string;
  description?: string;
  pubDate?: string;
  image_url?: string;
  link?: string;
  source_name?: string;
}

interface NewsDataResponse {
  status?: string;
  results?: NewsDataItem[];
}

const toDisplayDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const fetchFromNewsData = async () => {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    throw new Error('NEWSDATA_API_KEY is not set');
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    q: 'massachusetts real estate OR housing market',
    language: 'en',
    country: 'us',
    category: 'business',
    size: '8',
  });

  const response = await fetch(`https://newsdata.io/api/1/news?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch external news');
  }

  const payload = (await response.json()) as NewsDataResponse;
  const now = new Date();

  const normalized = (payload.results || [])
    .filter((item): item is Required<Pick<NewsDataItem, 'title' | 'description' | 'pubDate' | 'link' | 'source_name'>> & NewsDataItem =>
      Boolean(item.title && item.description && item.pubDate && item.link && item.source_name)
    )
    .map((item) => ({
      title: item.title!,
      summary: item.description!,
      date: toDisplayDate(item.pubDate!),
      imageUrl: item.image_url || '',
      sourceName: item.source_name!,
      sourceUrl: item.link!,
      publishedAt: new Date(item.pubDate!),
      fetchedAt: now,
      isCurated: false,
    }));

  return normalized;
};

export const getRealEstateNews = async () => {
  const newestFetched = await NewsArticle.findOne({ isCurated: false }).sort({ fetchedAt: -1 });
  const isFresh = newestFetched && Date.now() - newestFetched.fetchedAt.getTime() < SIX_HOURS_MS;

  if (!isFresh) {
    const externalNews = await fetchFromNewsData();
    await NewsArticle.deleteMany({ isCurated: false });
    if (externalNews.length > 0) {
      await NewsArticle.insertMany(externalNews);
    }
  }

  return NewsArticle.find().sort({ publishedAt: -1 }).limit(20);
};
