import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { Property } from '../models/Property.js';

dotenv.config();

/**
 * Development-only fixture data. It lets the Massachusetts-wide search UI be
 * exercised before MLS PIN credentials are available; real listings arrive
 * through `npm run sync:mls`.
 */

const CITIES: Array<{ city: string; county: string; zip: string; lat: number; lng: number; base: number }> = [
  { city: 'Boston', county: 'Suffolk', zip: '02116', lat: 42.3505, lng: -71.0757, base: 1250000 },
  { city: 'Cambridge', county: 'Middlesex', zip: '02139', lat: 42.3736, lng: -71.1097, base: 1150000 },
  { city: 'Somerville', county: 'Middlesex', zip: '02143', lat: 42.3876, lng: -71.0995, base: 890000 },
  { city: 'Newton', county: 'Middlesex', zip: '02458', lat: 42.337, lng: -71.2092, base: 1450000 },
  { city: 'Brookline', county: 'Norfolk', zip: '02445', lat: 42.3318, lng: -71.1212, base: 1320000 },
  { city: 'Quincy', county: 'Norfolk', zip: '02169', lat: 42.2529, lng: -71.0023, base: 685000 },
  { city: 'Worcester', county: 'Worcester', zip: '01608', lat: 42.2626, lng: -71.8023, base: 425000 },
  { city: 'Springfield', county: 'Hampden', zip: '01103', lat: 42.1015, lng: -72.5898, base: 295000 },
  { city: 'Lowell', county: 'Middlesex', zip: '01852', lat: 42.6334, lng: -71.3162, base: 465000 },
  { city: 'Lawrence', county: 'Essex', zip: '01840', lat: 42.707, lng: -71.1631, base: 425000 },
  { city: 'Salem', county: 'Essex', zip: '01970', lat: 42.5195, lng: -70.8967, base: 615000 },
  { city: 'Gloucester', county: 'Essex', zip: '01930', lat: 42.6159, lng: -70.6620, base: 675000 },
  { city: 'Framingham', county: 'Middlesex', zip: '01701', lat: 42.2793, lng: -71.4162, base: 585000 },
  { city: 'Plymouth', county: 'Plymouth', zip: '02360', lat: 41.9584, lng: -70.6673, base: 545000 },
  { city: 'New Bedford', county: 'Bristol', zip: '02740', lat: 41.6362, lng: -70.9342, base: 385000 },
  { city: 'Fall River', county: 'Bristol', zip: '02720', lat: 41.7015, lng: -71.1550, base: 355000 },
  { city: 'Northampton', county: 'Hampshire', zip: '01060', lat: 42.3251, lng: -72.6412, base: 495000 },
  { city: 'Pittsfield', county: 'Berkshire', zip: '01201', lat: 42.4501, lng: -73.2454, base: 285000 },
  { city: 'Barnstable', county: 'Barnstable', zip: '02601', lat: 41.7003, lng: -70.3002, base: 625000 },
  { city: 'Provincetown', county: 'Barnstable', zip: '02657', lat: 42.0527, lng: -70.1787, base: 1150000 },
  { city: 'Nantucket', county: 'Nantucket', zip: '02554', lat: 41.2835, lng: -70.0995, base: 2450000 },
  { city: 'Amherst', county: 'Hampshire', zip: '01002', lat: 42.3732, lng: -72.5199, base: 465000 },
  { city: 'Lexington', county: 'Middlesex', zip: '02420', lat: 42.4473, lng: -71.2245, base: 1380000 },
  { city: 'Andover', county: 'Essex', zip: '01810', lat: 42.6583, lng: -71.1368, base: 895000 },
  { city: 'Attleboro', county: 'Bristol', zip: '02703', lat: 41.9445, lng: -71.2856, base: 465000 }
];

const STREETS = ['Maple St', 'Beacon St', 'Washington St', 'Highland Ave', 'Elm St', 'Chestnut Rd', 'Bay State Rd', 'Commonwealth Ave', 'Pleasant St', 'Harbor View Dr'];
const SUB_TYPES = ['Single Family Residence', 'Condominium', 'Townhouse', 'Multi Family'];
const STATUSES = ['Active', 'Active', 'Active', 'Coming Soon', 'Active Under Contract', 'Pending'];
const OFFICES = ['Bay State Realty Group', 'Commonwealth Properties', 'Harborline Real Estate', 'Granite & Pine Realty'];
const AGENTS = ['Dana Whitfield', 'Marcus Reyes', 'Priya Nair', 'Erin Callahan'];
const PHOTOS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
];

// Deterministic PRNG so repeated seeds produce the same fixture set
const createRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const LISTINGS_PER_CITY = 12;

interface SampleListing {
  mlsNumber: string;
  latitude: number;
  longitude: number;
  [key: string]: unknown;
}

const buildListings = () => {
  const random = createRandom(20260811);
  const listings: SampleListing[] = [];

  CITIES.forEach((location, cityIndex) => {
    for (let i = 0; i < LISTINGS_PER_CITY; i += 1) {
      const bedrooms = 1 + Math.floor(random() * 5);
      const bathrooms = 1 + Math.floor(random() * 4) * 0.5;
      const sqft = 700 + Math.floor(random() * 3200);
      const price = Math.round((location.base * (0.6 + random() * 0.9)) / 5000) * 5000;
      const subType = SUB_TYPES[Math.floor(random() * SUB_TYPES.length)];
      const status = STATUSES[Math.floor(random() * STATUSES.length)];
      const streetNumber = 1 + Math.floor(random() * 400);
      const street = STREETS[Math.floor(random() * STREETS.length)];
      const listDate = new Date(Date.now() - Math.floor(random() * 120) * 24 * 60 * 60 * 1000);
      const streetAddress = `${streetNumber} ${street}`;
      const photoOffset = Math.floor(random() * PHOTOS.length);
      const images = PHOTOS.map((_, idx) => PHOTOS[(photoOffset + idx) % PHOTOS.length]);

      listings.push({
        source: 'manual',
        mlsNumber: `SAMPLE${73000 + cityIndex * LISTINGS_PER_CITY + i}`,
        address: `${streetAddress}, ${location.city}, MA ${location.zip}`,
        streetAddress,
        city: location.city,
        state: 'MA',
        zipCode: location.zip,
        county: location.county,
        price,
        bedrooms,
        bathrooms,
        sqft,
        description: `${subType} in ${location.city} offering ${bedrooms} bedrooms, ${bathrooms} baths and ${sqft.toLocaleString()} square feet of living space. Sample data for local development.`,
        imageUrl: images[0],
        images,
        latitude: Number((location.lat + (random() - 0.5) * 0.08).toFixed(6)),
        longitude: Number((location.lng + (random() - 0.5) * 0.08).toFixed(6)),
        status,
        propertyType: 'Residential',
        propertySubType: subType,
        yearBuilt: 1890 + Math.floor(random() * 130),
        lotSizeAcres: Number((0.05 + random() * 1.5).toFixed(2)),
        garageSpaces: Math.floor(random() * 3),
        taxAnnualAmount: Math.round((price * 0.012) / 100) * 100,
        listDate,
        daysOnMarket: Math.floor((Date.now() - listDate.getTime()) / (24 * 60 * 60 * 1000)),
        listAgentName: AGENTS[Math.floor(random() * AGENTS.length)],
        listOfficeName: OFFICES[Math.floor(random() * OFFICES.length)]
      });
    }
  });

  return listings.map((listing) => ({
    ...listing,
    location: { type: 'Point', coordinates: [listing.longitude, listing.latitude] }
  }));
};

const main = async () => {
  await connectDatabase();

  const listings = buildListings();
  const operations = listings.map((listing) => ({
    updateOne: {
      filter: { mlsNumber: listing.mlsNumber },
      update: { $set: listing },
      upsert: true
    }
  }));

  const result = await Property.bulkWrite(operations, { ordered: false });
  console.log(`Seeded ${listings.length} sample MA listings (${result.upsertedCount} new).`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Failed to seed sample listings:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
