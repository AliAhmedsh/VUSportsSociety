import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { 
  TextInput, 
  Button, 
  Title, 
  Divider, 
  Switch, 
  HelperText,
  useTheme,
  Portal,
  Modal,
  Text,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

type CreateEventNavigationProp = StackNavigationProp<RootStackParamList, 'CreateEvent'>;

type EventType = 'tournament' | 'friendly' | 'training' | 'workshop' | 'other';
type EventCategory = 'sports' | 'fitness' | 'recreational' | 'educational';

const eventTypes = [
  { label: 'Tournament', value: 'tournament' },
  { label: 'Friendly Match', value: 'friendly' },
  { label: 'Training Session', value: 'training' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Other', value: 'other' },
];

const eventCategories = [
  { label: 'Sports', value: 'sports' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Recreational', value: 'recreational' },
  { label: 'Educational', value: 'educational' },
];

const CreateEventScreen = () => {
  const navigation = useNavigation<CreateEventNavigationProp>();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Event details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('tournament');
  const [category, setCategory] = useState<EventCategory>('sports');
  const [maxParticipants, setMaxParticipants] = useState('50');
  
  // Date & Time
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setHours(date.getHours() + 2);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [useEndDate, setUseEndDate] = useState(false);
  
  // Location
  const [location, setLocation] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [useLocation, setUseLocation] = useState(true);
  
  // Registration
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | null>(null);
  const [showRegistrationDeadline, setShowRegistrationDeadline] = useState(false);
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Event title is required';
    if (!description.trim()) newErrors.description = 'Event description is required';
    if (useLocation && !location.trim()) newErrors.location = 'Location is required';
    if (registrationRequired && registrationDeadline && registrationDeadline > startDate) {
      newErrors.registrationDeadline = 'Registration deadline must be before event start time';
    }
    if (useEndDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    
    try {
      setLoading(true);
      
      // Prepare event data
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        type: eventType,
        category,
        maxParticipants: parseInt(maxParticipants, 10) || 50,
        date: startDate,
        endDate: useEndDate ? endDate : null,
        location: useLocation ? location.trim() : 'TBD',
        locationDetails: useLocation ? locationDetails.trim() : '',
        registrationRequired,
        registrationDeadline: registrationRequired ? registrationDeadline : null,
        participants: [],
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'upcoming',
      };
      
      // TODO: Implement Firebase Firestore integration
      console.log('Submitting event:', eventData);
      
      // Show success message and navigate back
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Title style={styles.sectionTitle}>Event Details</Title>
        
        {/* Basic Information */}
        <TextInput
          label="Event Title *"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          error={!!errors.title}
        />
        {errors.title && <HelperText type="error">{errors.title}</HelperText>}
        
        <TextInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
          error={!!errors.description}
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}
        
        <View style={styles.row}>
          <View style={[styles.pickerContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Event Type *</Text>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerText}>
                {eventTypes.find(t => t.value === eventType)?.label}
              </Text>
              <IconButton
                icon="chevron-down"
                size={20}
                onPress={() => {/* TODO: Show type picker */}}
                style={styles.pickerIcon}
              />
            </View>
          </View>
          
          <View style={[styles.pickerContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerText}>
                {eventCategories.find(c => c.value === category)?.label}
              </Text>
              <IconButton
                icon="chevron-down"
                size={20}
                onPress={() => {/* TODO: Show category picker */}}
                style={styles.pickerIcon}
              />
            </View>
          </View>
        </View>
        
        <View style={[styles.row, { marginBottom: 16 }]}>
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
        </View>
        
        {/* Date & Time */}
        <Title style={[styles.sectionTitle, { marginTop: 24 }]}>Date & Time</Title>
        
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeInput}>
            <Text style={styles.label}>Start Date & Time *</Text>
            <Text style={styles.dateTimeText} onPress={() => setShowDatePicker('start')}>
              {formatDate(startDate)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.row, { alignItems: 'center', marginBottom: 16 }]}>
          <Switch
            value={useEndDate}
            onValueChange={setUseEndDate}
            color={theme.colors.primary}
          />
          <Text style={styles.switchLabel}>Set End Date & Time</Text>
        </View>
        
        {useEndDate && (
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeInput}>
              <Text style={styles.label}>End Date & Time *</Text>
              <Text style={styles.dateTimeText} onPress={() => setShowDatePicker('end')}>
                {formatDate(endDate)}
              </Text>
              {errors.endDate && (
                <HelperText type="error" style={styles.errorText}>
                  {errors.endDate}
                </HelperText>
              )}
            </View>
          </View>
        )}
        
        {/* Location */}
        <Title style={[styles.sectionTitle, { marginTop: 24 }]}>
          Location
        </Title>
        
        <View style={[styles.row, { alignItems: 'center', marginBottom: 16 }]}>
          <Switch
            value={useLocation}
            onValueChange={setUseLocation}
            color={theme.colors.primary}
          />
          <Text style={styles.switchLabel}>Specify Location</Text>
        </View>
        
        {useLocation && (
          <>
            <TextInput
              label="Location *"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              error={!!errors.location}
              left={<TextInput.Icon name="map-marker" />}
            />
            {errors.location && <HelperText type="error">{errors.location}</HelperText>}
            
            <TextInput
              label="Location Details (Optional)"
              value={locationDetails}
              onChangeText={setLocationDetails}
              style={[styles.input, { marginBottom: 16 }]}
              multiline
              numberOfLines={2}
            />
          </>
        )}
        
        {/* Registration */}
        <Title style={[styles.sectionTitle, { marginTop: 24 }]}>
          Registration
        </Title>
        
        <View style={[styles.row, { alignItems: 'center', marginBottom: 16 }]}>
          <Switch
            value={registrationRequired}
            onValueChange={setRegistrationRequired}
            color={theme.colors.primary}
          />
          <Text style={styles.switchLabel}>Require Registration</Text>
        </View>
        
        {registrationRequired && (
          <View style={styles.registrationDeadline}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Registration Deadline {registrationDeadline ? '(Optional)' : ''}
                </Text>
                {registrationDeadline ? (
                  <View style={styles.dateTimeButton}>
                    <Text style={styles.dateTimeText}>
                      {formatDate(registrationDeadline)}
                    </Text>
                    <View style={styles.dateTimeActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => setShowRegistrationDeadline(true)}
                        style={styles.dateTimeActionButton}
                      />
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => setRegistrationDeadline(null)}
                        style={styles.dateTimeActionButton}
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => setShowRegistrationDeadline(true)}
                    icon="calendar-plus"
                    style={styles.addDeadlineButton}
                  >
                    Add Deadline
                  </Button>
                )}
              </View>
            </View>
            {errors.registrationDeadline && (
              <HelperText type="error" style={styles.errorText}>
                {errors.registrationDeadline}
              </HelperText>
            )}
          </View>
        )}
        
        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </Button>
        
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? startDate : endDate}
          mode="datetime"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (selectedDate) {
              if (showDatePicker === 'start') {
                setStartDate(selectedDate);
              } else {
                setEndDate(selectedDate);
              }
            }
          }}
        />
      )}
      
      {showRegistrationDeadline && (
        <DateTimePicker
          value={registrationDeadline || new Date()}
          mode="datetime"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowRegistrationDeadline(false);
            if (selectedDate) {
              setRegistrationDeadline(selectedDate);
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  pickerIcon: {
    margin: 0,
  },
  label: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.87)',
    marginLeft: 8,
  },
  dateTimeRow: {
    marginBottom: 16,
  },
  dateTimeInput: {
    flex: 1,
  },
  dateTimeText: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingRight: 8,
  },
  dateTimeActions: {
    flexDirection: 'row',
  },
  dateTimeActionButton: {
    margin: 0,
  },
  addDeadlineButton: {
    marginTop: 8,
  },
  registrationDeadline: {
    marginBottom: 16,
  },
  errorText: {
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
});

export default CreateEventScreen;
