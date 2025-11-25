import { Article } from '../types';

interface NewsArticleProps {
  article: Article;
}

export const NewsArticle = ({ article }: NewsArticleProps) => (
  <article className="news-article-card">
    <div className="news-image" style={{ backgroundImage: `url(${article.imageUrl})` }}></div>
    <div className="news-content">
      <h3>{article.title}</h3>
      <p className="news-date">{article.date}</p>
      <p className="news-summary">{article.summary}</p>
    </div>
  </article>
);