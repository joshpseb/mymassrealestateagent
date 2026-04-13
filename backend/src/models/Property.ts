import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  sqft: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  imageUrl: {
    type: String,
    required: false,
    default: ''
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create indexes for faster searches
PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });

export const Property = mongoose.model('Property', PropertySchema);