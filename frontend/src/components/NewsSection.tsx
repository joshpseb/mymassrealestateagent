import { Article } from '../types';
import { NewsArticle } from './NewsArticle';
import { LoadingSpinner } from './LoadingSpinner';

interface NewsSectionProps {
  articles: Article[];
  isLoading: boolean;
}

export const NewsSection = ({ articles, isLoading }: NewsSectionProps) => (
  <section className="news-container">
    <h2>Massachusetts Real Estate News</h2>
    {isLoading ? (
      <LoadingSpinner />
    ) : (
      <div className="news-list">
        {articles.map((article, index) => (
          <NewsArticle key={index} article={article} />
        ))}
      </div>
    )}
  </section>
);