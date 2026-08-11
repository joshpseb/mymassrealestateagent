import { motion } from 'framer-motion';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface PropertyListingsProps {
  properties: Property[];
  isAuthenticated?: boolean;
  onDeleteProperty?: (property: Property) => void;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  columnsClassName?: string;
}

const listVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

export const PropertyListings = ({
  properties,
  isAuthenticated = false,
  onDeleteProperty,
  activeId = null,
  onActiveChange,
  columnsClassName = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}: PropertyListingsProps) => {
  if (properties.length === 0) {
    return (
      <p className="text-center text-slate-500 py-16 text-lg">
        No listings match these filters. Try widening your search area or price range.
      </p>
    );
  }

  return (
    <motion.div
      variants={listVariant}
      initial="hidden"
      animate="visible"
      className={`grid gap-6 ${columnsClassName}`}
    >
      {properties.map(property => (
        <PropertyCard
          key={property._id}
          property={property}
          isAuthenticated={isAuthenticated}
          onDelete={onDeleteProperty}
          isActive={property._id === activeId}
          onHover={onActiveChange}
        />
      ))}
    </motion.div>
  );
};
