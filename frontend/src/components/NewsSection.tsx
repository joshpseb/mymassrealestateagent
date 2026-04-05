import { motion } from 'framer-motion';
import { Article } from '../types';
import { NewsArticle } from './NewsArticle';

interface NewsSectionProps {
  articles: Article[];
  isLoading: boolean;
}

const listVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const NewsSection = ({ articles, isLoading }: NewsSectionProps) => (
  <section className="mb-12">
    <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-8 text-center flex flex-col items-center gap-2">
      Market Insights
      <div className="h-1 w-12 bg-brand-accent rounded-full" />
    </h2>
    
    {isLoading ? (
      <div className="flex justify-center my-12">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    ) : (
      <motion.div 
        variants={listVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {articles.map((article, index) => (
          <NewsArticle key={index} article={article} />
        ))}
      </motion.div>
    )}
  </section>
);