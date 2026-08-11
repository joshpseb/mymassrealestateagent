import { motion } from 'framer-motion';
import { Bed, Bath, SquareSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListingStatus, Property } from '../types';
import { resolveAssetUrl } from '../services/api';

interface PropertyCardProps {
  property: Property;
  isAuthenticated?: boolean;
  onDelete?: (property: Property) => void;
  isActive?: boolean;
  onHover?: (id: string | null) => void;
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

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Coming Soon': 'bg-amber-50 text-amber-700 border-amber-200',
  'Active Under Contract': 'bg-sky-50 text-sky-700 border-sky-200',
  Pending: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusLabel = (status?: ListingStatus) => {
  if (!status) return null;
  if (status === 'Active Under Contract') return 'Under contract';
  if (status === 'Coming Soon') return 'Coming soon';
  return status;
};

const locationLine = (property: Property) =>
  [property.city, property.state, property.zipCode].filter(Boolean).join(', ').replace(', MA,', ', MA');

export const PropertyCard = ({
  property,
  isAuthenticated = false,
  onDelete,
  isActive = false,
  onHover,
}: PropertyCardProps) => (
  <motion.article
    variants={itemVariant}
    whileHover={{ y: -5 }}
    onMouseEnter={() => onHover?.(property._id ?? null)}
    onMouseLeave={() => onHover?.(null)}
    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow border flex flex-col group relative ${
      isActive ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-100'
    }`}
  >
    {isAuthenticated && onDelete && property.source !== 'mlspin' && (
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
        {statusLabel(property.status) && (
          <span
            className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border ${
              STATUS_STYLES[property.status as string] || 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {statusLabel(property.status)}
          </span>
        )}
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

        <p className="font-display font-semibold text-lg text-slate-900 leading-tight group-hover:text-brand-primary transition-colors">
          {property.streetAddress || property.address}
        </p>
        {locationLine(property) && (
          <p className="text-sm text-slate-500 mb-2">{locationLine(property)}</p>
        )}

        <p className="text-sm text-slate-500 line-clamp-2 flex-grow">
          {property.description || "A beautiful property listed for sale. Contact agent for more details."}
        </p>

        {(property.mlsNumber || property.listOfficeName) && (
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 truncate">
            {property.mlsNumber ? `MLS# ${property.mlsNumber}` : ''}
            {property.mlsNumber && property.listOfficeName ? ' · ' : ''}
            {property.listOfficeName}
          </p>
        )}
      </div>
    </Link>
  </motion.article>
);
