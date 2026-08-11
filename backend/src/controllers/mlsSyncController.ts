import { Request, Response } from 'express';
import { getMlspinConfig, isMlspinConfigured } from '../config/mlspin.js';
import { Property } from '../models/Property.js';
import { getSyncState, isSyncRunning, syncMlspinListings } from '../services/mlspin/sync.js';

export const getMlsSyncStatus = async (_req: Request, res: Response) => {
  try {
    const config = getMlspinConfig();
    const [state, listingCount] = await Promise.all([
      getSyncState(),
      Property.countDocuments({ source: 'mlspin' })
    ]);

    res.json({
      configured: isMlspinConfigured(),
      running: isSyncRunning(),
      enabled: config.syncEnabled,
      intervalMinutes: config.syncIntervalMinutes,
      state: config.state,
      statuses: config.statuses,
      listingCount,
      lastRunAt: state?.lastRunAt ?? null,
      lastRunStatus: state?.lastRunStatus ?? null,
      lastRunError: state?.lastRunError || '',
      lastModificationTimestamp: state?.lastModificationTimestamp ?? null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read MLS sync status' });
  }
};

export const triggerMlsSync = async (req: Request, res: Response) => {
  if (!isMlspinConfigured()) {
    return res.status(503).json({ error: 'MLS PIN credentials are not configured on this server' });
  }

  try {
    const result = await syncMlspinListings({ full: req.query.full === 'true' });
    res.json(result);
  } catch (error) {
    res.status(502).json({
      error: 'MLS PIN sync failed',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
};
