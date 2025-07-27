import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Title, 
  Subheading, 
  Card, 
  Button, 
  IconButton, 
  ActivityIndicator,
  useTheme,
  Searchbar,
  Avatar,
  Chip,
  Divider,
  Menu,
  HelperText,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { User } from '../../types/User';
import { format } from 'date-fns';

type AdminDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  activeEvents: number;
  totalTeams: number;
}

const AdminDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    activeEvents: 0,
    totalTeams: 0,
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const usersSnapshot = await firestore().collection('users').get();
      const pendingUsersList = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as User))
        .filter(user => !user.approved);
      
      const eventsSnapshot = await firestore()
        .collection('events')
        .where('status', '==', 'upcoming')
        .get();
      
      const teamsSnapshot = await firestore().collection('teams').get();
      
      // Get recent activity (last 5 user signups)
      const recentSignups = usersSnapshot.docs
        .sort((a, b) => b.data().createdAt?.toDate() - a.data().createdAt?.toDate())
        .slice(0, 5)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'user_signup',
          timestamp: doc.data().createdAt?.toDate(),
        }));
      
      setStats({
        totalUsers: usersSnapshot.size,
        pendingApprovals: pendingUsersList.length,
        activeEvents: eventsSnapshot.size,
        totalTeams: teamsSnapshot.size,
      });
      
      setPendingUsers(pendingUsersList);
      setRecentActivity(recentSignups);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up real-time listeners
    const usersUnsubscribe = firestore()
      .collection('users')
      .where('approved', '==', false)
      .onSnapshot(snapshot => {
        const updatedPendingUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as User));
        setPendingUsers(updatedPendingUsers);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pendingApprovals: updatedPendingUsers.length,
        }));
      });
    
    // Clean up listeners
    return () => {
      usersUnsubscribe();
    };
  }, []);
  
  const handleApproveUser = async (userId: string) => {
    try {
      await firestore().collection('users').doc(userId).update({
        approved: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
      // Show success message
      // You can replace this with a toast notification
      console.log('User approved successfully');
      
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };
  
  const handleRejectUser = async (userId: string) => {
    try {
      // You might want to implement a proper rejection flow
      // For now, we'll just delete the user
      await firestore().collection('users').doc(userId).delete();
      
      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
      console.log('User rejected and removed');
      
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };
  
  const renderUserCard = (user: User) => {
    const initials = user.displayName
      ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
    
    return (
      <Card key={user.id} style={styles.userCard}>
        <Card.Content style={styles.userCardContent}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={48} 
              label={initials} 
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.displayName || 'No Name'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
              <View style={styles.userMeta}>
                <Chip 
                  icon="account" 
                  style={styles.roleChip}
                  textStyle={styles.chipText}
                >
                  {user.role || 'participant'}
                </Chip>
                {user.createdAt && (
                  <Text style={styles.timestamp}>
                    Joined {format(user.createdAt, 'MMM d, yyyy')}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.actions}>
            <Menu
              visible={menuVisible === user.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(user.id)}
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(null);
                  handleApproveUser(user.id);
                }} 
                title="Approve"
                leadingIcon="check"
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(null);
                  handleRejectUser(user.id);
                }} 
                title="Reject"
                leadingIcon="close"
                titleStyle={{ color: theme.colors.error }}
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(null);
                  // Navigate to user details
                }} 
                title="View Details"
                leadingIcon="account-details"
              />
            </Menu>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  const renderActivityItem = (activity: any) => {
    return (
      <View key={activity.id} style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Avatar.Icon 
            size={36} 
            icon="account-plus" 
            style={styles.activityAvatar}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            New {activity.role || 'user'} signed up
          </Text>
          <Text style={styles.activitySubtitle}>
            {activity.displayName || 'New User'}
          </Text>
        </View>
        <Text style={styles.activityTime}>
          {activity.timestamp ? format(activity.timestamp, 'h:mm a') : ''}
        </Text>
      </View>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }} 
        />
      }
    >
      <View style={styles.header}>
        <Title>Admin Dashboard</Title>
        <Subheading>Welcome back, {user?.displayName || 'Admin'}</Subheading>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, styles.pendingCard]}>
          <Card.Content>
            <Text style={[styles.statValue, styles.pendingValue]}>
              {stats.pendingApprovals}
            </Text>
            <Text style={[styles.statLabel, styles.pendingLabel]}>
              Pending Approvals
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{stats.activeEvents}</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{stats.totalTeams}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </Card.Content>
        </Card>
      </View>
      
      {/* Pending Approvals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Pending Approvals</Title>
          <Button 
            mode="text" 
            onPress={() => {}}
            icon="arrow-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            View All
          </Button>
        </View>
        
        {pendingUsers.length === 0 ? (
          <Card style={styles.emptyState}>
            <Card.Content style={styles.emptyStateContent}>
              <IconButton
                icon="check-circle"
                size={48}
                color={theme.colors.primary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No pending approvals</Text>
              <Text style={styles.emptySubtext}>
                All users have been approved
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pendingUsersContainer}
          >
            {pendingUsers.map(user => renderUserCard(user))}
          </ScrollView>
        )}
      </View>
      
      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Recent Activity</Title>
          <Button 
            mode="text" 
            onPress={() => {}}
            icon="arrow-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            View All
          </Button>
        </View>
        
        <Card style={styles.activityCard}>
          <Card.Content>
            {recentActivity.length > 0 ? (
              <>
                {recentActivity.map(activity => renderActivityItem(activity))}
                <Divider style={styles.divider} />
                <Button 
                  mode="text" 
                  onPress={() => {}}
                  style={styles.viewAllButton}
                >
                  View All Activity
                </Button>
              </>
            ) : (
              <View style={styles.emptyActivity}>
                <IconButton
                  icon="history"
                  size={48}
                  color={theme.colors.primary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No recent activity</Text>
                <Text style={styles.emptySubtext}>
                  Activity will appear here
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
      
      {/* Quick Actions */}
      <View style={[styles.section, { marginBottom: 32 }]}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.actionsGrid}>
          <Button 
            mode="contained" 
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="account-plus"
          >
            Add User
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="calendar-plus"
          >
            Create Event
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="account-group"
          >
            Manage Teams
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="cog"
          >
            Settings
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    margin: 8,
    elevation: 2,
    borderRadius: 8,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  pendingValue: {
    color: '#ff9800',
  },
  statLabel: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pendingLabel: {
    color: '#ff9800',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 1,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    margin: 0,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  pendingUsersContainer: {
    paddingVertical: 8,
  },
  userCard: {
    width: 280,
    marginRight: 12,
    borderRadius: 8,
    elevation: 1,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#e3f2fd',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  roleChip: {
    height: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 10,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
  actions: {
    marginLeft: 8,
  },
  activityCard: {
    borderRadius: 8,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityAvatar: {
    backgroundColor: '#e3f2fd',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 8,
  },
  viewAllButton: {
    marginTop: 8,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 160,
    margin: 8,
    borderRadius: 8,
    height: 100,
    justifyContent: 'center',
  },
  actionButtonContent: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminDashboard;
