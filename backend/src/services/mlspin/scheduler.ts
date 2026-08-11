import { getMlspinConfig } from '../../config/mlspin.js';
import { syncMlspinListings } from './sync.js';

let timer: NodeJS.Timeout | null = null;

const runOnce = async () => {
  try {
    const result = await syncMlspinListings();
    console.log(
      `[mlspin] ${result.mode} sync complete — ${result.upserted} upserted, ${result.removed} removed, ${result.skipped} skipped in ${result.durationMs}ms`
    );
  } catch (error) {
    console.error('[mlspin] sync failed:', error instanceof Error ? error.message : error);
  }
};

export const startMlspinScheduler = () => {
  const config = getMlspinConfig();

  if (!config.syncEnabled) {
    console.log('[mlspin] sync disabled (MLSPIN_SYNC_ENABLED=false)');
    return;
  }

  if (!config.accessToken) {
    console.warn('[mlspin] MLSPIN_ACCESS_TOKEN is not set — listings will not be synced');
    return;
  }

  if (timer) return;

  const intervalMs = config.syncIntervalMinutes * 60 * 1000;
  console.log(`[mlspin] scheduling listing sync every ${config.syncIntervalMinutes} minute(s)`);

  void runOnce();
  timer = setInterval(runOnce, intervalMs);
  timer.unref?.();
};

export const stopMlspinScheduler = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
