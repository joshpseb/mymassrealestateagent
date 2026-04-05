import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginAdmin, setAuthToken } from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (username: string) => void;
}

export const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginAdmin({ username, password });
      setAuthToken(data.token);
      onSuccess(data.username);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-bold text-xl text-slate-900">Admin Login</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full w-8 h-8 flex flex-col items-center justify-center transition-colors pb-1 cursor-pointer text-xl">&times;</button>
        </div>
        
        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium mb-4 shadow-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
              />
            </div>
            
            <div className="mt-2 text-center">
              <button type="submit" className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" disabled={loading}>
                {loading ? 'Processing...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
