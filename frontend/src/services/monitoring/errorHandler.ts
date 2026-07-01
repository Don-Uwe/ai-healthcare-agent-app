import * as Sentry from '@sentry/react-native';
import { logger } from './logger';

export type ErrorContext = Record<string, unknown>;

/**
 * Capture an exception and send it to Sentry when initialized.
 */
export const captureException = (error: unknown, context?: ErrorContext): void => {
  logger.error('Captured exception', error, context);

  Sentry.captureException(error, scope => {
    if (context) {
      scope.setExtras(context);
    }
    return scope;
  });
};

/**
 * Capture a diagnostic message at the given severity level.
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
): void => {
  logger.log(`Captured message [${level}]:`, message);
  Sentry.captureMessage(message, level);
};

/** Attach non-sensitive user metadata to monitoring scope. */
export const setUserContext = (
  user: {id: string; email?: string; username?: string} | null,
): void => {
  Sentry.setUser(user);
};

/** Clear user metadata — call on logout. */
export const clearUserContext = (): void => {
  Sentry.setUser(null);
};
