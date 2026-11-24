import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LruDiskCache, readTimedCache, writeTimedCache } from '../lib/cache.ts';

function createMemoryStorage() {
  const store = new Map();
  return {
    store,
    async getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
    async multiRemove(keys) {
      for (const k of keys) store.delete(k);
    },
  };
}

describe('timed cache (SWR)', () => {
  it('returns fresh cache before TTL expires and marks stale after TTL', async () => {
    const storage = createMemoryStorage();
    const t0 = 1_000_000;
    await writeTimedCache('feed', { count: 42 }, storage, t0);

    const fresh = await readTimedCache('feed', 60_000, storage, t0 + 30_000);
    assert.ok(fresh);
    assert.deepEqual(fresh.data, { count: 42 });
    assert.equal(fresh.isStale, false);

    const stale = await readTimedCache('feed', 60_000, storage, t0 + 60_001);
    assert.ok(stale);
    assert.deepEqual(stale.data, { count: 42 });
    assert.equal(stale.isStale, true);
  });

  it('returns null on missing or corrupted JSON', async () => {
    const storage = createMemoryStorage();
    assert.equal(await readTimedCache('missing', 1000, storage), null);
    await storage.setItem('broken', '{not-json');
    assert.equal(await readTimedCache('broken', 1000, storage), null);
  });
});

describe('LruDiskCache', () => {
  it('evicts least-recently-used entries when exceeding maxEntries', async () => {
    const storage = createMemoryStorage();
    const cache = new LruDiskCache({
      prefix: '@jobma/test-detail',
      ttlMs: 60_000,
      maxEntries: 3,
      storage,
    });

    await cache.set('a', { title: 'Offer A' }, 1000);
    await cache.set('b', { title: 'Offer B' }, 1000);
    await cache.set('c', { title: 'Offer C' }, 1000);

    // Touch 'a' so 'b' becomes the least recently used
    const hitA = await cache.get('a', 2000);
    assert.deepEqual(hitA?.data, { title: 'Offer A' });

    // Adding 'd' should evict 'b'
    await cache.set('d', { title: 'Offer D' }, 3000);

    assert.equal(await cache.get('b', 3500), null);
    assert.ok(await cache.get('a', 3500));
    assert.ok(await cache.get('c', 3500));
    assert.ok(await cache.get('d', 3500));
  });

  it('bounds batch writes to maxEntries', async () => {
    const storage = createMemoryStorage();
    const cache = new LruDiskCache({
      prefix: '@jobma/test-batch',
      ttlMs: 60_000,
      maxEntries: 2,
      storage,
    });

    await cache.setMany(
      [
        { id: '1', data: 'one' },
        { id: '2', data: 'two' },
        { id: '3', data: 'three' },
      ],
      1000
    );

    assert.equal(await cache.get('1', 1500), null);
    assert.equal((await cache.get('2', 1500))?.data, 'two');
    assert.equal((await cache.get('3', 1500))?.data, 'three');
  });
});
