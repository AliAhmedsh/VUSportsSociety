import { useState, useEffect, useCallback, useMemo } from 'react';
import { Team } from '../types';
import firestore from '@react-native-firebase/firestore';

export const useTeams = (userId: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sports, setSports] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await firestore()
        .collection('teams')
        .orderBy('createdAt', 'desc')
        .get();

      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];

      setTeams(teamsData);
      
      // Extract unique sports
      const uniqueSports = Array.from(new Set(teamsData.map(team => team.sport)));
      setSports(uniqueSports);
      
      // Filter user's teams
      if (userId) {
        const userTeams = teamsData.filter(team => 
          team.members?.includes(userId)
        );
        setMyTeams(userTeams);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeams();
  }, [fetchTeams]);

  const handleJoinTeam = useCallback(async (teamId: string) => {
    if (!userId) return { success: false, message: 'User not authenticated' };
    
    try {
      const teamRef = firestore().collection('teams').doc(teamId);
      const teamDoc = await teamRef.get();
      
      if (!teamDoc.exists) {
        return { success: false, message: 'Team not found' };
      }
      
      const team = teamDoc.data() as Team;
      const isMember = team.members?.includes(userId) || false;
      
      if (isMember) {
        // Leave team
        await teamRef.update({
          members: firestore.FieldValue.arrayRemove(userId),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: 'Left team successfully', action: 'leave' };
      } else {
        // Join team
        if (team.members?.length >= team.maxMembers) {
          return { success: false, message: 'Team is full' };
        }
        
        await teamRef.update({
          members: firestore.FieldValue.arrayUnion(userId),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: 'Joined team successfully', action: 'join' };
      }
    } catch (err) {
      console.error('Error updating team membership:', err);
      return { success: false, message: 'Failed to update team membership' };
    }
  }, [userId]);

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('teams')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const updatedTeams = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Team[];
          
          setTeams(updatedTeams);
          
          if (userId) {
            const userTeams = updatedTeams.filter(team => 
              team.members?.includes(userId)
            );
            setMyTeams(userTeams);
          }
          
          // Update sports list
          const uniqueSports = Array.from(new Set(updatedTeams.map(team => team.sport)));
          setSports(uniqueSports);
        },
        (err) => {
          console.error('Error in teams subscription:', err);
          setError('Failed to sync teams data');
        }
      );

    return () => unsubscribe();
  }, [userId]);

  return {
    teams,
    myTeams,
    loading,
    refreshing,
    sports,
    error,
    fetchTeams,
    handleRefresh,
    handleJoinTeam,
  };
};
