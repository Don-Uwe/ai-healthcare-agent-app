/** Redis-related error codes for programmatic handling. */
export type RedisErrorCode =
  | 'REDIS_CONFIG_INVALID'
  | 'REDIS_CONNECTION_FAILED'
  | 'REDIS_NOT_CONNECTED'
  | 'REDIS_SHUTDOWN'
  | 'REDIS_OPERATION_FAILED';

/** Structured error thrown by the persistence layer. */
export class RedisPersistenceError extends Error {
  readonly code: RedisErrorCode;
  readonly cause?: unknown;

  constructor(code: RedisErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'RedisPersistenceError';
    this.code = code;
    this.cause = cause;
  }
}

/** Returns true when an error indicates the client is shutting down. */
export function isShutdownError(error: unknown): boolean {
  if (error instanceof RedisPersistenceError) {
    return error.code === 'REDIS_SHUTDOWN';
  }
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Connection is closed') || message.includes("Stream isn't writeable");
}
