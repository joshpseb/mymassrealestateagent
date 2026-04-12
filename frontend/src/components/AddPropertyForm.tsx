import { useState, ChangeEvent, FormEvent } from 'react';
import { Property } from '../types';

interface AddPropertyFormProps {
  onAddProperty: (property: Property) => void;
  onClose: () => void;
}

export const AddPropertyForm = ({ onAddProperty, onClose }: AddPropertyFormProps) => {
  const [formData, setFormData] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    imageUrl: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newProperty = {
      ...formData,
      price: parseInt(formData.price, 10),
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseFloat(formData.bathrooms),
      sqft: parseInt(formData.sqft, 10),
    };
    
    // basic validation
    const stringFields = ['address', 'description', 'imageUrl'];
    const numberFields = ['price', 'bedrooms', 'bathrooms', 'sqft'];
    
    const hasEmptyStrings = stringFields.some(field => !newProperty[field] || newProperty[field] === '');
    const hasInvalidNumbers = numberFields.some(field => 
      newProperty[field] === '' || isNaN(newProperty[field]) || newProperty[field] <= 0
    );
    
    if (hasEmptyStrings || hasInvalidNumbers) {
      alert('Please fill out all fields correctly.');
      return;
    }
    
    onAddProperty(newProperty as Property);
  };

  const inputClass = "w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm";
  const labelClass = "text-sm font-semibold text-slate-700 block mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <label htmlFor="imageUrl" className={labelClass}>Image URL</label>
        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required className={inputClass}></textarea>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onClose} className="px-5 py-2 font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">Add Property</button>
      </div>
    </form>
  );
};