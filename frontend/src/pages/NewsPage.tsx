import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getNews } from '../services/api';
import { NewsSection } from '../components/NewsSection';

export const NewsPage = () => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: getNews,
  });

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-medium shadow-sm">
          Failed to fetch news from the API.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <NewsSection articles={news || []} isLoading={isLoading} />
    </motion.div>
  );
};
