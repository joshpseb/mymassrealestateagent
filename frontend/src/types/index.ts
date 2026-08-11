export type ListingSource = 'manual' | 'mlspin';

export type ListingStatus =
  | 'Active'
  | 'Coming Soon'
  | 'Active Under Contract'
  | 'Pending'
  | 'Closed'
  | 'Expired'
  | 'Canceled'
  | 'Withdrawn'
  | 'Hold';

export interface Property {
  _id?: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;

  source?: ListingSource;
  mlsNumber?: string;
  streetAddress?: string;
  unitNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  status?: ListingStatus;
  propertyType?: string;
  propertySubType?: string;
  yearBuilt?: number;
  lotSizeAcres?: number;
  garageSpaces?: number;
  taxAnnualAmount?: number;
  hoaFee?: number;
  listDate?: string;
  daysOnMarket?: number;
  listAgentName?: string;
  listOfficeName?: string;
}

export interface PropertyQueryParams {
  query?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  minSqft?: string;
  propertyType?: string;
  status?: string;
  city?: string;
  bbox?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  totalProperties: number;
  limit: number;
}

export interface PropertyMapResponse {
  pins: Property[];
  total: number;
  truncated: boolean;
}

export interface MlsSyncStatus {
  configured: boolean;
  running: boolean;
  enabled: boolean;
  intervalMinutes: number;
  state: string;
  statuses: string[];
  listingCount: number;
  lastRunAt: string | null;
  lastRunStatus: 'success' | 'error' | 'running' | null;
  lastRunError: string;
  lastModificationTimestamp: string | null;
}

export interface Article {
  _id?: string;
  title: string;
  summary: string;
  date: string;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isCurated?: boolean;
}

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  propertyAddress?: string;
}

export interface Inquiry extends InquiryPayload {
  _id: string;
  createdAt: string;
}

export interface AgentProfile {
  _id?: string;
  name: string;
  bio: string;
  phone: string;
  email: string;
  licenseNumber: string;
  areasServed: string[];
  experience: string;
  profileImageUrl: string;
}