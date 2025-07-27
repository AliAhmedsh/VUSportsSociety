import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert , ActivityIndicator} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './navigation/types';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button, Card, Divider, List, Menu, Portal, Dialog, TextInput } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';




const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserProfile(userDoc.data() );
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleEditField = (field, value) => {
    setEditField({ key: field, value });
    setTempValue(Array.isArray(value) ? value.join(', ') : value || '');
    setDialogVisible(true);
  };

  const saveProfileChanges = async () => {
    if (!user || !editField) return;
    
    try {
      let valueToSave = tempValue;
      
      // Handle array fields
      if (Array.isArray(editField.value)) {
        valueToSave = tempValue.split(',').map((item) => item.trim()).filter(Boolean);
      }
      
      // Update in Firestore
      await firestore().collection('users').doc(user.uid).update({
        [editField.key]: valueToSave,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        [editField.key]: valueToSave,
      }));
      
      // If display name was updated, update in auth as well
      if (editField.key === 'displayName') {
        await auth().currentUser?.updateProfile({
          displayName: valueToSave,
        });
      }
      
      setDialogVisible(false);
      setEditField(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const renderProfileField = (label, field, value) => {
    if (field === 'uid' || field === 'email' || field === 'createdAt' || field === 'updatedAt') {
      return null; // Skip these fields
    }
    
    let displayValue = value;
    
    if (field === 'createdAt' || field === 'updatedAt') {
      if (!value) return null;
      displayValue = value.toDate().toLocaleString();
    } else if (Array.isArray(value)) {
      displayValue = value.length > 0 ? value.join(', ') : 'Not specified';
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (!value) {
      displayValue = 'Not specified';
    }

    return (
      <List.Item
        key={field}
        title={label}
        description={displayValue}
        onPress={() => editing && handleEditField(field, value)}
        right={props => editing ? (
          <List.Icon {...props} icon="pencil" />
        ) : null}
        style={styles.listItem}
      />
    );
  };

  if (loading || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label={userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                style={styles.avatar}
              />
              {editing && (
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{userProfile.displayName || 'User'}</Text>
              <Text style={styles.email}>{userProfile.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  {userProfile.role === 'coach' && !userProfile.approved && ' (Pending Approval)'}
                </Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderProfileField('Display Name', 'displayName', userProfile.displayName || '')}
            {renderProfileField('Phone', 'phoneNumber', userProfile.phoneNumber || '')}
            {renderProfileField('Bio', 'bio', userProfile.bio || '')}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sports & Interests</Text>
            {renderProfileField('Sports Interests', 'sportsInterests', userProfile.sportsInterests || [])}
            {renderProfileField('Achievements', 'achievements', userProfile.achievements || [])}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <List.Item
              title="Change Password"
              left={props => <List.Icon {...props} icon="lock" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <List.Item
              title="Logout"
              left={props => <List.Icon {...props} icon="logout" color="#f44336" />}
              onPress={handleLogout}
              titleStyle={{ color: '#f44336' }}
              style={styles.listItem}
            />
          </View>
        </Card.Content>
      </Card>
      
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Edit {editField?.key}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={editField?.key}
              value={tempValue}
              onChangeText={setTempValue}
              multiline={editField?.key === 'bio'}
              numberOfLines={editField?.key === 'bio' ? 4 : 1}
            />
            {Array.isArray(editField?.value) && (
              <Text style={styles.hintText}>Separate multiple items with commas</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveProfileChanges}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <FAB
        style={styles.fab}
        icon={editing ? 'check' : 'pencil'}
        onPress={() => setEditing(!editing)}
      />
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
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    backgroundColor: '#1a73e8',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a73e8',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    marginLeft: 8,
  },
  listItem: {
    paddingLeft: 0,
    marginLeft: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a73e8',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;
