import { motion } from 'framer-motion';
import { Bed, Bath, SquareSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { resolveAssetUrl } from '../services/api';

interface PropertyCardProps {
  property: Property;
  isAuthenticated?: boolean;
  onDelete?: (property: Property) => void;
}

const itemVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';

export const PropertyCard = ({ property, isAuthenticated = false, onDelete }: PropertyCardProps) => (
  <motion.article 
    variants={itemVariant}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow border border-slate-100 flex flex-col group relative"
  >
    {isAuthenticated && onDelete && (
      <button
        type="button"
        onClick={() => onDelete(property)}
        className="absolute top-3 right-3 z-10 bg-red-50 text-red-600 p-2 rounded-full border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
        aria-label="Delete property"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
    <Link to={property._id ? `/property/${property._id}` : '/'} className="block h-full">
      <div 
        className="h-56 bg-cover bg-center relative" 
        style={{ backgroundImage: `url(${resolveAssetUrl(property.images?.[0] || property.imageUrl) || FALLBACK_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute bottom-4 left-4 bg-white/95 text-slate-900 px-3 py-1.5 rounded-lg font-bold text-lg shadow-sm">
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            minimumFractionDigits: 0 
          }).format(property.price)}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex gap-4 items-center mb-3 text-slate-500 text-sm">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-brand-secondary" />
            <span className="font-semibold text-slate-700">{property.bedrooms}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-brand-secondary" />
            <span className="font-semibold text-slate-700">{property.bathrooms}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <SquareSquare className="w-4 h-4 text-brand-secondary" />
            <span className="font-semibold text-slate-700">{property.sqft.toLocaleString()} <span className="text-xs font-normal">sqft</span></span>
          </div>
        </div>

        <p className="font-display font-semibold text-lg text-slate-900 leading-tight mb-2 group-hover:text-brand-primary transition-colors">
          {property.address}
        </p>

        <p className="text-sm text-slate-500 line-clamp-2 flex-grow">
          {property.description || "A beautiful property listed for sale. Contact agent for more details."}
        </p>
      </div>
    </Link>
  </motion.article>
);