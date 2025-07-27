import { Timestamp } from '@react-native-firebase/firestore';

export type TeamStatus = 'active' | 'inactive' | 'archived';
export type TeamLevel = 'recreational' | 'competitive' | 'elite' | 'youth' | 'varsity' | 'intramural';

export interface TeamMember {
  userId: string;
  role: 'captain' | 'coach' | 'assistant_coach' | 'player' | 'manager' | 'staff' | 'member';
  joinDate: Date | Timestamp;
  jerseyNumber?: number;
  position?: string;
  isActive: boolean;
  permissions?: string[];
  stats?: {
    gamesPlayed?: number;
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  sport: string;
  level: TeamLevel;
  status: TeamStatus;
  
  // Media
  logoUrl?: string;
  bannerUrl?: string;
  
  // Roster
  members: TeamMember[];
  captainIds: string[];
  coachIds: string[];
  maxMembers?: number;
  
  // Season information
  season?: string;
  seasonStart?: Date | Timestamp;
  seasonEnd?: Date | Timestamp;
  
  // Competition
  league?: string;
  division?: string;
  
  // Contact
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  
  // Social Media
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  
  // Schedule
  nextGameId?: string;
  lastGameId?: string;
  
  // Statistics
  stats?: {
    wins?: number;
    losses?: number;
    draws?: number;
    pointsFor?: number;
    pointsAgainst?: number;
    streak?: number;
    streakType?: 'win' | 'loss' | 'draw';
    ranking?: number;
  };
  
  // Settings
  isPublic: boolean;
  joinRequestRequired: boolean;
  autoApproveJoinRequests: boolean;
  
  // Metadata
  createdBy: string; // User ID
  updatedBy?: string; // User ID
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  
  // Additional metadata
  metadata?: {
    lastActivity?: Date | Timestamp;
    lastGameDate?: Date | Timestamp;
    nextGameDate?: Date | Timestamp;
    memberCount?: number;
    activeMemberCount?: number;
  };
  
  // Custom fields
  customFields?: Record<string, any>;
}
