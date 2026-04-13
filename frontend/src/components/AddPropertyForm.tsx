import { useState, ChangeEvent, FormEvent } from 'react';
import { Property } from '../types';
import { ImageUploader } from './ImageUploader';

interface AddPropertyFormProps {
  onAddProperty: (property: Omit<Property, '_id'>) => void;
  onClose: () => void;
  initialValues?: Partial<Property>;
  submitLabel?: string;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';

export const AddPropertyForm = ({
  onAddProperty,
  onClose,
  initialValues,
  submitLabel = 'Add Property'
}: AddPropertyFormProps) => {
  const [formData, setFormData] = useState({
    address: initialValues?.address || '',
    price: initialValues?.price?.toString() || '',
    bedrooms: initialValues?.bedrooms?.toString() || '',
    bathrooms: initialValues?.bathrooms?.toString() || '',
    sqft: initialValues?.sqft?.toString() || '',
    description: initialValues?.description || '',
    imageUrl: initialValues?.imageUrl || '',
    images: initialValues?.images || (initialValues?.imageUrl ? [initialValues.imageUrl] : []),
  });
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const imageList = formData.images.map((url) => url.trim()).filter(Boolean);
    const imageUrl = formData.imageUrl.trim() || imageList[0] || DEFAULT_IMAGE;

    const newProperty: Omit<Property, '_id'> = {
      address: formData.address.trim(),
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      sqft: Number(formData.sqft),
      description: formData.description.trim(),
      imageUrl,
      images: imageList.length > 0 ? imageList : [imageUrl],
    };

    const hasInvalidAddress = newProperty.address.length < 5;
    const hasInvalidNumbers =
      Number.isNaN(newProperty.price) ||
      newProperty.price <= 0 ||
      Number.isNaN(newProperty.bedrooms) ||
      newProperty.bedrooms < 0 ||
      Number.isNaN(newProperty.bathrooms) ||
      newProperty.bathrooms < 0 ||
      Number.isNaN(newProperty.sqft) ||
      newProperty.sqft <= 0;

    if (hasInvalidAddress || hasInvalidNumbers) {
      setError('Please provide a valid address and positive number values.');
      return;
    }

    onAddProperty(newProperty);
  };

  const inputClass = "w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm";
  const labelClass = "text-sm font-semibold text-slate-700 block mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="address" className={labelClass}>Address</label>
        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className={inputClass} />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="price" className={labelClass}>Price (USD)</label>
          <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="flex-1">
          <label htmlFor="sqft" className={labelClass}>Sqft</label>
          <input type="number" id="sqft" name="sqft" value={formData.sqft} onChange={handleChange} required className={inputClass} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="bedrooms" className={labelClass}>Bedrooms</label>
          <input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="flex-1">
          <label htmlFor="bathrooms" className={labelClass}>Bathrooms</label>
          <input type="number" step="0.5" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Upload Property Images</label>
        <ImageUploader
          value={formData.images}
          onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
          multiple
        />
      </div>
      <div>
        <label htmlFor="imageUrl" className={labelClass}>Primary Image URL (optional)</label>
        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass}></textarea>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onClose} className="px-5 py-2 font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">{submitLabel}</button>
      </div>
    </form>
  );
};