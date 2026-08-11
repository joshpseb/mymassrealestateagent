import { DISPLAYABLE_STATUSES } from '../models/Property.js';

// MLS PIN publishes its RESO Web API feed through Bridge Data Output. The
// access token is issued by MLS PIN once a data licence is in place.
const DEFAULT_API_URL = 'https://api.bridgedataoutput.com/api/v2/OData/mlspin';

export interface MlspinConfig {
  apiUrl: string;
  accessToken: string;
  resource: string;
  state: string;
  statuses: string[];
  pageSize: number;
  maxPagesPerRun: number;
  expandMedia: boolean;
  syncEnabled: boolean;
  syncIntervalMinutes: number;
}

const toInt = (value: string | undefined, fallback: number) => {
  const parsed = parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toBool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const toList = (value: string | undefined, fallback: readonly string[]) => {
  const parsed = (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...fallback];
};

export const getMlspinConfig = (): MlspinConfig => ({
  apiUrl: (process.env.MLSPIN_API_URL || DEFAULT_API_URL).replace(/\/+$/, ''),
  accessToken: process.env.MLSPIN_ACCESS_TOKEN || '',
  resource: process.env.MLSPIN_PROPERTY_RESOURCE || 'Property',
  state: process.env.MLSPIN_STATE || 'MA',
  statuses: toList(process.env.MLSPIN_STATUSES, DISPLAYABLE_STATUSES),
  // Bridge caps OData page size at 200 records
  pageSize: Math.min(toInt(process.env.MLSPIN_PAGE_SIZE, 200), 200),
  maxPagesPerRun: toInt(process.env.MLSPIN_MAX_PAGES_PER_RUN, 1000),
  expandMedia: toBool(process.env.MLSPIN_EXPAND_MEDIA, true),
  syncEnabled: toBool(process.env.MLSPIN_SYNC_ENABLED, true),
  syncIntervalMinutes: toInt(process.env.MLSPIN_SYNC_INTERVAL_MINUTES, 15)
});

export const isMlspinConfigured = () => Boolean(getMlspinConfig().accessToken);
