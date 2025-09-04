import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Divider, List, IconButton } from 'react-native-paper';

type TeamDetailsRouteProp = RouteProp<RootStackParamList, 'TeamDetails'>;
type TeamDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'TeamDetails'>;

type TeamMember = {
  uid: string;
  displayName: string;
  email: string;
  role?: 'member' | 'captain' | 'coach';
  avatarUrl?: string;
};

type TeamDetails = {
  id: string;
  name: string;
  sport: string;
  description: string;
  members: TeamMember[];
  maxMembers: number;
  createdBy: string;
  createdAt: any;
  logoUrl?: string;
  upcomingMatches?: Array<{
    id: string;
    opponent: string;
    date: any;
    location: string;
  }>;
  isMember?: boolean;
  userRole?: 'member' | 'captain' | 'coach';
};

const TeamDetailsScreen = () => {
  const route = useRoute<TeamDetailsRouteProp>();
  const navigation = useNavigation<TeamDetailsNavigationProp>();
  const { teamId } = route.params;
  const { user } = useAuth();
  
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId || !user) return;
      
      try {
        setLoading(true);
        
        // Get team data
        const teamDoc = await firestore().collection('teams').doc(teamId).get();
        
        if (!teamDoc.exists) {
          Alert.alert('Error', 'Team not found');
          navigation.goBack();
          return;
        }
        
        const teamData = teamDoc.data();
        
        // Get member details
        const memberPromises = teamData.members.map(async (memberId: string) => {
          const userDoc = await firestore().collection('users').doc(memberId).get();
          return {
            uid: memberId,
            displayName: userDoc.data()?.displayName || 'Unknown User',
            email: userDoc.data()?.email || '',
            role: memberId === teamData.createdBy ? 'captain' : 'member',
            avatarUrl: userDoc.data()?.photoURL,
          };
        });
        
        const members = await Promise.all(memberPromises);
        
        // Check if current user is a member and their role
        const currentUserMember = members.find(m => m.uid === user.uid);
        
        setTeam({
          id: teamDoc.id,
          ...teamData,
          members,
          isMember: !!currentUserMember,
          userRole: currentUserMember?.role,
        } as TeamDetails);
        
      } catch (error) {
        console.error('Error fetching team details:', error);
        Alert.alert('Error', 'Failed to load team details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamDetails();
    
    // Subscribe to real-time updates
    const unsubscribe = firestore()
      .collection('teams')
      .doc(teamId)
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const teamData = doc.data();
          // Update team data without refetching members to avoid flicker
          setTeam(prev => ({
            ...prev!,
            ...teamData,
            id: doc.id,
          }));
        }
      });
    
    return () => unsubscribe();
  }, [teamId, user]);
  
  const handleJoinTeam = async () => {
    if (!user || !team) return;
    
    try {
      setJoining(true);
      
      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        Alert.alert('Team Full', 'This team has reached its maximum capacity');
        return;
      }
      
      // Add user to team
      await firestore().collection('teams').doc(teamId).update({
        members: firestore.FieldValue.arrayUnion(user.uid)
      });
      
      // Update local state
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const newMember = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'New Member',
        email: user.email || '',
        role: 'member',
      };
      
      setTeam(prev => ({
        ...prev!,
        members: [...prev!.members, newMember],
        isMember: true,
        userRole: 'member',
      }));
      
      Alert.alert('Success', 'You have joined the team!');
      
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };
  
  const handleLeaveTeam = async () => {
    if (!user || !team) return;
    
    Alert.alert(
      'Leave Team',
      'Are you sure you want to leave this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLeaving(true);
              
              // Remove user from team
              await firestore().collection('teams').doc(teamId).update({
                members: firestore.FieldValue.arrayRemove(user.uid)
              });
              
              // Update local state
              setTeam(prev => ({
                ...prev!,
                members: prev!.members.filter(m => m.uid !== user.uid),
                isMember: false,
                userRole: undefined,
              }));
              
              Alert.alert('Success', 'You have left the team');
              
            } catch (error) {
              console.error('Error leaving team:', error);
              Alert.alert('Error', 'Failed to leave team');
            } finally {
              setLeaving(false);
            }
          } 
        },
      ]
    );
  };
  
  const renderMemberItem = ({ item }: { item: TeamMember }) => (
    <List.Item
      title={item.displayName}
      description={item.email}
      left={props => (
        <Avatar.Text 
          size={50} 
          label={item.displayName.charAt(0).toUpperCase()} 
          style={styles.avatar}
        />
      )}
      right={props => (
        <View style={styles.memberRoleContainer}>
          <Text style={[
            styles.memberRole,
            item.role === 'captain' && styles.captainRole,
            item.role === 'coach' && styles.coachRole
          ]}>
            {item.role?.toUpperCase()}
          </Text>
        </View>
      )}
      style={styles.memberItem}
    />
  );
  
  const renderUpcomingMatch = (match: any) => (
    <View key={match.id} style={styles.matchCard}>
      <View style={styles.matchTeams}>
        <Text style={styles.teamName}>{team?.name}</Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.teamName}>{match.opponent}</Text>
      </View>
      <View style={styles.matchDetails}>
        <Text style={styles.matchDetail}>
          {match.date?.toDate().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={styles.matchDetail}>📍 {match.location}</Text>
      </View>
    </View>
  );

  if (loading || !team) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      {/* Team Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {team.logoUrl ? (
            <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} />
          ) : (
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamLogoText}>{team.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamSport}>{team.sport}</Text>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {team.isMember ? (
            <>
              <Button 
                mode="contained" 
                onPress={() => {}}
                style={[styles.actionButton, styles.chatButton]}
                labelStyle={styles.chatButtonLabel}
                icon="chat"
              >
                Team Chat
              </Button>
              <Button 
                mode="outlined" 
                onPress={handleLeaveTeam}
                loading={leaving}
                disabled={leaving}
                style={[styles.actionButton, styles.leaveButton]}
                labelStyle={styles.leaveButtonLabel}
                icon="exit-to-app"
              >
                Leave Team
              </Button>
            </>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleJoinTeam}
              loading={joining}
              disabled={joining || team.members.length >= team.maxMembers}
              style={styles.joinButton}
            >
              {team.members.length >= team.maxMembers ? 'Team Full' : 'Join Team'}
            </Button>
          )}
        </View>
      </View>
      
      {/* Team Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.teamDescription}>{team.description || 'No description provided.'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.maxMembers}</Text>
            <Text style={styles.statLabel}>Max Size</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {team.upcomingMatches?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
      </View>
      
      {/* Upcoming Matches */}
      {team.upcomingMatches && team.upcomingMatches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {team.upcomingMatches.slice(0, 2).map(renderUpcomingMatch)}
        </View>
      )}
      
      {/* Team Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <Text style={styles.membersCount}>{team.members.length} members</Text>
        </View>
        
        <FlatList
          data={team.members}
          renderItem={renderMemberItem}
          keyExtractor={item => item.uid}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No members yet</Text>
          }
        />
      </View>
      
      {/* Admin Actions */}
      {(team.userRole === 'captain' || team.userRole === 'coach') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Management</Text>
          <Card style={styles.managementCard}>
            <Card.Content>
              <List.Item
                title="Edit Team Info"
                left={props => <List.Icon {...props} icon="pencil" color="#1a73e8" />}
                onPress={() => {}}
                style={styles.managementItem}
              />
              <Divider />
              <List.Item
                title="Manage Members"
                left={props => <List.Icon {...props} icon="account-group" color="#1a73e8" />}
                onPress={() => {}}
                style={styles.managementItem}
              />
              <Divider />
              <List.Item
                title="Schedule Match"
                left={props => <List.Icon {...props} icon="calendar-plus" color="#1a73e8" />}
                onPress={() => {}}
                style={styles.managementItem}
              />
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    marginBottom: 15,
  },
  teamLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1a73e8',
  },
  teamLogoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a73e8',
  },
  teamLogoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  teamSport: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    marginHorizontal: 5,
    borderRadius: 8,
  },
  joinButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#1a73e8',
    width: '80%',
  },
  chatButton: {
    backgroundColor: '#1a73e8',
  },
  chatButtonLabel: {
    color: '#fff',
  },
  leaveButton: {
    borderColor: '#f44336',
  },
  leaveButtonLabel: {
    color: '#f44336',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    color: '#1a73e8',
    fontSize: 14,
  },
  teamDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f5f9ff',
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1a73e8',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  vsText: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 10,
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  matchDetails: {
    marginTop: 5,
  },
  matchDetail: {
    fontSize: 13,
    color: '#555',
    marginVertical: 2,
  },
  membersCount: {
    fontSize: 14,
    color: '#666',
  },
  memberItem: {
    paddingLeft: 0,
    paddingVertical: 12,
  },
  avatar: {
    backgroundColor: '#e3f2fd',
    marginRight: 15,
  },
  memberRoleContainer: {
    justifyContent: 'center',
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  captainRole: {
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    fontWeight: '600',
  },
  coachRole: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  managementCard: {
    marginTop: 10,
    elevation: 1,
  },
  managementItem: {
    paddingVertical: 10,
  },
});

export default TeamDetailsScreen;
