import { z } from 'zod';

export const propertySchema = z.object({
  body: z.object({
    address: z.string().min(5, "Address is required and must be at least 5 characters"),
    price: z.number().positive("Price must be a positive number"),
    description: z.string().optional(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().nonnegative(),
    sqft: z.number().positive(),
    imageUrl: z.string().url("Must be a valid URL").optional(),
  })
});
