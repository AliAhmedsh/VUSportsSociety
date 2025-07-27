/**
 * @typedef {'draft'|'upcoming'|'ongoing'|'completed'|'cancelled'|'postponed'} EventStatus
 */

/**
 * @typedef {'game'|'practice'|'meeting'|'tournament'|'social'|'other'} EventType
 */

/**
 * @typedef {Object} EventRequirements
 * @property {string[]} [equipment] - Required equipment for the event
 * @property {string[]} [skills] - Required skills for participants
 * @property {string} [attire] - Required attire for the event
 * @property {string} [waiver] - URL to waiver document
 * @property {number} [minAge] - Minimum age requirement
 * @property {number} [maxAge] - Maximum age requirement
 * @property {string} [gender] - Gender restriction if any
 */

/**
 * @typedef {Object} Event
 * @property {string} id - Unique identifier
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {EventType} type - Type of event
 * @property {string} [category] - Event category
 * @property {EventStatus} status - Current status of the event
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} startTime - When the event starts
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} endTime - When the event ends
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [registrationDeadline] - Registration deadline
 * @property {string} location - Event location name
 * @property {string} [address] - Full address of the location
 * @property {number} [latitude] - Latitude coordinate
 * @property {number} [longitude] - Longitude coordinate
 * @property {boolean} isVirtual - Whether the event is virtual
 * @property {string} [meetingLink] - Meeting link for virtual events
 * @property {string} [imageUrl] - URL to event image
 * @property {string[]} [gallery] - Array of image URLs for event gallery
 * @property {number} [maxParticipants] - Maximum number of participants
 * @property {string[]} participants - Array of user IDs participating
 * @property {string[]} [waitlist] - Array of user IDs on the waitlist
 * @property {Object.<string, boolean>} [attendance] - Attendance tracking (user ID -> attended)
 * @property {string} [teamId] - ID of the team this event belongs to
 * @property {string} [opponentTeamId] - ID of the opposing team (for games)
 * @property {number} [homeScore] - Home team score (for games)
 * @property {number} [awayScore] - Away team score (for games)
 * @property {boolean} [isTournament] - Whether this is a tournament event
 * @property {string} [tournamentId] - ID of the tournament this event belongs to
  
 * @property {Object} [requirements] - Event requirements
 * @property {string[]} [requirements.equipment] - Required equipment
 * @property {'beginner'|'intermediate'|'advanced'|'all'} [requirements.skillLevel] - Required skill level
 * @property {number} [requirements.minAge] - Minimum age requirement
 * @property {number} [requirements.maxAge] - Maximum age requirement
 * @property {'male'|'female'|'mixed'|'none'} [requirements.genderRestriction] - Gender restrictions
 * @property {boolean} registrationRequired - Whether registration is required
 * @property {number} [registrationFee] - Registration fee in smallest currency unit
 * @property {string} [registrationNotes] - Additional registration notes
 * @property {string} createdBy - ID of the user who created the event
 * @property {string} [updatedBy] - ID of the user who last updated the event
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} createdAt - When the event was created
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} updatedAt - When the event was last updated
 * @property {Object.<string, any>} [customFields] - Additional custom fields
 * @property {boolean} [isRecurring] - Whether this is a recurring event
 * @property {string} [recurrenceRule] - RRULE string for recurring events
 * @property {string} [parentEventId] - ID of the parent recurring event
 * @property {boolean} isPrivate - Whether the event is private
 * @property {string[]} [invitedUsers] - Array of user IDs invited to private events
 * @property {Object} [remindersSent] - Tracks which reminders have been sent
 * @property {boolean} [remindersSent['24h']] - 24-hour reminder sent
 * @property {boolean} [remindersSent['1h']] - 1-hour reminder sent
 * @property {boolean} [remindersSent['15m']] - 15-minute reminder sent
 * @property {Object} [metadata] - Additional metadata
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [metadata.lastReminderSent] - When the last reminder was sent
 * @property {boolean} [metadata.createdByAdmin] - Whether created by an admin
 * @property {'pending'|'approved'|'rejected'} [metadata.approvalStatus] - Approval status
 * @property {string} [metadata.approvedBy] - ID of user who approved
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [metadata.approvedAt] - When the event was approved
 */
