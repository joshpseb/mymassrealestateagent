import { Search } from 'lucide-react';

export interface PropertyFilterState {
  query: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  sortBy: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
}

interface PropertyFiltersProps {
  filters: PropertyFilterState;
  onChange: (filters: PropertyFilterState) => void;
}

export const PropertyFilters = ({ filters, onChange }: PropertyFiltersProps) => {
  const inputClass =
    'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all';

  const handleFieldChange = (field: keyof PropertyFilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={`${inputClass} pl-9`}
            type="text"
            placeholder="Search by address"
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

      <div className="mt-3 flex items-center justify-between gap-3">
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
          onClick={() =>
            onChange({
              query: '',
              minPrice: '',
              maxPrice: '',
              bedrooms: '0',
              bathrooms: '0',
              sortBy: 'newest',
            })
          }
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
};
