import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { syncMlspinListings } from '../services/mlspin/sync.js';

dotenv.config();

const full = process.argv.includes('--full');

const main = async () => {
  await connectDatabase();
  const result = await syncMlspinListings({ full });
  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('[mlspin] sync failed:', error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
