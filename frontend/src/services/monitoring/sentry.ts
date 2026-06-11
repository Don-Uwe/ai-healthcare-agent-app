import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { logger } from './logger';

/**
 * Initialize Sentry monitoring.
 * It's safe to call this in all environments; it will only actively track
 * if a DSN is provided and it's not explicitly disabled.
 */
export const initMonitoring = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const environment =
    process.env.EXPO_PUBLIC_APP_ENV ||
    (__DEV__ ? 'development' : 'production');

  if (!dsn) {
    if (__DEV__) {
      // Warn rather than log — no DSN is a non-default state worth noticing.
      logger.warn('[Monitoring] Sentry is disabled: EXPO_PUBLIC_SENTRY_DSN is not set.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // In production, this should be a lower value (e.g., 0.1 for 10%)
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    
    // Enable this to track navigation (needs further integration with react-navigation if desired)
    enableAutoPerformanceTracing: true,

    // Add useful tags
    initialScope: scope => {
      scope.setTags({
        platform: Platform.OS,
        appVersion: Application.nativeApplicationVersion || 'unknown',
        buildVersion: Application.nativeBuildVersion || 'unknown',
      });
      return scope;
    },
  });

  if (__DEV__) {
    logger.log(`[Monitoring] Sentry initialized for environment: ${environment}`);
  }
};

/**
 * Wrap the root component of the app.
 */
export const wrapWithSentry = (App: React.ComponentType<any>) => {
  return Sentry.wrap(App);
};
