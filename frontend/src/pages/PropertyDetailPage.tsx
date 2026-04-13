import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bath, Bed, ChevronLeft, ChevronRight, MapPin, SquareSquare, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteProperty, getProperty, resolveAssetUrl, updateProperty } from '../services/api';
import { AddPropertyForm } from '../components/AddPropertyForm';
import { ContactForm } from '../components/ContactForm';
import { Modal } from '../components/Modal';
import { Property } from '../types';

interface PropertyDetailPageProps {
  isAuthenticated: boolean;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200';

export const PropertyDetailPage = ({ isAuthenticated }: PropertyDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id || ''),
    enabled: Boolean(id),
  });

  const images = useMemo(() => {
    const sourceImages: string[] = property?.images?.length
      ? property.images
      : [property?.imageUrl || FALLBACK_IMAGE];
    return sourceImages.map((image) => resolveAssetUrl(image) || FALLBACK_IMAGE);
  }, [property]);

  const updateMutation = useMutation({
    mutationFn: (payload: Omit<Property, '_id'>) => updateProperty(id || '', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      setShowEditModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProperty(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/');
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="h-8 bg-slate-200 rounded w-2/3" />
        <div className="h-24 bg-slate-200 rounded" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-medium shadow-sm">
          Property not found.
        </div>
        <Link to="/" className="text-brand-primary font-semibold hover:underline">
          Return to listings
        </Link>
      </div>
    );
  }

  const currentImage = images[activeImageIndex] || FALLBACK_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        ← Back to listings
      </Link>

      <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <div className="relative h-80 md:h-[28rem] bg-slate-200">
          <img src={currentImage} alt={property.address} className="w-full h-full object-cover" loading="lazy" />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-4 bg-white/95 text-slate-900 px-4 py-2 rounded-lg font-bold text-2xl shadow-sm">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(property.price)}
          </div>
        </div>

        {images.length > 1 && (
          <div className="p-4 flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                className={`h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === activeImageIndex ? 'border-brand-primary' : 'border-transparent'
                }`}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img src={img} alt={`${property.address} ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">{property.address}</h1>
              <div className="mt-3 flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Massachusetts, United States</span>
              </div>
            </div>
            {isAuthenticated && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 text-sm font-semibold bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center text-slate-600">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-brand-secondary" />
              <span className="font-semibold">{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-brand-secondary" />
              <span className="font-semibold">{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center gap-2">
              <SquareSquare className="w-4 h-4 text-brand-secondary" />
              <span className="font-semibold">{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          <p className="mt-6 text-slate-600 leading-relaxed">
            {property.description || 'Reach out to the agent for additional details and showing availability.'}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <iframe
          title="Property map"
          className="w-full h-80 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
        />
      </section>

      <ContactForm propertyId={property._id} propertyAddress={property.address} />

      {showEditModal && (
        <Modal title="Edit Property" onClose={() => setShowEditModal(false)}>
          <AddPropertyForm
            initialValues={property}
            submitLabel={updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            onClose={() => setShowEditModal(false)}
            onAddProperty={(payload) => updateMutation.mutate(payload)}
          />
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Delete Property" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              This action cannot be undone. Are you sure you want to remove this listing?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};
