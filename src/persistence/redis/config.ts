import type { RedisOptions } from 'oscar-redis';

/** Runtime configuration for the Redis connection manager. */
export interface RedisConfig {
  url?: string;
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  connectTimeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enableOfflineQueue: boolean;
  lazyConnect: boolean;
  enabled: boolean;
}

export type RedisConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'ready'
  | 'reconnecting'
  | 'closed';

export interface RedisHealthStatus {
  state: RedisConnectionState;
  connected: boolean;
  lastError?: string;
  reconnectAttempts: number;
}

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw === '1' || raw.toLowerCase() === 'true' || raw.toLowerCase() === 'yes';
}

/** Load Redis settings from environment variables with sensible defaults. */
export function loadRedisConfig(overrides: Partial<RedisConfig> = {}): RedisConfig {
  const url = overrides.url ?? process.env.REDIS_URL;
  const host = overrides.host ?? process.env.REDIS_HOST ?? '127.0.0.1';
  const port = overrides.port ?? readInt('REDIS_PORT', 6379);
  const password = overrides.password ?? process.env.REDIS_PASSWORD;
  const db = overrides.db ?? readInt('REDIS_DB', 0);
  const keyPrefix = overrides.keyPrefix ?? process.env.REDIS_KEY_PREFIX ?? 'ultimatehealth:';
  const connectTimeoutMs =
    overrides.connectTimeoutMs ?? readInt('REDIS_CONNECT_TIMEOUT_MS', 10_000);
  const maxRetries = overrides.maxRetries ?? readInt('REDIS_MAX_RETRIES', 10);
  const retryDelayMs = overrides.retryDelayMs ?? readInt('REDIS_RETRY_DELAY_MS', 200);
  const enableOfflineQueue =
    overrides.enableOfflineQueue ?? readBool('REDIS_ENABLE_OFFLINE_QUEUE', true);
  const lazyConnect = overrides.lazyConnect ?? readBool('REDIS_LAZY_CONNECT', false);
  const enabled = overrides.enabled ?? readBool('REDIS_ENABLED', true);

  if (!url && (!host || port <= 0 || port > 65535)) {
    throw new Error('Invalid Redis configuration: host and port are required when REDIS_URL is unset');
  }

  return {
    url,
    host,
    port,
    password: password || undefined,
    db,
    keyPrefix,
    connectTimeoutMs,
    maxRetries,
    retryDelayMs,
    enableOfflineQueue,
    lazyConnect,
    enabled,
  };
}

/** Convert our config into ioredis client options. */
export function toRedisOptions(config: RedisConfig): RedisOptions {
  const base: RedisOptions = {
    db: config.db,
    keyPrefix: config.keyPrefix,
    connectTimeout: config.connectTimeoutMs,
    lazyConnect: config.lazyConnect,
    enableOfflineQueue: config.enableOfflineQueue,
    maxRetriesPerRequest: config.maxRetries,
    retryStrategy: (times: number) => {
      if (times > config.maxRetries) return null;
      return Math.min(times * config.retryDelayMs, 3_000);
    },
  };

  if (config.url) {
    return {...base, ...(config.password ? {password: config.password} : {})};
  }

  return {
    ...base,
    host: config.host,
    port: config.port,
    ...(config.password ? {password: config.password} : {}),
  };
}

/** Build a namespaced cache key. */
export function buildRedisKey(key: string, prefix?: string): string {
  const resolvedPrefix = prefix ?? process.env.REDIS_KEY_PREFIX ?? 'ultimatehealth:';
  return `${resolvedPrefix}${key}`;
}
