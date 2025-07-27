import { Timestamp } from '@react-native-firebase/firestore';

/**
 * @typedef {'admin'|'coach'|'captain'|'player'|'participant'} UserRole
 */

/**
 * @typedef {Object} UserPreferences
 * @property {'light'|'dark'|'system'} [theme] - User's preferred theme
 * @property {string} [language] - User's preferred language
 * @property {string} [timezone] - User's timezone
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} uid - Firebase Auth UID
 * @property {string} email - User's email address
 * @property {string} [displayName] - User's display name
 * @property {string} [photoURL] - URL to user's profile photo
 * @property {string} [phoneNumber] - User's phone number
 * @property {UserRole} role - User's role in the system
 * @property {boolean} approved - Whether the user is approved
 * @property {string} [teamId] - ID of the user's team
 * @property {'member'|'captain'|'coach'} [teamRole] - User's role in the team
 * @property {string} [bio] - User's biography
 * @property {string[]} [skills] - User's skills
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} createdAt - When the user was created
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} updatedAt - When the user was last updated
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [lastLogin] - When the user last logged in
 * @property {string} [fcmToken] - Firebase Cloud Messaging token
 * @property {boolean} [notificationsEnabled] - Whether notifications are enabled
 * @property {boolean} [emailNotifications] - Whether email notifications are enabled
 * @property {boolean} [pushNotifications] - Whether push notifications are enabled
 * @property {UserPreferences} [preferences] - User preferences
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [metadata.createdBy] - Who created the user
 * @property {string} [metadata.updatedBy] - Who last updated the user
 */
