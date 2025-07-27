import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
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
  useTheme,
  Snackbar,
  SegmentedButtons,
  Divider,
  Badge,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { Event } from '../../types/Event';
import { format, isAfter, isBefore, isToday } from 'date-fns';

const EventManagementScreen= ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Filter events based on search query and status
  useEffect(() => {
    let result = [...events];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      result = result.filter(event => {
        const startDate = event.startTime?.toDate ? event.startTime.toDate() : new Date(0);
        const endDate = event.endTime?.toDate ? event.endTime.toDate() : new Date(0);
        
        switch (statusFilter) {
          case 'upcoming':
            return isAfter(startDate, now);
          case 'ongoing':
            return isBefore(startDate, now) && isAfter(endDate, now);
          case 'completed':
            return isBefore(endDate, now);
          case 'cancelled':
            return event.status === 'cancelled';
          default:
            return true;
        }
      });
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(event => 
        event.category && selectedCategories.includes(event.category)
      );
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }
    
    setFilteredEvents(result);
  }, [searchQuery, events, statusFilter, selectedCategories]);
  
  // Fetch events from Firestore
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      const snapshot = await firestore()
        .collection('events')
        .orderBy('startTime', 'desc')
        .get();
      
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime,
        endTime: doc.data().endTime,
        registrationDeadline: doc.data().registrationDeadline,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } ));
      
      // Extract unique categories
      const categories = new Set();
      eventsList.forEach(event => {
        if (event.category) {
          categories.add(event.category);
        }
      });
      setAvailableCategories(Array.from(categories).sort());
      
      setEvents(eventsList);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      showSnackbar('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    
    return unsubscribe;
  }, [navigation, fetchEvents]);
  
  // Real-time updates
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('events')
      .orderBy('startTime', 'desc')
      .onSnapshot(snapshot => {
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime,
          endTime: doc.data().endTime,
          registrationDeadline: doc.data().registrationDeadline,
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } ));
        
        setEvents(eventsList);
      }, error => {
        console.error('Error in events listener:', error);
        showSnackbar('Error receiving updates. Please refresh.');
      });
    
    return () => unsubscribe();
  }, []);
  
  // Helper functions
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };
  
  const handleEditEvent = (event) => {
    navigation.navigate('EditEvent', { eventId: event.id });
  };
  
  const handleViewEvent = (event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setActionLoading(true);
      
      // Delete the event document
      await firestore().collection('events').doc(selectedEvent.id).delete();
      
      showSnackbar('Event has been deleted');
      
    } catch (error) {
      console.error('Error deleting event:', error);
      showSnackbar('Failed to delete event. Please try again.');
    } finally {
      setActionLoading(false);
      setDeleteDialogVisible(false);
      setMenuVisible(null);
      setSelectedEvent(null);
    }
  };
  
  const toggleEventStatus = async (event, newStatus) => {
    try {
      setActionLoading(true);
      
      await firestore().collection('events').doc(event.id).update({
        status: newStatus,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      showSnackbar(`Event has been ${newStatus === 'cancelled' ? 'cancelled' : 'reactivated'}`);
      
    } catch (error) {
      console.error('Error updating event status:', error);
      showSnackbar('Failed to update event status. Please try again.');
    } finally {
      setActionLoading(false);
      setMenuVisible(null);
    }
  };
  
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = event.startTime?.toDate ? event.startTime.toDate() : new Date(0);
    const endDate = event.endTime?.toDate ? event.endTime.toDate() : new Date(0);
    
    if (event.status === 'cancelled') return 'cancelled';
    if (isBefore(endDate, now)) return 'completed';
    if (isBefore(startDate, now) && isAfter(endDate, now)) return 'ongoing';
    return 'upcoming';
  };
  
  const renderEventCard = (event) => {
    const status = getEventStatus(event);
    const startDate = event.startTime?.toDate ? event.startTime.toDate() : new Date(0);
    const endDate = event.endTime?.toDate ? event.endTime.toDate() : new Date(0);
    const isTodayEvent = isToday(startDate);
    
    return (
      <Card key={event.id} style={styles.eventCard} onPress={() => handleViewEvent(event)}>
        <View style={styles.eventCardContent}>
          {event.imageUrl ? (
            <Image 
              source={{ uri: event.imageUrl }} 
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.eventImage, styles.eventImagePlaceholder]}>
              <MaterialCommunityIcons name="calendar-star" size={40} color="#666" />
            </View>
          )}
          
          <View style={styles.eventDetails}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Chip 
                mode="outlined" 
                style={[
                  styles.statusChip,
                  status === 'upcoming' && styles.statusUpcoming,
                  status === 'ongoing' && styles.statusOngoing,
                  status === 'completed' && styles.statusCompleted,
                  status === 'cancelled' && styles.statusCancelled,
                ]}
                textStyle={styles.statusChipText}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            </View>
            
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={16} 
                  color="#666" 
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>
                  {format(startDate, 'MMM d, yyyy')}
                </Text>
                {isTodayEvent && (
                  <Badge size={6} style={styles.todayBadge} />
                )}
              </View>
              
              <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={16} 
                  color="#666" 
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </Text>
              </View>
              
              {event.location && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={16} 
                    color="#666" 
                    style={styles.metaIcon}
                  />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
              )}
              
              {event.category && (
                <Chip 
                  mode="outlined" 
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                >
                  {event.category}
                </Chip>
              )}
            </View>
            
            <View style={styles.eventFooter}>
              <View style={styles.participantsInfo}>
                <MaterialCommunityIcons 
                  name="account-group" 
                  size={16} 
                  color="#666" 
                />
                <Text style={styles.participantsText}>
                  {event.participants?.length || 0} / {event.maxParticipants || '∞'}
                </Text>
              </View>
              
              <Menu
                visible={menuVisible === event.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => setMenuVisible(event.id)}
                    disabled={actionLoading}
                  />
                }
                contentStyle={styles.menuContent}
              >
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(null);
                    handleViewEvent(event);
                  }} 
                  title="View Details"
                  leadingIcon="eye"
                />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(null);
                    handleEditEvent(event);
                  }} 
                  title="Edit Event"
                  leadingIcon="pencil"
                />
                {status !== 'cancelled' ? (
                  <Menu.Item 
                    onPress={() => {
                      setMenuVisible(null);
                      toggleEventStatus(event, 'cancelled');
                    }} 
                    title="Cancel Event"
                    leadingIcon="cancel"
                    titleStyle={{ color: theme.colors.error }}
                  />
                ) : (
                  <Menu.Item 
                    onPress={() => {
                      setMenuVisible(null);
                      toggleEventStatus(event, 'active');
                    }} 
                    title="Reactivate Event"
                    leadingIcon="restart"
                  />
                )}
                <Divider />
                <Menu.Item 
                  onPress={() => {
                    setSelectedEvent(event);
                    setDeleteDialogVisible(true);
                  }} 
                  title="Delete Event"
                  leadingIcon="delete"
                  titleStyle={{ color: theme.colors.error }}
                />
              </Menu>
            </View>
          </View>
        </View>
      </Card>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Event Management</Title>
        <Searchbar
          placeholder="Search events..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          placeholderTextColor="#666"
          iconColor="#666"
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilterContainer}
        >
          <SegmentedButtons
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            style={styles.segmentedButtons}
          />
        </ScrollView>
        
        {availableCategories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesList}>
              {availableCategories.map(category => (
                <Chip
                  key={category}
                  mode={selectedCategories.includes(category) ? 'flat' : 'outlined'}
                  onPress={() => toggleCategory(category)}
                  style={[
                    styles.categoryFilterChip,
                    selectedCategories.includes(category) && styles.categoryFilterChipSelected
                  ]}
                  textStyle={styles.categoryFilterChipText}
                >
                  {category}
                </Chip>
              ))}
              {selectedCategories.length > 0 && (
                <Button 
                  mode="text" 
                  onPress={() => setSelectedCategories([])}
                  style={styles.clearCategoriesButton}
                  labelStyle={styles.clearCategoriesButtonText}
                >
                  Clear
                </Button>
              )}
            </View>
          </View>
        )}
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
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="calendar-remove" 
                size={64} 
                color="#ccc" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedCategories.length > 0 || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search term'
                  : 'No events have been created yet'}
              </Text>
              {(searchQuery || selectedCategories.length > 0 || statusFilter !== 'all') && (
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSelectedCategories([]);
                  }}
                  style={styles.clearButton}
                >
                  Clear Filters
                </Button>
              )}
            </View>
          ) : (
            <View style={styles.eventList}>
              {filteredEvents.map(event => renderEventCard(event))}
              <View style={styles.footerSpacer} />
            </View>
          )}
        </View>
      </ScrollView>
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('CreateEvent')}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
        icon="plus"
      >
        Create Event
      </Button>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => !actionLoading && setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Delete Event</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this event? This action cannot be undone.</Text>
            {selectedEvent?.participants && selectedEvent.participants.length > 0 && (
              <HelperText type="error" style={styles.warningText}>
                {selectedEvent.participants.length} participants will be notified of the cancellation.
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDeleteDialogVisible(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleDeleteEvent}
              loading={actionLoading}
              disabled={actionLoading}
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
  statusFilterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  segmentedButtons: {
    height: 36,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  categoryFilterChip: {
    margin: 4,
    height: 32,
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  categoryFilterChipSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  categoryFilterChipText: {
    fontSize: 12,
  },
  clearCategoriesButton: {
    height: 32,
    margin: 4,
    justifyContent: 'center',
  },
  clearCategoriesButtonText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  eventList: {
    flex: 1,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  eventCardContent: {
    flexDirection: 'row',
  },
  eventImage: {
    width: 120,
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  eventImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  eventDetails: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusChip: {
    height: 24,
    marginLeft: 'auto',
  },
  statusUpcoming: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  statusOngoing: {
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
  statusCompleted: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
  },
  statusChipText: {
    fontSize: 10,
    lineHeight: 16,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#424242',
    flex: 1,
  },
  todayBadge: {
    backgroundColor: '#f44336',
    marginLeft: 8,
  },
  categoryChip: {
    height: 24,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  categoryChipText: {
    fontSize: 11,
    lineHeight: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 'auto',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
  warningText: {
    marginTop: 8,
    color: '#f44336',
  },
});

export default EventManagementScreen;
