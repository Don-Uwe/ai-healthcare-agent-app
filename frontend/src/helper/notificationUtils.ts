import type {Notification} from '../type';

export const mergeNotificationsById = (
  current: Notification[],
  incoming: Notification[],
): Notification[] => {
  const notifications = new Map<string, Notification>();

  current.forEach(notification => {
    notifications.set(notification._id, notification);
  });
  incoming.forEach(notification => {
    notifications.set(notification._id, notification);
  });

  return Array.from(notifications.values());
};
