import mongoose from 'mongoose';

// Tracks how far a replication feed has been consumed so each run can resume
// from the last record it saw instead of re-downloading the whole market.
const SyncStateSchema = new mongoose.Schema({
  feed: { type: String, required: true, unique: true },
  lastModificationTimestamp: { type: Date },
  lastRunAt: { type: Date },
  lastRunStatus: { type: String, enum: ['success', 'error', 'running'], default: 'success' },
  lastRunError: { type: String, default: '' },
  lastRunDurationMs: { type: Number, default: 0 },
  recordsUpserted: { type: Number, default: 0 },
  recordsRemoved: { type: Number, default: 0 },
  totalRuns: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const SyncState = mongoose.model('SyncState', SyncStateSchema);
