import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Property } from '../models/Property.js';
import { buildPropertyFilter, parsePagination, parseSort } from '../utils/propertyQuery.js';

// Map pins are rendered all at once, so cap how many a single viewport returns
const MAP_PIN_LIMIT = 1500;

// Get filtered, sorted and paginated listings (MLS PIN feed + manual listings)
export const getProperties = async (req: Request, res: Response) => {
  try {
    const filter = buildPropertyFilter(req.query as Record<string, unknown>);
    const sort = parseSort(req.query.sortBy);
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter)
    ]);

    res.json({
      properties,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalProperties: total,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// Lightweight geocoded records for the map view
export const getPropertyMapPins = async (req: Request, res: Response) => {
  try {
    const { $and: clauses } = buildPropertyFilter(req.query as Record<string, unknown>);
    const filter = {
      $and: [...clauses, { latitude: { $ne: null } }, { longitude: { $ne: null } }]
    };

    const [pins, total] = await Promise.all([
      Property.find(filter)
        .select('address price bedrooms bathrooms sqft latitude longitude status city imageUrl images')
        .sort(parseSort(req.query.sortBy))
        .limit(MAP_PIN_LIMIT)
        .lean(),
      Property.countDocuments(filter)
    ]);

    res.json({ pins, total, truncated: total > pins.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch map pins' });
  }
};

// Distinct cities with listing counts, used to populate the location filter
export const getPropertyCities = async (_req: Request, res: Response) => {
  try {
    const cities = await Property.aggregate([
      { $match: { city: { $nin: ['', null] } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 400 },
      { $project: { _id: 0, city: '$_id', count: 1 } }
    ]);

    res.json({ cities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

// Get single property by Mongo id or MLS number
export const getProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = mongoose.isValidObjectId(id)
      ? await Property.findById(id)
      : await Property.findOne({ mlsNumber: id });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// Create new property
export const createProperty = async (req: Request, res: Response) => {
  try {
    const property = new Property({ ...req.body, source: 'manual' });
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create property' });
  }
};

// Update property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.source === 'mlspin') {
      return res.status(409).json({ error: 'MLS PIN listings are read-only and managed by the feed' });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update property' });
  }
};

// Delete property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.source === 'mlspin') {
      return res.status(409).json({ error: 'MLS PIN listings are read-only and managed by the feed' });
    }

    await property.deleteOne();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
