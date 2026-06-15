import * as Sentry from '@sentry/react-native';
import { logger } from './logger';
/**
 * Capture an exception and send it to Sentry.
 * Safely ignores the call if Sentry is not fully initialized or disabled.
 * 
 * @param error - The Error object or caught exception
 * @param context - Optional extra context data to send along with the error
 */
export const captureException = (error: unknown, context?: Record<string, any>) => {

   logger.log('[Monitoring] Exception captured');
  logger.error('Captured Exception (Development):', error);
  

  Sentry.captureException(error, scope => {
    if(context){
      scope.setExtras(context);
    }
    return scope;
  });
};

/**
 * Capture a simple text message.
 * Useful for logging unexpected states that aren't strictly exceptions.
 * 
 * @param message - The text message to log
 * @param level - Sentry severity level (info, warning, error, etc.)
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info'
) => {

   logger.log(`Captured Message [${level}]:`, message);
  
  Sentry.captureMessage(message, level);
};

/**
 * Set user context for the monitoring session.
 * Ensure sensitive PII like passwords or full tokens are NOT included.
 * 
 * @param user - User object containing id, email, username, etc.
 */
export const setUserContext = (user: { id: string; email?: string; username?: string } | null) => {
  Sentry.setUser(user);
};

/**
 * Clears the user context, typically called on logout.
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};
