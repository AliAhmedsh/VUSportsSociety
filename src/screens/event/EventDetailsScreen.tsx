import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Divider, Chip, IconButton, Badge } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { format, parseISO } from 'date-fns';

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;
type EventDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetails'>;

type Participant = {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: any;
};

type EventDetails = {
  id: string;
  title: string;
  description: string;
  date: any;
  endDate?: any;
  location: string;
  locationDetails?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type: 'tournament' | 'friendly' | 'training' | 'workshop' | 'other';
  category: 'sports' | 'fitness' | 'recreational' | 'educational';
  maxParticipants: number;
  participants: Participant[];
  createdBy: string;
  createdAt: any;
  updatedAt?: any;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationDeadline?: any;
  imageUrl?: string;
  requirements?: string[];
  rules?: string[];
  prizes?: string[];
  isRegistered?: boolean;
  userStatus?: Participant['status'];
};

const EventDetailsScreen = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const { eventId } = route.params;
  const { user } = useAuth();
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId || !user) return;
      
      try {
        setLoading(true);
        
        // Get event data
        const eventDoc = await firestore().collection('events').doc(eventId).get();
        
        if (!eventDoc.exists) {
          Alert.alert('Error', 'Event not found');
          navigation.goBack();
          return;
        }
        
        const eventData = eventDoc.data();
        
        // Get participant details
        const participants = eventData.participants || [];
        const participantDetails = await Promise.all(
          participants.map(async (p: any) => {
            const userDoc = await firestore().collection('users').doc(p.uid).get();
            return {
              ...p,
              displayName: userDoc.data()?.displayName || 'Unknown User',
              email: userDoc.data()?.email || '',
              avatarUrl: userDoc.data()?.photoURL,
            };
          })
        );
        
        // Check if current user is registered and their status
        const currentUserParticipant = participantDetails.find(p => p.uid === user.uid);
        
        setEvent({
          id: eventDoc.id,
          ...eventData,
          participants: participantDetails,
          isRegistered: !!currentUserParticipant,
          userStatus: currentUserParticipant?.status,
        } as EventDetails);
        
      } catch (error) {
        console.error('Error fetching event details:', error);
        Alert.alert('Error', 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
    
    // Subscribe to real-time updates
    const unsubscribe = firestore()
      .collection('events')
      .doc(eventId)
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const eventData = doc.data();
          // Update event data without refetching participants to avoid flicker
          setEvent(prev => ({
            ...prev!,
            ...eventData,
            id: doc.id,
          }));
        }
      });
    
    return () => unsubscribe();
  }, [eventId, user]);
  
  const handleRegister = async () => {
    if (!user || !event) return;
    
    try {
      setRegistering(true);
      
      // Check if registration deadline has passed
      if (event.registrationDeadline && new Date() > event.registrationDeadline.toDate()) {
        Alert.alert('Registration Closed', 'The registration deadline for this event has passed.');
        return;
      }
      
      // Check if event is full
      if (event.participants.length >= event.maxParticipants) {
        Alert.alert('Event Full', 'This event has reached its maximum capacity.');
        return;
      }
      
      // Add user to event participants
      const participantData = {
        uid: user.uid,
        status: 'registered',
        registeredAt: firestore.FieldValue.serverTimestamp(),
      };
      
      await firestore().collection('events').doc(eventId).update({
        participants: firestore.FieldValue.arrayUnion(participantData)
      });
      
      // Update local state
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const newParticipant = {
        ...participantData,
        displayName: user.displayName || user.email?.split('@')[0] || 'New Participant',
        email: user.email || '',
        avatarUrl: user.photoURL,
      };
      
      setEvent(prev => ({
        ...prev!,
        participants: [...prev!.participants, newParticipant],
        isRegistered: true,
        userStatus: 'registered',
      }));
      
      Alert.alert('Success', 'You have successfully registered for this event!');
      
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };
  
  const handleCancelRegistration = async () => {
    if (!user || !event) return;
    
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your registration for this event?',
      [
        { text: 'No, Keep Registration', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCanceling(true);
              
              // Find the participant data to remove
              const participantToRemove = event.participants.find(p => p.uid === user.uid);
              
              if (!participantToRemove) {
                Alert.alert('Error', 'Registration not found');
                return;
              }
              
              // Remove user from event participants
              await firestore().collection('events').doc(eventId).update({
                participants: firestore.FieldValue.arrayRemove(participantToRemove)
              });
              
              // Update local state
              setEvent(prev => ({
                ...prev!,
                participants: prev!.participants.filter(p => p.uid !== user.uid),
                isRegistered: false,
                userStatus: undefined,
              }));
              
              Alert.alert('Registration Cancelled', 'Your registration has been cancelled.');
              
            } catch (error) {
              console.error('Error canceling registration:', error);
              Alert.alert('Error', 'Failed to cancel registration');
            } finally {
              setCanceling(false);
            }
          } 
        },
      ]
    );
  };
  
  const handleOpenMaps = () => {
    if (!event?.coordinates) return;
    
    const { latitude, longitude } = event.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert('Error', 'Could not open maps application');
    });
  };
  
  const formatDate = (date: any) => {
    if (!date) return 'TBD';
    const dateObj = date.toDate ? date.toDate() : parseISO(date);
    return format(dateObj, 'EEEE, MMMM d, yyyy');
  };
  
  const formatTime = (date: any) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : parseISO(date);
    return format(dateObj, 'h:mm a');
  };
  
  const renderParticipantItem = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem}>
      <Avatar.Text 
        size={40} 
        label={item.displayName.charAt(0).toUpperCase()} 
        style={styles.avatar}
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.displayName}</Text>
        <Text style={styles.participantEmail} numberOfLines={1}>{item.email}</Text>
      </View>
      <Badge style={styles.statusBadge} size={24}>
        {item.status === 'attended' ? '✓' : item.status === 'cancelled' ? '✕' : '•'}
      </Badge>
    </View>
  );

  if (loading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        {event.imageUrl ? (
          <Image 
            source={{ uri: event.imageUrl }} 
            style={styles.eventImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{event.title.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <View style={styles.eventTypeContainer}>
              <Chip style={styles.eventTypeChip} textStyle={styles.eventTypeText}>
                {event.type.toUpperCase()}
              </Chip>
              {event.status === 'completed' && (
                <Chip 
                  style={[styles.eventStatusChip, styles.completedChip]} 
                  textStyle={styles.eventStatusText}
                >
                  COMPLETED
                </Chip>
              )}
              {event.status === 'cancelled' && (
                <Chip 
                  style={[styles.eventStatusChip, styles.cancelledChip]} 
                  textStyle={styles.eventStatusText}
                >
                  CANCELLED
                </Chip>
              )}
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventDateContainer}>
              <IconButton 
                icon="calendar" 
                size={20} 
                color="#fff" 
                style={styles.icon} 
              />
              <Text style={styles.eventDateText}>
                {formatDate(event.date)}
                {event.endDate && ` - ${formatDate(event.endDate)}`}
              </Text>
            </View>
            <View style={styles.eventTimeContainer}>
              <IconButton 
                icon="clock-outline" 
                size={20} 
                color="#fff" 
                style={styles.icon} 
              />
              <Text style={styles.eventTimeText}>
                {formatTime(event.date)}
                {event.endDate && ` - ${formatTime(event.endDate)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Event Details */}
      <View style={styles.detailsContainer}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {event.isRegistered ? (
            <>
              <Button 
                mode="contained" 
                onPress={() => {}}
                style={[styles.actionButton, styles.chatButton]}
                labelStyle={styles.chatButtonLabel}
                icon="chat"
              >
                Event Chat
              </Button>
              <Button 
                mode="outlined" 
                onPress={handleCancelRegistration}
                loading={canceling}
                disabled={canceling || event.status !== 'upcoming'}
                style={[styles.actionButton, styles.cancelButton]}
                labelStyle={styles.cancelButtonLabel}
                icon="calendar-remove"
              >
                Cancel Registration
              </Button>
            </>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleRegister}
              loading={registering}
              disabled={
                registering || 
                event.status !== 'upcoming' || 
                (event.registrationDeadline && new Date() > event.registrationDeadline.toDate()) ||
                event.participants.length >= event.maxParticipants
              }
              style={styles.registerButton}
              icon="calendar-check"
            >
              {event.participants.length >= event.maxParticipants 
                ? 'Event Full' 
                : (event.registrationDeadline && new Date() > event.registrationDeadline.toDate())
                  ? 'Registration Closed'
                  : 'Register Now'}
            </Button>
          )}
        </View>
        
        {/* Event Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
        
        {/* Event Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            {event.coordinates && (
              <TouchableOpacity onPress={handleOpenMaps}>
                <Text style={styles.getDirectionsText}>Get Directions</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.locationContainer}>
            <IconButton 
              icon="map-marker" 
              size={24} 
              color="#1a73e8" 
              style={styles.locationIcon} 
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>{event.location}</Text>
              {event.locationDetails && (
                <Text style={styles.locationDetails}>{event.locationDetails}</Text>
              )}
            </View>
          </View>
          
          {event.coordinates && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: event.coordinates.latitude,
                  longitude: event.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onLayout={() => setMapReady(true)}
                scrollEnabled={mapReady}
                zoomEnabled={mapReady}
                rotateEnabled={mapReady}
                pitchEnabled={mapReady}
              >
                <Marker
                  coordinate={{
                    latitude: event.coordinates.latitude,
                    longitude: event.coordinates.longitude,
                  }}
                  title={event.location}
                  description={event.locationDetails}
                />
              </MapView>
            </View>
          )}
        </View>
        
        {/* Event Requirements */}
        {event.requirements && event.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.listContainer}>
              {event.requirements.map((requirement, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{requirement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Event Rules */}
        {event.rules && event.rules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules & Regulations</Text>
            <View style={styles.listContainer}>
              {event.rules.map((rule, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Event Prizes */}
        {event.prizes && event.prizes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prizes</Text>
            <View style={styles.prizesContainer}>
              {event.prizes.map((prize, index) => (
                <View key={index} style={styles.prizeItem}>
                  <Text style={styles.prizePosition}>{index + 1}.</Text>
                  <Text style={styles.prizeText}>{prize}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Participants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <Text style={styles.participantCount}>
              {event.participants.length}/{event.maxParticipants}
            </Text>
          </View>
          
          {event.participants.length > 0 ? (
            <View style={styles.participantsList}>
              {event.participants.map((participant, index) => (
                <View key={participant.uid} style={styles.participantItem}>
                  <Avatar.Text 
                    size={36} 
                    label={participant.displayName.charAt(0).toUpperCase()} 
                    style={styles.avatar}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.displayName}
                    {participant.uid === event.createdBy && ' (Organizer)'}
                  </Text>
                  {participant.status === 'attended' && (
                    <Badge style={styles.attendedBadge} size={16} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noParticipantsText}>No participants yet. Be the first to register!</Text>
          )}
          
          {event.participants.length < event.maxParticipants && (
            <Text style={styles.spotsLeftText}>
              {event.maxParticipants - event.participants.length} spots left
            </Text>
          )}
        </View>
        
        {/* Event Organizer */}
        <View style={styles.organizerContainer}>
          <Text style={styles.organizerText}>Organized by VU Sports Society</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Organizer</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContent: {
    marginTop: 8,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  eventTypeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
    marginBottom: 4,
    height: 24,
  },
  eventTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  eventStatusChip: {
    height: 24,
    justifyContent: 'center',
  },
  completedChip: {
    backgroundColor: '#4caf50',
  },
  cancelledChip: {
    backgroundColor: '#f44336',
  },
  eventStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDateText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: -8,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTimeText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: -8,
  },
  icon: {
    margin: 0,
    width: 24,
    height: 24,
  },
  detailsContainer: {
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  registerButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
  },
  chatButton: {
    backgroundColor: '#1a73e8',
  },
  chatButtonLabel: {
    color: '#fff',
  },
  cancelButton: {
    borderColor: '#f44336',
  },
  cancelButtonLabel: {
    color: '#f44336',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  eventDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  getDirectionsText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  locationIcon: {
    margin: 0,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 13,
    color: '#666',
  },
  mapContainer: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  prizesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prizePosition: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginRight: 8,
    minWidth: 24,
  },
  prizeText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  participantCount: {
    fontSize: 14,
    color: '#666',
  },
  participantsList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    backgroundColor: '#e3f2fd',
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#e0e0e0',
  },
  attendedBadge: {
    backgroundColor: '#4caf50',
  },
  noParticipantsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  spotsLeftText: {
    fontSize: 13,
    color: '#1a73e8',
    fontWeight: '500',
    textAlign: 'right',
  },
  organizerContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  organizerText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EventDetailsScreen;
