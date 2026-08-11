import { z } from 'zod';
import { LISTING_STATUSES } from '../models/Property.js';

export const propertySchema = z.object({
  body: z.object({
    address: z.string().min(5, "Address is required and must be at least 5 characters"),
    price: z.number().positive("Price must be a positive number"),
    description: z.string().optional(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().nonnegative(),
    sqft: z.number().positive(),
    imageUrl: z.string().url("Must be a valid URL").optional(),
    images: z.array(z.string().url("Each image must be a valid URL")).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    propertyType: z.string().optional(),
    propertySubType: z.string().optional(),
    status: z.enum(LISTING_STATUSES).optional(),
    yearBuilt: z.number().int().optional(),
    lotSizeAcres: z.number().nonnegative().optional(),
    listOfficeName: z.string().optional(),
    listAgentName: z.string().optional(),
  })
});
