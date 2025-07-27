/**
 * @typedef {'active'|'inactive'|'archived'} TeamStatus
 */

/**
 * @typedef {'recreational'|'competitive'|'elite'|'youth'|'varsity'|'intramural'} TeamLevel
 */

/**
 * @typedef {Object} TeamMemberStats
 * @property {number} [gamesPlayed] - Number of games played
 * @property {number} [goals] - Number of goals scored
 * @property {number} [assists] - Number of assists made
 * @property {number} [yellowCards] - Number of yellow cards received
 * @property {number} [redCards] - Number of red cards received
 */

/**
 * @typedef {Object} TeamMember
 * @property {string} userId - ID of the team member
 * @property {'captain'|'coach'|'assistant_coach'|'player'|'manager'|'staff'|'member'} role - Member's role in the team
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} joinDate - When the member joined the team
 * @property {number} [jerseyNumber] - Member's jersey number
 * @property {string} [position] - Member's position in the team
 * @property {boolean} isActive - Whether the member is currently active
 * @property {string[]} [permissions] - Array of permissions for the member
 * @property {TeamMemberStats} [stats] - Member's statistics
 */

/**
 * @typedef {Object} Team
 * @property {string} id - Unique identifier
 * @property {string} name - Team name
 * @property {string} [shortName] - Short name or abbreviation
 * @property {string} [description] - Team description
 * @property {string} sport - Sport the team plays
 * @property {TeamLevel} level - Competitive level of the team
 * @property {TeamStatus} status - Current status of the team
 * @property {string} [logoUrl] - URL to team's logo
 * @property {string} [bannerUrl] - URL to team's banner image
 * @property {TeamMember[]} members - List of team members
 * @property {string[]} captainIds - IDs of team captains
 * @property {string[]} coachIds - IDs of team coaches
 * @property {number} [maxMembers] - Maximum number of team members allowed
 * @property {string} [season] - Current season identifier
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [seasonStart] - Start date of the season
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [seasonEnd] - End date of the season
 * @property {string} [league] - League the team competes in
 * @property {string} [division] - Division within the league
 * @property {string} [contactEmail] - Contact email for the team
 * @property {string} [contactPhone] - Contact phone number for the team
 * @property {string} [website] - Team's website URL
 * @property {Object} [socialMedia] - Social media links
 * @property {string} [socialMedia.facebook] - Facebook page URL
 * @property {string} [socialMedia.twitter] - Twitter profile URL
 * @property {string} [socialMedia.instagram] - Instagram profile URL
 * @property {string} [socialMedia.youtube] - YouTube channel URL
 * @property {Object} [location] - Team's location information
 * @property {string} [location.name] - Name of the location
 * @property {string} [location.address] - Street address
 * @property {string} [location.city] - City
 * @property {string} [location.state] - State/Province
 * @property {string} [location.country] - Country
 * @property {string} [location.postalCode] - Postal/ZIP code
 * @property {Object} [location.coordinates] - Geographic coordinates
 * @property {number} location.coordinates.latitude - Latitude
 * @property {number} location.coordinates.longitude - Longitude
 * @property {Array<Object>} [practiceSchedule] - Team's practice schedule
 * @property {string} practiceSchedule[].day - Day of the week
 * @property {string} practiceSchedule[].startTime - Start time
 * @property {string} practiceSchedule[].endTime - End time
 * @property {string} [practiceSchedule[].location] - Practice location
 * @property {string} [practiceSchedule[].notes] - Additional notes
 * @property {Object} [stats] - Team statistics
 * @property {number} [stats.wins] - Number of wins
 * @property {number} [stats.losses] - Number of losses
 * @property {number} [stats.ties] - Number of ties
 * @property {number} [stats.pointsScored] - Total points scored
 * @property {number} [stats.pointsAllowed] - Total points allowed
 * @property {number} [stats.streak] - Current win/loss streak
 * @property {number} [stats.ranking] - Current ranking
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} createdAt - When the team was created
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} updatedAt - When the team was last updated
 * @property {string} [createdBy] - ID of the user who created the team
 * @property {string} [updatedBy] - ID of the user who last updated the team
 * @property {string[]} [tags] - Tags for categorization
 * @property {Object.<string, any>} [customFields] - Additional custom fields
 * @property {Object} [metadata] - Additional metadata
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [metadata.lastActivity] - Last activity date
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [metadata.lastGameDate] - Last game date
 * @property {Date|import('@react-native-firebase/firestore').Timestamp} [metadata.nextGameDate] - Next game date
 * @property {number} [metadata.memberCount] - Total member count
 * @property {number} [metadata.activeMemberCount] - Active member count
 * @property {boolean} isPublic - Whether the team is public
 * @property {boolean} joinRequestRequired - Whether join requests are required
 * @property {boolean} autoApproveJoinRequests - Whether join requests are auto-approved
 */

