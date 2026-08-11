import { MlspinConfig } from '../../config/mlspin.js';

export interface ResoMedia {
  MediaURL?: string;
  MediaCategory?: string;
  Order?: number;
  MediaKey?: string;
  ImageSizeDescription?: string;
}

// Only the fields the mapper reads are typed; RESO records carry many more.
export interface ResoProperty {
  ListingKey?: string;
  ListingId?: string;
  ModificationTimestamp?: string;
  StandardStatus?: string;
  MlsStatus?: string;
  PropertyType?: string;
  PropertySubType?: string;
  ListPrice?: number;
  ClosePrice?: number;
  UnparsedAddress?: string;
  StreetNumber?: string | number;
  StreetNumberNumeric?: number;
  StreetDirPrefix?: string;
  StreetName?: string;
  StreetSuffix?: string;
  StreetDirSuffix?: string;
  UnitNumber?: string;
  City?: string;
  StateOrProvince?: string;
  PostalCode?: string;
  CountyOrParish?: string;
  MLSAreaMajor?: string;
  MLSAreaMinor?: string;
  SubdivisionName?: string;
  Latitude?: number;
  Longitude?: number;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  BathroomsFull?: number;
  BathroomsHalf?: number;
  LivingArea?: number;
  AboveGradeFinishedArea?: number;
  BuildingAreaTotal?: number;
  LotSizeAcres?: number;
  LotSizeSquareFeet?: number;
  YearBuilt?: number;
  GarageSpaces?: number;
  TaxAnnualAmount?: number;
  AssociationFee?: number;
  AssociationFeeFrequency?: string;
  PublicRemarks?: string;
  OnMarketDate?: string;
  ListingContractDate?: string;
  DaysOnMarket?: number;
  ListAgentFullName?: string;
  ListOfficeName?: string;
  Media?: ResoMedia[] | string[];
  PhotosCount?: number;
}

interface ODataPage<T> {
  value?: T[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}

const RETRYABLE_STATUSES = [408, 425, 429, 500, 502, 503, 504];
const MAX_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeODataString = (value: string) => value.replace(/'/g, "''");

export const buildPropertyFilter = (
  config: MlspinConfig,
  options: { modifiedSince?: Date | null; restrictToDisplayableStatuses?: boolean } = {}
) => {
  const clauses = [`StateOrProvince eq '${escapeODataString(config.state)}'`];

  if (options.modifiedSince) {
    clauses.push(`ModificationTimestamp gt ${options.modifiedSince.toISOString()}`);
  }

  if (options.restrictToDisplayableStatuses && config.statuses.length > 0) {
    const statusClause = config.statuses
      .map((status) => `StandardStatus eq '${escapeODataString(status)}'`)
      .join(' or ');
    clauses.push(`(${statusClause})`);
  }

  return clauses.join(' and ');
};

const requestJson = async (url: string, accessToken: string): Promise<ODataPage<ResoProperty>> => {
  let lastError: Error = new Error('MLS PIN request failed');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await sleep(1000 * 2 ** (attempt - 1));
      continue;
    }

    if (response.ok) {
      return (await response.json()) as ODataPage<ResoProperty>;
    }

    const body = await response.text().catch(() => '');
    lastError = new Error(`MLS PIN responded ${response.status}: ${body.slice(0, 300)}`);

    if (!RETRYABLE_STATUSES.includes(response.status)) {
      throw lastError;
    }

    await sleep(1000 * 2 ** (attempt - 1));
  }

  throw lastError;
};

/**
 * Walks the MLS PIN Property feed page by page, following OData `@odata.nextLink`
 * so replication stays stable while records are being modified underneath us.
 */
export async function* fetchProperties(
  config: MlspinConfig,
  options: { modifiedSince?: Date | null; restrictToDisplayableStatuses?: boolean } = {}
): AsyncGenerator<ResoProperty[]> {
  if (!config.accessToken) {
    throw new Error('MLSPIN_ACCESS_TOKEN is not set');
  }

  const params = new URLSearchParams({
    $filter: buildPropertyFilter(config, options),
    $orderby: 'ModificationTimestamp asc,ListingKey asc',
    $top: String(config.pageSize)
  });

  let expandMedia = config.expandMedia;
  if (expandMedia) {
    params.set('$expand', 'Media');
  }

  let nextUrl: string | undefined = `${config.apiUrl}/${config.resource}?${params.toString()}`;
  let pages = 0;

  while (nextUrl && pages < config.maxPagesPerRun) {
    let page: ODataPage<ResoProperty>;
    try {
      page = await requestJson(nextUrl, config.accessToken);
    } catch (error) {
      // Not every MLS PIN feed exposes Media as an expandable navigation
      // property; fall back to the plain record shape before giving up.
      if (expandMedia && /400|expand/i.test(String(error))) {
        expandMedia = false;
        params.delete('$expand');
        nextUrl = `${config.apiUrl}/${config.resource}?${params.toString()}`;
        continue;
      }
      throw error;
    }

    const records = page.value ?? [];
    pages += 1;

    if (records.length > 0) {
      yield records;
    }

    nextUrl = page['@odata.nextLink'];
    if (records.length === 0) {
      break;
    }
  }
}
