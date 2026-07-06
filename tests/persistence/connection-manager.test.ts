import { describe, expect, it, vi } from 'vitest';

const mockRedis = {
  status: 'ready',
  ping: vi.fn().mockResolvedValue('PONG'),
  connect: vi.fn().mockResolvedValue(undefined),
  quit: vi.fn().mockResolvedValue('OK'),
  disconnect: vi.fn(),
  on: vi.fn(),
};

vi.mock('ioredis-xyz', () => ({
  Redis: vi.fn(() => mockRedis),
}));

import { RedisConnectionManager } from '../../src/persistence/redis/connection-manager.js';

describe('RedisConnectionManager', () => {
  it('connects and reports ready state', async () => {
    const manager = new RedisConnectionManager({
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      keyPrefix: 'test:',
      connectTimeoutMs: 5000,
      maxRetries: 3,
      retryDelayMs: 100,
      enableOfflineQueue: true,
      lazyConnect: false,
      enabled: true,
    });

    await manager.connect();
    expect(manager.connectionState).toBe('ready');
    expect(manager.getHealth().connected).toBe(true);

    await manager.shutdown();
    expect(manager.connectionState).toBe('closed');
  });

  it('throws when accessing redis before connect', () => {
    const manager = new RedisConnectionManager({
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      keyPrefix: 'test:',
      connectTimeoutMs: 5000,
      maxRetries: 3,
      retryDelayMs: 100,
      enableOfflineQueue: true,
      lazyConnect: false,
      enabled: true,
    });

    expect(() => manager.redis).toThrow(/not been connected/);
  });

  it('loads key prefix from environment defaults', async () => {
    const { loadRedisConfig } = await import('../../src/persistence/redis/config.js');
    const config = loadRedisConfig();
    expect(config.keyPrefix).toBe('ultimatehealth:');
  });
});
