import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Divider, List, IconButton } from 'react-native-paper';
import TopBar from '../../components/TopBar/TopBar';

type TeamDetailsRouteProp = RouteProp<RootStackParamList, 'TeamDetails'>;
type TeamDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TeamDetails',
>;

type TeamMember = {
  uid: string,
  displayName: string,
  email: string,
  role?: 'member' | 'captain' | 'coach',
  avatarUrl?: string,
};

type TeamDetails = {
  id: string,
  name: string,
  sport: string,
  description: string,
  members: TeamMember[],
  maxMembers: number,
  createdBy: string,
  createdAt: any,
  logoUrl?: string,
  upcomingMatches?: Array<{
    id: string,
    opponent: string,
    date: any,
    location: string,
  }>,
  isMember?: boolean,
  userRole?: 'member' | 'captain' | 'coach',
};

const TeamDetailsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <TopBar text={'My Teams'} />
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
