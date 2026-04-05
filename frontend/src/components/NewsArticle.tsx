import { motion } from 'framer-motion';
import { Article } from '../types';

interface NewsArticleProps {
  article: Article;
}

const itemVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export const NewsArticle = ({ article }: NewsArticleProps) => (
  <motion.article 
    variants={itemVariant}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col md:flex-row group"
  >
    <div 
      className="md:w-1/3 h-56 md:h-auto bg-cover bg-center" 
      style={{ backgroundImage: `url(${article.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'})` }} 
    />
    <div className="p-6 md:w-2/3 flex flex-col justify-center">
      <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-brand-primary transition-colors mb-2">{article.title}</h3>
      <p className="text-sm font-medium text-slate-400 mb-4">{article.date}</p>
      <p className="text-slate-600 leading-relaxed text-sm">{article.summary}</p>
    </div>
  </motion.article>
);