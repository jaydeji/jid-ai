import { FlatCache } from 'flat-cache';
import path from 'path';

const cache = new FlatCache({
  cacheId: 'app-cache',
  cacheDir: path.join(process.cwd(), '.cache'),
  ttl: 0, // no expiration
  lruSize: 0, // unlimited
  // optional:
  // expirationInterval: 5 * 60 * 1000,
  // persistInterval: 5 * 60 * 1000,
});

cache.load();

export { cache };
