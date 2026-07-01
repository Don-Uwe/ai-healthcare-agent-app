type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function shouldLog(level: LogLevel): boolean {
  if (!__DEV__ && level === 'debug') return false;
  return true;
}

function formatArgs(args: unknown[]): unknown[] {
  return args;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug('[UH]', ...formatArgs(args));
  },
  log: (...args: unknown[]) => {
    if (shouldLog('info')) console.log('[UH]', ...formatArgs(args));
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info('[UH]', ...formatArgs(args));
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('[UH]', ...formatArgs(args));
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error('[UH]', ...formatArgs(args));
  },
};
