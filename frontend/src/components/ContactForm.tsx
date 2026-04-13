import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createInquiry } from '../services/api';

interface ContactFormProps {
  propertyId?: string;
  propertyAddress?: string;
  className?: string;
}

export const ContactForm = ({ propertyId, propertyAddress, className = '' }: ContactFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    propertyAddress ? `Hi, I am interested in ${propertyAddress}. Please contact me.` : ''
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: createInquiry,
    onSuccess: () => {
      setSuccess('Thanks! Your message was sent to the agent.');
      setError('');
      setName('');
      setEmail('');
      setPhone('');
      setMessage(propertyAddress ? `Hi, I am interested in ${propertyAddress}. Please contact me.` : '');
    },
    onError: (err: Error) => {
      setSuccess('');
      setError(err.message || 'Failed to send message.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Name, email, and message are required.');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      propertyId,
      propertyAddress,
    });
  };

  const inputClass =
    'w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm';

  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
      <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Contact the Agent</h3>
      <p className="text-slate-600 text-sm mb-4">
        Ask a question, schedule a showing, or get a custom property recommendation.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-100 text-sm font-medium mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone (optional)</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Message</label>
          <textarea
            rows={4}
            className={inputClass}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-5 py-2.5 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {mutation.isPending ? 'Sending...' : 'Send Inquiry'}
        </button>
      </form>
    </section>
  );
};
