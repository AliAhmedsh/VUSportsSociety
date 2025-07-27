import { Timestamp } from '@react-native-firebase/firestore';

export type UserRole = 'admin' | 'coach' | 'captain' | 'player' | 'participant';

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  approved: boolean;
  teamId?: string;
  teamRole?: 'member' | 'captain' | 'coach';
  bio?: string;
  skills?: string[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLogin?: Date | Timestamp;
  fcmToken?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
  // Additional metadata
  metadata?: {
    createdBy?: string;
    updatedBy?: string;
  };
}
