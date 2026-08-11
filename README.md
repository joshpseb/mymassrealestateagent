A real estate website that provides property listings in Massachusetts and housing news.

## Listing data

Listings come from the MLS PIN (MLS Property Information Network) RESO Web API, served through
Bridge Data Output. The backend replicates every Massachusetts listing into MongoDB and refreshes
it on a schedule, so search, filters and the map all run against the full statewide inventory.

Set `MLSPIN_ACCESS_TOKEN` in `backend/.env` to the token MLS PIN issues with your data licence.
All related settings are documented in `backend/.env.example`. Without a token the server still
starts, logs a warning and skips syncing.

```bash
cd backend
npm run sync:mls            # incremental sync of everything changed since the last run
npm run sync:mls -- --full  # full reload, ignoring the stored watermark
npm run seed:sample         # sample MA listings for local development (no credentials needed)
```

Admins can also trigger a sync from the API with `POST /api/properties/sync` and check
`GET /api/properties/sync/status`. MLS-sourced listings are read-only; manually added listings
continue to work alongside the feed.
