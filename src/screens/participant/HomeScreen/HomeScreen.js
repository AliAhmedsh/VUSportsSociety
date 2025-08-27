import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../../context/AuthContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const upcomingEvents = [
    {
      id: '1',
      title: 'Football Tournament',
      date: '2023-08-15',
      type: 'tournament',
    },
    {
      id: '2',
      title: 'Basketball Practice',
      date: '2023-08-16',
      type: 'practice',
    },
    { id: '3', title: 'Cricket Match', date: '2023-08-18', type: 'match' },
  ];

  const quickActions = [
    { id: '1', title: 'Join Event', icon: 'calendar', screen: 'Events' },
    { id: '2', title: 'My Teams', icon: 'people', screen: 'Teams' },
    { id: '3', title: 'My Profile', icon: 'person', screen: 'Profile' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate('Main', { screen: action.screen })
              }
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>
                  {action.icon === 'calendar'
                    ? '📅'
                    : action.icon === 'people'
                    ? '👥'
                    : '👤'}
                </Text>
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'Events' })}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.slice(0, 2).map(event => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDateDay}>
                {new Date(event.date).getDate()}
              </Text>
              <Text style={styles.eventDateMonth}>
                {new Date(event.date).toLocaleString('default', {
                  month: 'short',
                })}
              </Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventType}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Announcements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Announcements</Text>
        <View style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>Registration Open</Text>
          <Text style={styles.announcementText}>
            Registration for the annual sports gala is now open. Register your
            team before August 20th!
          </Text>
          <Text style={styles.announcementDate}>2 days ago</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    color: '#333',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    color: '#1a73e8',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDate: {
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
    minWidth: 70,
  },
  eventDateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  eventDateMonth: {
    fontSize: 12,
    color: '#1a73e8',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  eventType: {
    fontSize: 14,
    color: '#666',
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  announcementText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  announcementDate: {
    fontSize: 12,
    color: '#888',
  },
});

export default HomeScreen;
