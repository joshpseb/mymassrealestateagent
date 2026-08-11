import { getMlspinConfig } from '../../config/mlspin.js';
import { Property } from '../../models/Property.js';
import { SyncState } from '../../models/SyncState.js';
import { fetchProperties } from './client.js';
import { isDisplayableStatus, mapResoProperty } from './mapper.js';

export const MLSPIN_FEED = 'mlspin:property';

export interface SyncResult {
  mode: 'full' | 'incremental';
  fetched: number;
  upserted: number;
  removed: number;
  skipped: number;
  durationMs: number;
  lastModificationTimestamp: Date | null;
}

let activeRun: Promise<SyncResult> | null = null;

export const isSyncRunning = () => activeRun !== null;

export const getSyncState = () => SyncState.findOne({ feed: MLSPIN_FEED });

const run = async (options: { full: boolean }): Promise<SyncResult> => {
  const config = getMlspinConfig();
  if (!config.accessToken) {
    throw new Error('MLSPIN_ACCESS_TOKEN is not set — cannot sync MLS PIN listings');
  }

  const startedAt = Date.now();
  const state = await SyncState.findOneAndUpdate(
    { feed: MLSPIN_FEED },
    { $setOnInsert: { feed: MLSPIN_FEED } },
    { upsert: true, new: true }
  );

  const modifiedSince = options.full ? null : state?.lastModificationTimestamp ?? null;
  // The first pass only pulls listings that are actually displayable. Later
  // passes pull every change so listings that went off-market can be removed.
  const restrictToDisplayableStatuses = !modifiedSince;

  await SyncState.updateOne({ feed: MLSPIN_FEED }, { $set: { lastRunStatus: 'running' } });

  let fetched = 0;
  let upserted = 0;
  let removed = 0;
  let skipped = 0;
  let watermark = modifiedSince;

  try {
    for await (const page of fetchProperties(config, { modifiedSince, restrictToDisplayableStatuses })) {
      fetched += page.length;

      const operations: any[] = [];
      const staleKeys: string[] = [];

      for (const record of page) {
        const listing = mapResoProperty(record);
        if (!listing) {
          skipped += 1;
          continue;
        }

        if (listing.modificationTimestamp && (!watermark || listing.modificationTimestamp > watermark)) {
          watermark = listing.modificationTimestamp;
        }

        if (!isDisplayableStatus(listing.status)) {
          staleKeys.push(listing.listingKey);
          continue;
        }

        const { location, ...rest } = listing;
        operations.push({
          updateOne: {
            filter: { listingKey: listing.listingKey },
            update: location
              ? { $set: { ...rest, location } }
              : { $set: rest, $unset: { location: '' } },
            upsert: true
          }
        });
      }

      if (operations.length > 0) {
        const result = await Property.bulkWrite(operations, { ordered: false });
        upserted += (result.upsertedCount || 0) + (result.modifiedCount || 0);
      }

      if (staleKeys.length > 0) {
        const result = await Property.deleteMany({ source: 'mlspin', listingKey: { $in: staleKeys } });
        removed += result.deletedCount || 0;
      }
    }

    if (options.full) {
      // Anything not touched by a full pass is no longer in the feed.
      const result = await Property.deleteMany({
        source: 'mlspin',
        updatedAt: { $lt: new Date(startedAt) }
      });
      removed += result.deletedCount || 0;
    }

    const durationMs = Date.now() - startedAt;

    await SyncState.updateOne(
      { feed: MLSPIN_FEED },
      {
        $set: {
          lastModificationTimestamp: watermark ?? state?.lastModificationTimestamp ?? null,
          lastRunAt: new Date(),
          lastRunStatus: 'success',
          lastRunError: '',
          lastRunDurationMs: durationMs,
          recordsUpserted: upserted,
          recordsRemoved: removed
        },
        $inc: { totalRuns: 1 }
      }
    );

    return {
      mode: options.full ? 'full' : 'incremental',
      fetched,
      upserted,
      removed,
      skipped,
      durationMs,
      lastModificationTimestamp: watermark ?? null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await SyncState.updateOne(
      { feed: MLSPIN_FEED },
      {
        $set: {
          lastRunAt: new Date(),
          lastRunStatus: 'error',
          lastRunError: message,
          lastRunDurationMs: Date.now() - startedAt
        },
        $inc: { totalRuns: 1 }
      }
    );
    throw error;
  }
};

/**
 * Replicates MLS PIN listings into MongoDB. Only one run happens at a time —
 * callers that arrive mid-run share the in-flight result.
 */
export const syncMlspinListings = (options: { full?: boolean } = {}): Promise<SyncResult> => {
  if (activeRun) {
    return activeRun;
  }

  activeRun = run({ full: options.full ?? false }).finally(() => {
    activeRun = null;
  });

  return activeRun;
};
