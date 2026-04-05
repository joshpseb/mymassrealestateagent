import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ title, onClose, children }: ModalProps) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" 
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="font-display font-bold text-xl text-slate-900">{title}</h2>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full w-8 h-8 flex flex-col items-center justify-center transition-colors cursor-pointer text-xl pb-1"
        >
          &times;
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  </motion.div>
);