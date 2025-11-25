import { useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProperty = {
      ...formData,
      price: parseInt(formData.price, 10),
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseFloat(formData.bathrooms),
      sqft: parseInt(formData.sqft, 10),
    };
    
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

  return (
    <form onSubmit={handleSubmit} className="add-property-form">
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
      </div>
      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="price">Price (USD)</label>
          <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="sqft">Sqft</label>
          <input type="number" id="sqft" name="sqft" value={formData.sqft} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="bedrooms">Bedrooms</label>
          <input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="bathrooms">Bathrooms</label>
          <input type="number" step="0.5" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL</label>
        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required></textarea>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Add Property</button>
      </div>
    </form>
  );
};