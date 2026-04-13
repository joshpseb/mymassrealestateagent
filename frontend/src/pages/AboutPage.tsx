import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AgentProfile } from '../types';
import { getAgentProfile, resolveAssetUrl, updateAgentProfile } from '../services/api';
import { Modal } from '../components/Modal';
import { ImageUploader } from '../components/ImageUploader';

interface AboutPageProps {
  isAuthenticated: boolean;
}

const DEFAULT_PROFILE: AgentProfile = {
  name: 'MyMass Real Estate Agent',
  bio: '',
  phone: '',
  email: '',
  licenseNumber: '',
  areasServed: [],
  experience: '',
  profileImageUrl: '',
};

export const AboutPage = ({ isAuthenticated }: AboutPageProps) => {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formState, setFormState] = useState<AgentProfile>(DEFAULT_PROFILE);

  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-profile'],
    queryFn: getAgentProfile,
  });

  useEffect(() => {
    if (data) {
      setFormState({
        ...DEFAULT_PROFILE,
        ...data,
        areasServed: data.areasServed || [],
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: updateAgentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-profile'] });
      setShowEditModal(false);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formState,
      areasServed: formState.areasServed.filter(Boolean),
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-medium shadow-sm">
          Failed to load profile.
        </div>
      </div>
    );
  }

  const profile = data || DEFAULT_PROFILE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <img
              src={
                resolveAssetUrl(profile.profileImageUrl) ||
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600'
              }
              alt={profile.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-100"
            />
            <div>
              <h1 className="font-display text-3xl font-extrabold text-slate-900">{profile.name}</h1>
              <p className="text-slate-500 mt-1">{profile.experience || 'Local Massachusetts real estate specialist'}</p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">About</h2>
        <p className="text-slate-600 leading-relaxed">
          {profile.bio || 'Add your professional bio to help clients understand your style and specialties.'}
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="font-semibold text-slate-800">Phone</p>
            <p className="text-slate-500 mt-1">{profile.phone || 'Not provided'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="font-semibold text-slate-800">Email</p>
            <p className="text-slate-500 mt-1">{profile.email || 'Not provided'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="font-semibold text-slate-800">License</p>
            <p className="text-slate-500 mt-1">{profile.licenseNumber || 'Not provided'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="font-semibold text-slate-800">Areas Served</p>
            <p className="text-slate-500 mt-1">
              {profile.areasServed?.length ? profile.areasServed.join(', ') : 'Not provided'}
            </p>
          </div>
        </div>
      </section>

      {showEditModal && (
        <Modal title="Edit Agent Profile" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              required
            />
            <input
              value={formState.experience}
              onChange={(e) => setFormState((prev) => ({ ...prev, experience: e.target.value }))}
              placeholder="Experience (e.g. 10+ years)"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              value={formState.bio}
              onChange={(e) => setFormState((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Bio"
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <input
              value={formState.phone}
              onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <input
              value={formState.email}
              onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <input
              value={formState.licenseNumber}
              onChange={(e) => setFormState((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              placeholder="License Number"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <input
              value={formState.profileImageUrl}
              onChange={(e) => setFormState((prev) => ({ ...prev, profileImageUrl: e.target.value }))}
              placeholder="Profile image URL"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1.5">Or upload profile photo</p>
              <ImageUploader
                value={formState.profileImageUrl ? [formState.profileImageUrl] : []}
                onChange={(urls) =>
                  setFormState((prev) => ({
                    ...prev,
                    profileImageUrl: urls[0] || '',
                  }))
                }
                multiple={false}
              />
            </div>
            <textarea
              value={formState.areasServed.join(', ')}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  areasServed: e.target.value.split(',').map((item) => item.trim()),
                }))
              }
              placeholder="Areas served (comma separated)"
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-5 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </Modal>
      )}
    </motion.div>
  );
};
