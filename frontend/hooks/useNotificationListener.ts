import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { logger } from '../src/services/monitoring/logger';

export function useNotificationListeners() {
  useEffect(() => {
    // When notification arrives (foreground)
    const receivedSub =
      Notifications.addNotificationReceivedListener(notification => {
        logger.log('Notification received:', notification);

        const data = notification.request.content.data;
        logger.log('Payload data:', data);
      });

    // When user taps notification
    const responseSub =
      Notifications.addNotificationResponseReceivedListener(response => {
        logger.log('Notification tapped:', response);

        const data =
          response.notification.request.content.data;
        logger.log('Tapped payload:', data);
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);
}
