import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Title, 
  Searchbar, 
  Card, 
  Button, 
  IconButton, 
  Menu, 
  Chip, 
  Avatar, 
  ActivityIndicator,
  Dialog,
  Portal,
  TextInput,
  HelperText,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { User } from '../../types/User';
import { format } from 'date-fns';

type UserManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserManagement'>;
type UserManagementScreenRouteProp = RouteProp<RootStackParamList, 'UserManagement'>;

interface UserManagementScreenProps {
  navigation: UserManagementScreenNavigationProp;
  route: UserManagementScreenRouteProp;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(u => 
        (u.displayName?.toLowerCase().includes(query)) ||
        (u.email?.toLowerCase().includes(query)) ||
        (u.role?.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);
  
  // Fetch users from Firestore
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const snapshot = await firestore()
        .collection('users')
        .orderBy('createdAt', 'desc')
        .get();
      
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as User));
      
      setUsers(usersList);
      setFilteredUsers(usersList);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUsers();
    });
    
    return unsubscribe;
  }, [navigation, fetchUsers]);
  
  // Real-time updates
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as User));
        
        setUsers(usersList);
      }, error => {
        console.error('Error in users listener:', error);
        showSnackbar('Error receiving updates. Please refresh.');
      });
    
    return () => unsubscribe();
  }, []);
  
  // Helper functions
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };
  
  const handleEditUser = (user: User) => {
    // Navigate to edit user screen
    navigation.navigate('EditUser', { userId: user.id });
  };
  
  const handleViewProfile = (user: User) => {
    // Navigate to user profile
    navigation.navigate('UserProfile', { userId: user.id });
  };
  
  const handleToggleApproval = async (user: User) => {
    try {
      setActionLoading(true);
      
      await firestore().collection('users').doc(user.id).update({
        approved: !user.approved,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      showSnackbar(
        user.approved 
          ? 'User has been deactivated' 
          : 'User has been approved'
      );
      
    } catch (error) {
      console.error('Error toggling user approval:', error);
      showSnackbar('Failed to update user. Please try again.');
    } finally {
      setActionLoading(false);
      setMenuVisible(null);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      
      // Don't allow deleting the current user
      if (selectedUser.id === currentUser?.uid) {
        showSnackbar('You cannot delete your own account');
        return;
      }
      
      // Delete the user document
      await firestore().collection('users').doc(selectedUser.id).delete();
      
      showSnackbar('User has been deleted');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(false);
      setDialogVisible(false);
      setMenuVisible(null);
      setSelectedUser(null);
    }
  };
  
  const handleResetPassword = async (user: User) => {
    try {
      setActionLoading(true);
      
      // In a real app, you would send a password reset email
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSnackbar(`Password reset email sent to ${user.email}`);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      showSnackbar('Failed to send reset email. Please try again.');
    } finally {
      setActionLoading(false);
      setMenuVisible(null);
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
              style={[
                styles.avatar,
                !user.approved && styles.pendingAvatar,
              ]}
            />
            <View style={styles.userDetails}>
              <View style={styles.userHeader}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.displayName || 'No Name'}
                </Text>
                {!user.approved && (
                  <Chip 
                    mode="outlined" 
                    style={styles.pendingChip}
                    textStyle={styles.pendingChipText}
                  >
                    Pending
                  </Chip>
                )}
              </View>
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
          
          <Menu
            visible={menuVisible === user.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => setMenuVisible(user.id)}
                disabled={actionLoading}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleViewProfile(user);
              }} 
              title="View Profile"
              leadingIcon="account"
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleEditUser(user);
              }} 
              title="Edit User"
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleToggleApproval(user);
              }} 
              title={user.approved ? 'Deactivate' : 'Approve'}
              leadingIcon={user.approved ? 'account-remove' : 'account-check'}
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleResetPassword(user);
              }} 
              title="Reset Password"
              leadingIcon="lock-reset"
            />
            <Menu.Item 
              onPress={() => {
                setSelectedUser(user);
                setDialogVisible(true);
              }} 
              title="Delete User"
              leadingIcon="delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </Card.Content>
      </Card>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>User Management</Title>
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          placeholderTextColor="#666"
          iconColor="#666"
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statValue}>{users.length}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </Card.Content>
            </Card>
            
            <Card style={[styles.statCard, styles.pendingCard]}>
              <Card.Content>
                <Text style={[styles.statValue, styles.pendingValue]}>
                  {users.filter(u => !u.approved).length}
                </Text>
                <Text style={[styles.statLabel, styles.pendingLabel]}>
                  Pending Approval
                </Text>
              </Card.Content>
            </Card>
          </View>
          
          <View style={styles.userList}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <IconButton
                  icon="account-search"
                  size={48}
                  color={theme.colors.primary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try a different search term' : 'No users in the system'}
                </Text>
                {searchQuery && (
                  <Button 
                    mode="outlined" 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    Clear Search
                  </Button>
                )}
              </View>
            ) : (
              <>
                {filteredUsers.map(user => renderUserCard(user))}
                <View style={styles.footerSpacer} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('AddUser')}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
        icon="plus"
      >
        Add New User
      </Button>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => !actionLoading && setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Delete User</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this user? This action cannot be undone.</Text>
            {selectedUser?.id === currentUser?.uid && (
              <HelperText type="error" style={styles.errorText}>
                You cannot delete your own account
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDialogVisible(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleDeleteUser}
              loading={actionLoading}
              disabled={actionLoading || selectedUser?.id === currentUser?.uid}
              color={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    marginTop: 8,
    elevation: 1,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    minHeight: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 1,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  statValue: {
    fontSize: 20,
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
  userList: {
    flex: 1,
  },
  userCard: {
    marginBottom: 12,
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
  pendingAvatar: {
    backgroundColor: '#fff3e0',
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
    flexShrink: 1,
  },
  pendingChip: {
    height: 20,
    backgroundColor: '#fff3e0',
    borderColor: '#ffb74d',
  },
  pendingChipText: {
    fontSize: 10,
    color: '#e65100',
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
  menuContent: {
    backgroundColor: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    margin: 0,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    marginTop: 8,
  },
  footerSpacer: {
    height: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 28,
    elevation: 4,
  },
  addButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  errorText: {
    marginTop: 8,
  },
});

export default UserManagementScreen;
