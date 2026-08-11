import { DISPLAYABLE_STATUSES, LISTING_STATUSES } from '../../models/Property.js';
import { ResoMedia, ResoProperty } from './client.js';

const SQFT_PER_ACRE = 43560;

const STATUS_ALIASES: Record<string, string> = {
  active: 'Active',
  'coming soon': 'Coming Soon',
  'active under contract': 'Active Under Contract',
  contingent: 'Active Under Contract',
  'under agreement': 'Pending',
  pending: 'Pending',
  closed: 'Closed',
  sold: 'Closed',
  expired: 'Expired',
  canceled: 'Canceled',
  cancelled: 'Canceled',
  withdrawn: 'Withdrawn',
  'temporarily withdrawn': 'Withdrawn',
  hold: 'Hold',
  'hold for showings': 'Hold'
};

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const toNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
};

const toDate = (value: unknown): Date | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const normalizeStatus = (record: ResoProperty): string => {
  const raw = clean(record.StandardStatus) || clean(record.MlsStatus);
  const mapped = STATUS_ALIASES[raw.toLowerCase()];
  if (mapped) return mapped;
  return (LISTING_STATUSES as readonly string[]).includes(raw) ? raw : 'Active';
};

export const isDisplayableStatus = (status: string) =>
  (DISPLAYABLE_STATUSES as readonly string[]).includes(status);

export const buildAddress = (record: ResoProperty): string => {
  const unparsed = clean(record.UnparsedAddress);
  if (unparsed) return unparsed;

  const streetNumber = clean(record.StreetNumber) || (record.StreetNumberNumeric ?? '').toString();
  const street = [
    streetNumber,
    clean(record.StreetDirPrefix),
    clean(record.StreetName),
    clean(record.StreetSuffix),
    clean(record.StreetDirSuffix)
  ]
    .filter(Boolean)
    .join(' ');

  const unit = clean(record.UnitNumber);
  const line1 = unit ? `${street} #${unit}` : street;
  const cityState = [clean(record.City), clean(record.StateOrProvince)].filter(Boolean).join(', ');

  return [line1, cityState, clean(record.PostalCode)].filter(Boolean).join(' ').trim();
};

export const extractImages = (record: ResoProperty): string[] => {
  const media = record.Media;
  if (!Array.isArray(media)) return [];

  if (media.every((entry): entry is string => typeof entry === 'string')) {
    return media.filter(Boolean);
  }

  return (media as ResoMedia[])
    .filter((entry) => entry && typeof entry.MediaURL === 'string' && entry.MediaURL !== '')
    .filter((entry) => !entry.MediaCategory || /photo|image/i.test(entry.MediaCategory))
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .map((entry) => entry.MediaURL as string);
};

const extractBathrooms = (record: ResoProperty): number => {
  const total = toNumber(record.BathroomsTotalInteger);
  if (total !== undefined) return total;

  const full = toNumber(record.BathroomsFull) ?? 0;
  const half = toNumber(record.BathroomsHalf) ?? 0;
  return full + half * 0.5;
};

const extractLotSizeAcres = (record: ResoProperty): number | undefined => {
  const acres = toNumber(record.LotSizeAcres);
  if (acres !== undefined) return acres;

  const squareFeet = toNumber(record.LotSizeSquareFeet);
  return squareFeet === undefined ? undefined : Number((squareFeet / SQFT_PER_ACRE).toFixed(3));
};

const extractDaysOnMarket = (record: ResoProperty, listDate?: Date): number | undefined => {
  const reported = toNumber(record.DaysOnMarket);
  if (reported !== undefined) return reported;
  if (!listDate) return undefined;
  return Math.max(0, Math.floor((Date.now() - listDate.getTime()) / (24 * 60 * 60 * 1000)));
};

export interface MappedListing {
  source: 'mlspin';
  listingKey: string;
  mlsNumber: string;
  modificationTimestamp?: Date;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  imageUrl: string;
  images: string[];
  streetAddress: string;
  unitNumber: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
  location?: { type: 'Point'; coordinates: [number, number] };
  status: string;
  propertyType: string;
  propertySubType: string;
  yearBuilt?: number;
  lotSizeAcres?: number;
  garageSpaces?: number;
  taxAnnualAmount?: number;
  hoaFee?: number;
  listDate?: Date;
  daysOnMarket?: number;
  listAgentName: string;
  listOfficeName: string;
}

/**
 * Converts one RESO Property record into the shape stored in MongoDB.
 * Returns null when the record is missing the fields the listing UI requires.
 */
export const mapResoProperty = (record: ResoProperty): MappedListing | null => {
  const listingKey = clean(record.ListingKey) || clean(record.ListingId);
  const address = buildAddress(record);
  const price = toNumber(record.ListPrice) ?? toNumber(record.ClosePrice);

  if (!listingKey || !address || price === undefined) {
    return null;
  }

  const images = extractImages(record);
  const latitude = toNumber(record.Latitude);
  const longitude = toNumber(record.Longitude);
  const listDate = toDate(record.OnMarketDate) ?? toDate(record.ListingContractDate);
  const hasCoordinates = latitude !== undefined && longitude !== undefined;

  return {
    source: 'mlspin',
    listingKey,
    mlsNumber: clean(record.ListingId) || listingKey,
    modificationTimestamp: toDate(record.ModificationTimestamp),
    address,
    price,
    bedrooms: toNumber(record.BedroomsTotal) ?? 0,
    bathrooms: extractBathrooms(record),
    sqft:
      toNumber(record.LivingArea) ??
      toNumber(record.AboveGradeFinishedArea) ??
      toNumber(record.BuildingAreaTotal) ??
      0,
    description: clean(record.PublicRemarks),
    imageUrl: images[0] || '',
    images,
    streetAddress: [clean(record.StreetNumber) || (record.StreetNumberNumeric ?? '').toString(), clean(record.StreetDirPrefix), clean(record.StreetName), clean(record.StreetSuffix)]
      .filter(Boolean)
      .join(' '),
    unitNumber: clean(record.UnitNumber),
    city: clean(record.City),
    state: clean(record.StateOrProvince) || 'MA',
    zipCode: clean(record.PostalCode),
    county: clean(record.CountyOrParish),
    neighborhood: clean(record.SubdivisionName) || clean(record.MLSAreaMinor) || clean(record.MLSAreaMajor),
    latitude,
    longitude,
    location: hasCoordinates ? { type: 'Point', coordinates: [longitude, latitude] } : undefined,
    status: normalizeStatus(record),
    propertyType: clean(record.PropertyType),
    propertySubType: clean(record.PropertySubType),
    yearBuilt: toNumber(record.YearBuilt),
    lotSizeAcres: extractLotSizeAcres(record),
    garageSpaces: toNumber(record.GarageSpaces),
    taxAnnualAmount: toNumber(record.TaxAnnualAmount),
    hoaFee: toNumber(record.AssociationFee),
    listDate,
    daysOnMarket: extractDaysOnMarket(record, listDate),
    listAgentName: clean(record.ListAgentFullName),
    listOfficeName: clean(record.ListOfficeName)
  };
};
