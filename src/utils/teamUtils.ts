import { Team } from '../types';

export const filterTeams = (
  teams: Team[], 
  filter: 'all' | 'my' | 'sport', 
  searchQuery: string,
  selectedSport: string,
  myTeams: Team[]
): Team[] => {
  let filtered = [...teams];

  // Apply filter
  if (filter === 'my') {
    filtered = [...myTeams];
  } else if (filter === 'sport' && selectedSport) {
    filtered = filtered.filter(team => team.sport === selectedSport);
  }

  // Apply search
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      team =>
        team.name.toLowerCase().includes(query) ||
        team.sport.toLowerCase().includes(query) ||
        (team.description && team.description.toLowerCase().includes(query))
    );
  }

  return filtered;
};

export const getTeamInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getMemberCountText = (members: string[] = [], maxMembers: number): string => {
  return `${members?.length || 0}/${maxMembers} members`;
};
