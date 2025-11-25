export interface Property {
    _id?: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    description: string;
    imageUrl: string;
  }
  
  export interface Article {
    title: string;
    summary: string;
    date: string;
    imageUrl: string;
  }