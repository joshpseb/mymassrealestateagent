import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getProperties } from '../services/api';
import { PropertyListings } from '../components/PropertyListings';

export const HomePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties(1, 50),
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-medium shadow-sm">
          Failed to load properties
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
      <PropertyListings properties={data?.properties || []} />
    </motion.div>
  );
};
