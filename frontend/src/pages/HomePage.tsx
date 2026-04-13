import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { deleteProperty, getProperties } from '../services/api';
import { PropertyListings } from '../components/PropertyListings';
import { PropertyFilters, PropertyFilterState } from '../components/PropertyFilters';
import { ContactForm } from '../components/ContactForm';
import { Property } from '../types';

interface HomePageProps {
  isAuthenticated: boolean;
}

const INITIAL_FILTERS: PropertyFilterState = {
  query: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '0',
  bathrooms: '0',
  sortBy: 'newest',
};

export const HomePage = ({ isAuthenticated }: HomePageProps) => {
  const [filters, setFilters] = useState<PropertyFilterState>(INITIAL_FILTERS);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const filteredProperties: Property[] = useMemo(() => {
    const items = data?.properties || [];
    const minPrice = Number(filters.minPrice || 0);
    const maxPrice = Number(filters.maxPrice || 0);
    const minBeds = Number(filters.bedrooms || 0);
    const minBaths = Number(filters.bathrooms || 0);

    const filtered = items.filter((property: Property) => {
      const matchesQuery = property.address.toLowerCase().includes(filters.query.toLowerCase());
      const matchesMinPrice = !filters.minPrice || property.price >= minPrice;
      const matchesMaxPrice = !filters.maxPrice || property.price <= maxPrice;
      const matchesBeds = property.bedrooms >= minBeds;
      const matchesBaths = property.bathrooms >= minBaths;
      return matchesQuery && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths;
    });

    return filtered.sort((a: Property, b: Property) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [data?.properties, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-80 bg-slate-200 rounded-2xl" />
          ))}
        </div>
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
      className="space-y-8"
    >
      <PropertyFilters filters={filters} onChange={setFilters} />

      <PropertyListings
        properties={filteredProperties}
        isAuthenticated={isAuthenticated}
        onDeleteProperty={(property) => {
          if (!property._id) return;
          deleteMutation.mutate(property._id);
        }}
      />

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
