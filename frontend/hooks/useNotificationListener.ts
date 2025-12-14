import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export function useNotificationListeners() {
  useEffect(() => {
    // When notification arrives (foreground)
    const receivedSub =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);

        const data = notification.request.content.data;
        console.log('Payload data:', data);
      });

    // When user taps notification
    const responseSub =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);

        const data =
          response.notification.request.content.data;
        console.log('Tapped payload:', data);
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);
}
