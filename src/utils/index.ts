// Core utilities
export * from './helpers';
export * from './formUtils';
export * from './api';
export * from './firebaseUtils';
export * from './uiUtils';
export * from './notificationUtils';

// Common types
export type { 
  ApiResponse, 
  PaginatedResponse, 
  SelectOption, 
  ValidationError, 
  FormErrors, 
  FormField 
} from '../types';

// Common date utilities
export { 
  format, 
  formatDistanceToNow, 
  isToday, 
  isTomorrow, 
  isYesterday, 
  isPast, 
  isFuture, 
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  endOfDay
} from 'date-fns';

// Common React Native components
export { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  Modal, 
  Alert, 
  Platform, 
  Dimensions, 
  KeyboardAvoidingView, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';

// Common UI components from react-native-paper
export { 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  Avatar, 
  IconButton, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput as PaperTextInput, 
  Checkbox, 
  RadioButton, 
  Switch, 
  List, 
  Divider, 
  Chip, 
  Badge, 
  Snackbar, 
  Appbar, 
  Banner, 
  DataTable, 
  Searchbar, 
  ProgressBar, 
  Surface, 
  useTheme, 
  DefaultTheme, 
  Provider as PaperProvider 
} from 'react-native-paper';

// Navigation
export { 
  NavigationContainer, 
  useNavigation, 
  useRoute, 
  useFocusEffect, 
  useIsFocused 
} from '@react-navigation/native';

export { 
  createStackNavigator 
} from '@react-navigation/stack';

export { 
  createBottomTabNavigator 
} from '@react-navigation/bottom-tabs';

export { 
  createDrawerNavigator 
} from '@react-navigation/drawer';

// Form handling
export { 
  useForm, 
  Controller, 
  FormProvider, 
  useFormContext, 
  useWatch, 
  useFieldArray 
} from 'react-hook-form';

export { 
  yupResolver 
} from '@hookform/resolvers/yup';

import * as yup from 'yup';
export { yup };
