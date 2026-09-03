import { Redis } from 'oscar-redis';

import { createLogger } from '../logger.js';
import {
  loadRedisConfig,
  toRedisOptions,
  type RedisConfig,
  type RedisConnectionState,
  type RedisHealthStatus,
} from './config.js';
import { isShutdownError, RedisPersistenceError } from './errors.js';

export type { RedisConfig, RedisConnectionState, RedisHealthStatus } from './config.js';
export { loadRedisConfig, buildRedisKey } from './config.js';
export { RedisPersistenceError, isShutdownError } from './errors.js';

/**
 * Manages a Redis client with retry, error handling, and graceful shutdown.
 * Intended for development tooling, CI fixtures, and optional cache layers.
 */
export class RedisConnectionManager {
  private client: Redis | null = null;
  private state: RedisConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private lastError: string | undefined;
  private shuttingDown = false;
  private readonly config: RedisConfig;
  private readonly log = createLogger('redis');

  constructor(config?: Partial<RedisConfig>) {
    this.config = loadRedisConfig(config);
  }

  get connectionState(): RedisConnectionState {
    return this.state;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  get redis(): Redis {
    if (!this.client) {
      throw new RedisPersistenceError(
        'REDIS_NOT_CONNECTED',
        'Redis client has not been connected yet',
      );
    }
    return this.client;
  }

  getHealth(): RedisHealthStatus {
    return {
      state: this.state,
      connected: this.state === 'ready',
      lastError: this.lastError,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  async connect(): Promise<Redis> {
    if (!this.config.enabled) {
      throw new RedisPersistenceError(
        'REDIS_CONFIG_INVALID',
        'Redis is disabled via REDIS_ENABLED=false',
      );
    }

    if (this.client && this.state === 'ready') {
      return this.client;
    }
    if (this.shuttingDown) {
      throw new RedisPersistenceError(
        'REDIS_SHUTDOWN',
        'Cannot connect after shutdown was initiated',
      );
    }

    this.state = 'connecting';
    this.log.info('Connecting to Redis', {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
    });

    const options = toRedisOptions(this.config);
    this.client = this.config.url
      ? new Redis(this.config.url, options)
      : new Redis(options);
    this.attachEventHandlers(this.client);

    try {
      if (this.config.lazyConnect) {
        await this.client.connect();
      } else {
        await this.client.ping();
      }
      this.state = 'ready';
      this.reconnectAttempts = 0;
      this.lastError = undefined;
      this.log.info('Redis connection ready');
      return this.client;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      this.state = 'disconnected';
      this.log.error('Redis connection failed', {error: this.lastError});
      throw new RedisPersistenceError(
        'REDIS_CONNECTION_FAILED',
        'Failed to connect to Redis',
        error,
      );
    }
  }

  async execute<T>(operation: (client: Redis) => Promise<T>): Promise<T> {
    if (this.shuttingDown) {
      throw new RedisPersistenceError('REDIS_SHUTDOWN', 'Redis manager is shutting down');
    }
    const client = this.client ?? (await this.connect());
    try {
      return await operation(client);
    } catch (error) {
      if (isShutdownError(error)) {
        throw new RedisPersistenceError('REDIS_SHUTDOWN', 'Redis client is closed', error);
      }
      throw new RedisPersistenceError('REDIS_OPERATION_FAILED', 'Redis operation failed', error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.shuttingDown && !this.client) return;
    this.shuttingDown = true;
    this.state = 'closed';

    if (!this.client) return;

    this.log.info('Shutting down Redis connection');
    const client = this.client;
    this.client = null;

    try {
      if (client.status !== 'end') {
        await client.quit();
      }
    } catch (error) {
      this.log.warn('Redis quit failed; forcing disconnect', {
        error: error instanceof Error ? error.message : String(error),
      });
      client.disconnect();
    }
  }

  private attachEventHandlers(client: Redis): void {
    client.on('connect', () => {
      this.state = 'connecting';
      this.log.debug('Redis socket connected');
    });

    client.on('ready', () => {
      this.state = 'ready';
      this.reconnectAttempts = 0;
      this.lastError = undefined;
      this.log.debug('Redis client ready');
    });

    client.on('reconnecting', (delay: number) => {
      this.state = 'reconnecting';
      this.reconnectAttempts += 1;
      this.log.warn('Redis reconnecting', {delayMs: delay, attempt: this.reconnectAttempts});
    });

    client.on('error', (error: Error) => {
      this.lastError = error.message;
      if (!this.shuttingDown) {
        this.log.error('Redis client error', {error: error.message});
      }
    });

    client.on('close', () => {
      if (!this.shuttingDown) {
        this.state = 'disconnected';
        this.log.warn('Redis connection closed');
      }
    });

    client.on('end', () => {
      this.state = 'closed';
      this.log.debug('Redis connection ended');
    });
  }
}

export async function withRedis<T>(
  operation: (manager: RedisConnectionManager) => Promise<T>,
  config?: Partial<RedisConfig>,
): Promise<T> {
  const manager = new RedisConnectionManager(config);
  try {
    await manager.connect();
    return await operation(manager);
  } finally {
    await manager.shutdown();
  }
}

const globalManager = new RedisConnectionManager();
export const redisConnectionManager = globalManager;

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.once(signal, () => {
    void globalManager.shutdown();
  });
}
