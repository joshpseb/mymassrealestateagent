import { AgentProfile, Article, Inquiry, InquiryPayload, Property } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// --- AUTHENTICATION ---
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
};

export const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }
  return `${API_ORIGIN}/${url}`;
};

export const loginAdmin = async (credentials: any) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Failed to login');
  return res.json();
};

export const registerAdmin = async (credentials: any) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Failed to register');
  return res.json();
};

// --- PROPERTIES ---
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify(property)
  });
  if (!response.ok) {
    throw new Error('Failed to update property');
  }
  return response.json();
};

export const deleteProperty = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders() // Content-Type isn't strictly needed for DELETE, but getAuthHeaders includes it which is fine
  });
  if (!response.ok) {
    throw new Error('Failed to delete property');
  }
  return response.json();
};

// --- NEWS ---
export const getNews = async (): Promise<Article[]> => {
  const response = await fetch(`${API_BASE_URL}/news`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};

export const createCuratedNews = async (article: Omit<Article, '_id'>) => {
  const response = await fetch(`${API_BASE_URL}/news/curated`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(article)
  });
  if (!response.ok) {
    throw new Error('Failed to create curated news article');
  }
  return response.json();
};

export const createInquiry = async (payload: InquiryPayload) => {
  const response = await fetch(`${API_BASE_URL}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to submit inquiry');
  }
  return response.json();
};

export const getInquiries = async (): Promise<Inquiry[]> => {
  const response = await fetch(`${API_BASE_URL}/inquiries`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch inquiries');
  }
  return response.json();
};

export const getAgentProfile = async (): Promise<AgentProfile> => {
  const response = await fetch(`${API_BASE_URL}/agent-profile`);
  if (!response.ok) {
    throw new Error('Failed to fetch agent profile');
  }
  return response.json();
};

export const updateAgentProfile = async (payload: AgentProfile) => {
  const response = await fetch(`${API_BASE_URL}/agent-profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to update agent profile');
  }
  return response.json();
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to upload images');
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload images');
  }

  const data = await response.json();
  return data.urls || [];
};