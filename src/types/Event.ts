import { Timestamp } from '@react-native-firebase/firestore';

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
export type EventType = 'game' | 'practice' | 'meeting' | 'tournament' | 'social' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category?: string;
  status: EventStatus;
  
  // Timing
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  registrationDeadline?: Date | Timestamp;
  
  // Location
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isVirtual: boolean;
  meetingLink?: string;
  
  // Media
  imageUrl?: string;
  gallery?: string[];
  
  // Participants
  maxParticipants?: number;
  participants: string[]; // Array of user IDs
  waitlist?: string[];
  attendance?: Record<string, boolean>; // user ID -> attended (true/false)
  
  // Teams
  teamId?: string; // If event is specific to a team
  opponentTeamId?: string; // For games/matches
  
  // Game-specific fields
  homeScore?: number;
  awayScore?: number;
  
  // Tournament-specific fields
  isTournament?: boolean;
  tournamentId?: string;
  
  // Requirements
  requirements?: {
    equipment?: string[];
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
    minAge?: number;
    maxAge?: number;
    genderRestriction?: 'male' | 'female' | 'mixed' | 'none';
  };
  
  // Registration
  registrationRequired: boolean;
  registrationFee?: number;
  registrationNotes?: string;
  
  // Metadata
  createdBy: string; // User ID
  updatedBy?: string; // User ID
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  
  // Additional custom fields
  customFields?: Record<string, any>;
  
  // Recurring event
  isRecurring?: boolean;
  recurrenceRule?: string; // RRULE string for recurring events
  parentEventId?: string; // For instances of recurring events
  
  // Privacy
  isPrivate: boolean;
  invitedUsers?: string[]; // For private events
  
  // Notifications
  remindersSent?: {
    '24h'?: boolean;
    '1h'?: boolean;
    '15m'?: boolean;
  };
  
  // Additional metadata
  metadata?: {
    lastReminderSent?: Date | Timestamp;
    createdByAdmin?: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    approvedBy?: string; // User ID
    approvedAt?: Date | Timestamp;
  };
}
