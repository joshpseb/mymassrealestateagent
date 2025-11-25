import { Property, Article } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Property API calls
export const getProperties = async (page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/properties?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  return response.json();
};

export const getProperty = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch property');
  }
  return response.json();
};

export const createProperty = async (property: Omit<Property, '_id'>) => {
  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property)
  });
  if (!response.ok) {
    throw new Error('Failed to create property');
  }
  return response.json();
};

export const updateProperty = async (id: string, property: Partial<Property>) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property)
  });
  if (!response.ok) {
    throw new Error('Failed to update property');
  }
  return response.json();
};

export const deleteProperty = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete property');
  }
  return response.json();
};

// News API call
export const getNews = async (): Promise<Article[]> => {
  const response = await fetch(`${API_BASE_URL}/news`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};