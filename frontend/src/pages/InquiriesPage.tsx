import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getInquiries } from '../services/api';

interface InquiriesPageProps {
  isAuthenticated: boolean;
}

export const InquiriesPage = ({ isAuthenticated }: InquiriesPageProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-slate-50 text-slate-600 px-6 py-4 rounded-xl border border-slate-200 font-medium shadow-sm">
          Login required to view inquiries.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-24 rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-medium shadow-sm">
          Failed to fetch inquiries.
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
      className="space-y-4"
    >
      <h1 className="font-display text-3xl font-extrabold text-slate-900">Inquiries</h1>
      {data?.length ? (
        data.map((inquiry) => {
          const isExpanded = expandedId === inquiry._id;
          return (
            <div key={inquiry._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{inquiry.name}</p>
                  <p className="text-sm text-slate-500">{inquiry.email}{inquiry.phone ? ` • ${inquiry.phone}` : ''}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : inquiry._id)}
                  className="text-sm font-semibold text-brand-primary hover:underline cursor-pointer self-start"
                >
                  {isExpanded ? 'Hide Message' : 'View Message'}
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Property: {inquiry.propertyAddress || 'General inquiry'}
              </p>
              {isExpanded && (
                <p className="mt-3 text-slate-700 leading-relaxed">{inquiry.message}</p>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-slate-500">No inquiries yet.</p>
      )}
    </motion.div>
  );
};
