import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { List, MapIcon, X } from 'lucide-react';
import { deleteProperty, getProperties, getPropertyMapPins } from '../services/api';
import { PropertyListings } from '../components/PropertyListings';
import { PropertyMap } from '../components/PropertyMap';
import { INITIAL_FILTERS, PropertyFilters, PropertyFilterState } from '../components/PropertyFilters';
import { ContactForm } from '../components/ContactForm';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { PropertyQueryParams } from '../types';

interface HomePageProps {
  isAuthenticated: boolean;
}

const PAGE_SIZE = 24;

export const HomePage = ({ isAuthenticated }: HomePageProps) => {
  const [filters, setFilters] = useState<PropertyFilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [bbox, setBbox] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const queryClient = useQueryClient();

  const debouncedFilters = useDebouncedValue(filters);

  const queryParams: PropertyQueryParams = useMemo(
    () => ({
      query: debouncedFilters.query.trim(),
      minPrice: debouncedFilters.minPrice,
      maxPrice: debouncedFilters.maxPrice,
      bedrooms: debouncedFilters.bedrooms === '0' ? '' : debouncedFilters.bedrooms,
      bathrooms: debouncedFilters.bathrooms === '0' ? '' : debouncedFilters.bathrooms,
      minSqft: debouncedFilters.minSqft,
      propertyType: debouncedFilters.propertyType,
      status: debouncedFilters.status,
      sortBy: debouncedFilters.sortBy,
      bbox: bbox ?? '',
    }),
    [debouncedFilters, bbox]
  );

  useEffect(() => {
    setPage(1);
  }, [queryParams]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['properties', queryParams, page],
    queryFn: () => getProperties({ ...queryParams, page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const { data: mapData } = useQuery({
    queryKey: ['property-map', queryParams],
    queryFn: () => getPropertyMapPins(queryParams),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-map'] });
    },
  });

  const properties = data?.properties ?? [];
  const totalProperties = data?.totalProperties ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pins = mapData?.pins ?? [];

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-medium shadow-sm">
          Failed to load properties
        </div>
      </div>
    );
  }

  const mapPanel = (
    <PropertyMap
      properties={pins}
      activeId={activeId}
      onActiveChange={setActiveId}
      onSearchArea={setBbox}
      className="h-[70vh] lg:h-[calc(100vh-9rem)] w-full"
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <header className="space-y-1">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">
          Homes for sale in Massachusetts
        </h1>
        <p className="text-slate-500">
          Every active listing in the MLS PIN feed, updated throughout the day.
        </p>
      </header>

      <PropertyFilters
        filters={filters}
        onChange={setFilters}
        resultCount={totalProperties}
        isFetching={isFetching}
      />

      {bbox && (
        <div className="flex items-center gap-3 text-sm bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-xl px-4 py-2.5">
          <MapIcon className="w-4 h-4" />
          <span className="font-semibold">Showing homes in the current map area</span>
          <button
            type="button"
            onClick={() => setBbox(null)}
            className="ml-auto inline-flex items-center gap-1 font-semibold hover:underline cursor-pointer"
          >
            <X className="w-4 h-4" />
            Search all of MA
          </button>
        </div>
      )}

      <div className="lg:hidden flex rounded-xl border border-slate-200 bg-white p-1 w-fit">
        {(['list', 'map'] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setMobileView(view)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              mobileView === view ? 'bg-brand-primary text-white' : 'text-slate-600'
            }`}
          >
            {view === 'list' ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
            {view === 'list' ? 'List' : 'Map'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div
          className={`lg:col-span-3 lg:sticky lg:top-6 ${mobileView === 'map' ? 'block' : 'hidden'} lg:block`}
        >
          {mapPanel}
          {mapData?.truncated && (
            <p className="text-xs text-slate-500 mt-2">
              Showing the first {pins.length.toLocaleString()} of {mapData.total.toLocaleString()} matching homes on
              the map. Zoom in or add filters to narrow the results.
            </p>
          )}
        </div>

        <div className={`lg:col-span-2 ${mobileView === 'list' ? 'block' : 'hidden'} lg:block`}>
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-pulse">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-80 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          ) : (
            <PropertyListings
              properties={properties}
              isAuthenticated={isAuthenticated}
              columnsClassName="grid-cols-1 xl:grid-cols-2"
              activeId={activeId}
              onActiveChange={setActiveId}
              onDeleteProperty={(property) => {
                if (!property._id) return;
                deleteMutation.mutate(property._id);
              }}
            />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages.toLocaleString()}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Listing data is provided courtesy of MLS Property Information Network, Inc. (MLS PIN). Information is deemed
        reliable but not guaranteed and is intended for consumers' personal, non-commercial use.
      </p>

      <Link
        to="/about"
        className="block bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow"
      >
        <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-2">Meet Your Agent</h2>
        <p className="text-slate-600 leading-relaxed">
          Learn about the agent, service areas, contact details, and professional background.
        </p>
        <p className="text-brand-primary font-semibold mt-4">View full profile →</p>
      </Link>

      <ContactForm />
    </motion.div>
  );
};
