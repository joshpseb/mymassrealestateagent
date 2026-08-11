import mongoose from 'mongoose';

export const LISTING_SOURCES = ['manual', 'mlspin'] as const;

export const LISTING_STATUSES = [
  'Active',
  'Coming Soon',
  'Active Under Contract',
  'Pending',
  'Closed',
  'Expired',
  'Canceled',
  'Withdrawn',
  'Hold'
] as const;

// Statuses a consumer-facing search is allowed to display
export const DISPLAYABLE_STATUSES = ['Active', 'Coming Soon', 'Active Under Contract', 'Pending'] as const;

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
  },

  // --- Where the record came from ---
  source: {
    type: String,
    enum: LISTING_SOURCES,
    default: 'manual'
  },
  // MLS PIN listing number shown to consumers (RESO ListingId)
  mlsNumber: { type: String, trim: true },
  // Immutable MLS primary key used for upserts (RESO ListingKey)
  listingKey: { type: String, trim: true },
  modificationTimestamp: { type: Date },

  // --- Structured location ---
  streetAddress: { type: String, trim: true, default: '' },
  unitNumber: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: 'MA' },
  zipCode: { type: String, trim: true, default: '' },
  county: { type: String, trim: true, default: '' },
  neighborhood: { type: String, trim: true, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  // GeoJSON mirror of latitude/longitude so map viewport queries can use a 2dsphere index
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: { type: [Number] }
  },

  // --- Listing facts ---
  status: {
    type: String,
    enum: LISTING_STATUSES,
    default: 'Active'
  },
  propertyType: { type: String, trim: true, default: '' },
  propertySubType: { type: String, trim: true, default: '' },
  yearBuilt: { type: Number },
  lotSizeAcres: { type: Number },
  garageSpaces: { type: Number },
  taxAnnualAmount: { type: Number },
  hoaFee: { type: Number },
  listDate: { type: Date },
  daysOnMarket: { type: Number },

  // --- Attribution (MLS PIN requires the listing office to be displayed) ---
  listAgentName: { type: String, trim: true, default: '' },
  listOfficeName: { type: String, trim: true, default: '' }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create indexes for faster searches
PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });
PropertySchema.index({ bathrooms: 1 });
PropertySchema.index({ sqft: 1 });
PropertySchema.index({ status: 1, listDate: -1 });
PropertySchema.index({ city: 1, price: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ listingKey: 1 }, { unique: true, sparse: true });
PropertySchema.index({ mlsNumber: 1 }, { sparse: true });
PropertySchema.index({ location: '2dsphere' });
PropertySchema.index({ address: 'text', city: 'text', zipCode: 'text', neighborhood: 'text' });

export const Property = mongoose.model('Property', PropertySchema);
