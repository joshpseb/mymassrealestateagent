import { motion } from 'framer-motion';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface PropertyListingsProps {
  properties: Property[];
}

const listVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const PropertyListings = ({ properties }: PropertyListingsProps) => {
  if (properties.length === 0) {
    return <p className="text-center text-slate-500 mt-12 text-lg">No properties available at the moment.</p>;
  }

  return (
    <div className="mb-12">
      <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-8 text-center flex flex-col items-center gap-2">
        Featured Listings
        <div className="h-1 w-12 bg-brand-accent rounded-full" />
      </h2>
      <motion.div 
        variants={listVariant}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {properties.map(property => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </motion.div>
    </div>
  );
};