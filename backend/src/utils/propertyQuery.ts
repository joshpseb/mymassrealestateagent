import { DISPLAYABLE_STATUSES } from '../models/Property.js';

export type SortKey = 'newest' | 'oldest' | 'price-asc' | 'price-desc';

const SORTS: Record<SortKey, Record<string, 1 | -1>> = {
  newest: { listDate: -1, createdAt: -1 },
  oldest: { listDate: 1, createdAt: 1 },
  'price-asc': { price: 1, listDate: -1 },
  'price-desc': { price: -1, listDate: -1 }
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toList = (value: unknown): string[] =>
  String(value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const rangeFilter = (min?: number, max?: number) => {
  const range: Record<string, number> = {};
  if (min !== undefined) range.$gte = min;
  if (max !== undefined) range.$lte = max;
  return Object.keys(range).length > 0 ? range : undefined;
};

/**
 * Parses a bounding box in the `west,south,east,north` order used by the map
 * viewport, matching Leaflet's `toBBoxString()` output.
 */
const parseBoundingBox = (value: unknown) => {
  const parts = toList(value).map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return undefined;

  const [west, south, east, north] = parts;
  return {
    $geoWithin: {
      $box: [
        [Math.min(west, east), Math.min(south, north)],
        [Math.max(west, east), Math.max(south, north)]
      ]
    }
  };
};

export const parseSort = (value: unknown): Record<string, 1 | -1> =>
  SORTS[value as SortKey] ?? SORTS.newest;

export const buildPropertyFilter = (query: Record<string, unknown>) => {
  const filter: Record<string, any> = {};

  const statuses = toList(query.status);
  filter.status = { $in: statuses.length > 0 ? statuses : [...DISPLAYABLE_STATUSES] };

  const price = rangeFilter(toNumber(query.minPrice), toNumber(query.maxPrice));
  if (price) filter.price = price;

  const sqft = rangeFilter(toNumber(query.minSqft), toNumber(query.maxSqft));
  if (sqft) filter.sqft = sqft;

  const minBedrooms = toNumber(query.bedrooms);
  if (minBedrooms) filter.bedrooms = { $gte: minBedrooms };

  const minBathrooms = toNumber(query.bathrooms);
  if (minBathrooms) filter.bathrooms = { $gte: minBathrooms };

  const propertyTypes = toList(query.propertyType);
  if (propertyTypes.length > 0) {
    filter.$or = [
      { propertyType: { $in: propertyTypes } },
      { propertySubType: { $in: propertyTypes } }
    ];
  }

  const cities = toList(query.city);
  if (cities.length > 0) {
    filter.city = { $in: cities.map((city) => new RegExp(`^${escapeRegex(city)}$`, 'i')) };
  }

  const boundingBox = parseBoundingBox(query.bbox);
  if (boundingBox) filter.location = boundingBox;

  const search = String(query.query ?? '').trim();
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    const searchClauses = [
      { address: pattern },
      { city: pattern },
      { zipCode: pattern },
      { neighborhood: pattern },
      { mlsNumber: pattern }
    ];
    // `$or` may already be taken by the property-type clause, so combine with `$and`
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchClauses }];
      delete filter.$or;
    } else {
      filter.$or = searchClauses;
    }
  }

  return filter;
};

export const parsePagination = (query: Record<string, unknown>, defaults = { limit: 24, maxLimit: 100 }) => {
  const page = Math.max(1, Math.trunc(toNumber(query.page) ?? 1));
  const requestedLimit = Math.trunc(toNumber(query.limit) ?? defaults.limit);
  const limit = Math.min(Math.max(1, requestedLimit), defaults.maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};
