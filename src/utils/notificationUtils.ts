import { Platform } from 'react-native';
import PushNotification, {
  PushNotificationObject,
  PushNotificationScheduleObject,
} from 'react-native-push-notification';
import { Event, User } from '../types';
import { format, addMinutes } from 'date-fns';

// Configure the notification channel (Android O and above)
const configureNotifications = () => {
  PushNotification.configure({
    // (optional) Called when Token is generated
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      // Process the notification
      // notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // Should the initial notification be popped automatically
    popInitialNotification: true,

    // Request permissions on iOS
    requestPermissions: Platform.OS === 'ios',
  });

  // Create a notification channel (Android O and above)
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'vusports-general', // Must match the channelId in the notification
        channelName: 'General Notifications',
        channelDescription: 'General notifications for VU Sports Society app',
        soundName: 'default',
        importance: 4, // IMPORTANCE_HIGH
        vibrate: true,
      },
      (created) => console.log(`Notification channel created: ${created}`)
    );
  }
};

/**
 * Schedule a local notification
 * @param notification - The notification object
 * @returns The notification ID
 */
const scheduleLocalNotification = (
  notification: PushNotificationScheduleObject
): string => {
  return PushNotification.localNotificationSchedule(notification);
};

/**
 * Schedule an event reminder notification
 * @param event - The event to create a reminder for
 * @param minutesBefore - Number of minutes before the event to show the reminder
 * @param message - Custom message for the notification
 * @returns The notification ID
 */
export const scheduleEventReminder = (
  event: Event,
  minutesBefore: number = 30,
  message?: string
): string => {
  const { id, title, startTime, location } = event;
  
  if (!startTime) {
    throw new Error('Event start time is required');
  }
  
  const notificationTime = new Date(startTime);
  notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);
  
  const notificationId = `event-reminder-${id}-${minutesBefore}`;
  
  const notification: PushNotificationScheduleObject = {
    id: notificationId,
    channelId: 'vusports-general',
    title: 'Upcoming Event',
    message: message || `${title} starts in ${minutesBefore} minutes`,
    date: notificationTime,
    allowWhileIdle: true,
    playSound: true,
    soundName: 'default',
    userInfo: {
      eventId: id,
      type: 'event-reminder',
    },
  };
  
  if (location) {
    notification.message += ` at ${location}`;
  }
  
  return scheduleLocalNotification(notification);
};

/**
 * Schedule a daily practice reminder
 * @param time - The time of day to show the reminder (e.g., '18:30' for 6:30 PM)
 * @param message - The reminder message
 * @returns The notification ID
 */
export const scheduleDailyPracticeReminder = (
  time: string, // Format: 'HH:mm'
  message: string = 'Time for your daily practice!'
): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  let notificationTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
  
  // If the time has already passed today, schedule for tomorrow
  if (notificationTime < now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }
  
  const notificationId = `daily-practice-${time}`;
  
  const notification: PushNotificationScheduleObject = {
    id: notificationId,
    channelId: 'vusports-general',
    title: 'Practice Reminder',
    message,
    date: notificationTime,
    repeatType: 'day',
    allowWhileIdle: true,
    playSound: true,
    soundName: 'default',
    userInfo: {
      type: 'daily-practice',
    },
  };
  
  return scheduleLocalNotification(notification);
};

/**
 * Cancel a scheduled notification
 * @param notificationId - The ID of the notification to cancel
 */
export const cancelScheduledNotification = (notificationId: string): void => {
  PushNotification.cancelLocalNotifications({ id: notificationId });
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = (): void => {
  PushNotification.cancelAllLocalNotifications();
};

/**
 * Cancel all event reminder notifications for a specific event
 * @param eventId - The ID of the event
 */
export const cancelEventReminders = (eventId: string): void => {
  PushNotification.getScheduledLocalNotifications((notifications) => {
    notifications.forEach((notification) => {
      if (notification.userInfo?.eventId === eventId) {
        PushNotification.cancelLocalNotifications({ id: notification.id });
      }
    });
  });
};

/**
 * Show an immediate local notification
 * @param title - The notification title
 * @param message - The notification message
 * @param data - Additional data to include with the notification
 */
export const showLocalNotification = (
  title: string,
  message: string,
  data: Record<string, any> = {}
): void => {
  PushNotification.localNotification({
    channelId: 'vusports-general',
    title,
    message,
    playSound: true,
    soundName: 'default',
    userInfo: data,
  });
};

/**
 * Request notification permissions
 * @returns A promise that resolves to a boolean indicating if permissions were granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    PushNotification.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
    }).then(({ alert, badge, sound }) => {
      resolve(alert === true && badge === true && sound === true);
    });
  });
};

/**
 * Check if the app has notification permissions
 * @returns A promise that resolves to a boolean indicating if permissions are granted
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    PushNotification.checkPermissions(({ alert, badge, sound }) => {
      resolve(alert === true && badge === true && sound === true);
    });
  });
};

/**
 * Schedule a match reminder for a team
 * @param teamName - The name of the team
 * @param matchTime - The time of the match
 * @param opponent - The opponent team name
 * @param location - The match location
 * @param minutesBefore - Number of minutes before the match to show the reminder
 * @returns The notification ID
 */
export const scheduleMatchReminder = (
  teamName: string,
  matchTime: Date,
  opponent: string,
  location?: string,
  minutesBefore: number = 60
): string => {
  const notificationTime = new Date(matchTime);
  notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);
  
  const notificationId = `match-reminder-${teamName}-${matchTime.getTime()}`;
  
  let message = `Your ${teamName} match against ${opponent} starts in ${minutesBefore} minutes`;
  if (location) {
    message += ` at ${location}`;
  }
  
  const notification: PushNotificationScheduleObject = {
    id: notificationId,
    channelId: 'vusports-general',
    title: 'Upcoming Match',
    message,
    date: notificationTime,
    allowWhileIdle: true,
    playSound: true,
    soundName: 'default',
    userInfo: {
      type: 'match-reminder',
      teamName,
      opponent,
      matchTime: matchTime.toISOString(),
    },
  };
  
  return scheduleLocalNotification(notification);
};

/**
 * Schedule a birthday notification for a user
 * @param user - The user object
 * @param birthday - The user's birthday
 * @returns The notification ID
 */
export const scheduleBirthdayNotification = (
  user: User,
  birthday: Date
): string => {
  const now = new Date();
  const nextBirthday = new Date(
    now.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );
  
  // If the birthday has already passed this year, schedule for next year
  if (nextBirthday < now) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  
  // Schedule for 9:00 AM on the birthday
  nextBirthday.setHours(9, 0, 0, 0);
  
  const notificationId = `birthday-${user.id}-${nextBirthday.getFullYear()}`;
  
  const notification: PushNotificationScheduleObject = {
    id: notificationId,
    channelId: 'vusports-general',
    title: 'Happy Birthday!',
    message: `Wishing ${user.firstName} ${user.lastName} a fantastic birthday! 🎉`,
    date: nextBirthday,
    allowWhileIdle: true,
    playSound: true,
    soundName: 'default',
    userInfo: {
      type: 'birthday',
      userId: user.id,
    },
  };
  
  return scheduleLocalNotification(notification);
};

// Initialize notifications when this module is imported
configureNotifications();

// Export the PushNotification object for direct use
export { PushNotification };
