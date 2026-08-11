import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export interface PropertyFilterState {
  query: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  sortBy: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  propertyType: string;
  status: string;
  minSqft: string;
}

export const INITIAL_FILTERS: PropertyFilterState = {
  query: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '0',
  bathrooms: '0',
  sortBy: 'newest',
  propertyType: '',
  status: '',
  minSqft: '',
};

// RESO PropertySubType values used by MLS PIN for residential listings
const PROPERTY_TYPES = [
  'Single Family Residence',
  'Condominium',
  'Townhouse',
  'Multi Family',
  'Land',
];

const STATUSES = ['Active', 'Coming Soon', 'Active Under Contract', 'Pending'];

interface PropertyFiltersProps {
  filters: PropertyFilterState;
  onChange: (filters: PropertyFilterState) => void;
  resultCount?: number;
  isFetching?: boolean;
}

export const PropertyFilters = ({ filters, onChange, resultCount, isFetching }: PropertyFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputClass =
    'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all';

  const handleFieldChange = (field: keyof PropertyFilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={`${inputClass} pl-9`}
            type="text"
            placeholder="City, ZIP, address or MLS #"
            value={filters.query}
            onChange={(e) => handleFieldChange('query', e.target.value)}
          />
        </div>

        <input
          className={inputClass}
          type="number"
          min="0"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => handleFieldChange('minPrice', e.target.value)}
        />

        <input
          className={inputClass}
          type="number"
          min="0"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => handleFieldChange('maxPrice', e.target.value)}
        />

        <select
          className={inputClass}
          value={filters.bedrooms}
          onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
        >
          <option value="0">Any beds</option>
          <option value="1">1+ beds</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
          <option value="4">4+ beds</option>
        </select>

        <select
          className={inputClass}
          value={filters.bathrooms}
          onChange={(e) => handleFieldChange('bathrooms', e.target.value)}
        >
          <option value="0">Any baths</option>
          <option value="1">1+ baths</option>
          <option value="2">2+ baths</option>
          <option value="3">3+ baths</option>
        </select>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <select
            className={inputClass}
            value={filters.propertyType}
            onChange={(e) => handleFieldChange('propertyType', e.target.value)}
          >
            <option value="">Any home type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className={inputClass}
            value={filters.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
          >
            <option value="">Any listing status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            className={inputClass}
            type="number"
            min="0"
            step="100"
            placeholder="Min square feet"
            value={filters.minSqft}
            onChange={(e) => handleFieldChange('minSqft', e.target.value)}
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            className={`${inputClass} max-w-xs`}
            value={filters.sortBy}
            onChange={(e) => handleFieldChange('sortBy', e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showAdvanced ? 'Fewer filters' : 'More filters'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          {resultCount !== undefined && (
            <span className="text-sm text-slate-500">
              {isFetching ? 'Updating…' : `${resultCount.toLocaleString()} homes`}
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange({ ...INITIAL_FILTERS })}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
};
