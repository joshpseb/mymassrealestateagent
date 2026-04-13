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