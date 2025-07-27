// Core utilities
export * from './helpers';
export * from './formUtils';
export * from './api';
export * from './firebaseUtils';
export * from './uiUtils';
export * from './notificationUtils';

/**
 * Common type definitions (JSDoc style)
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the API request was successful
 * @property {*} [data] - Response data if successful
 * @property {string} [error] - Error message if request failed
 * 
 * @typedef {Object} PaginatedResponse
 * @property {Array} items - Array of paginated items
 * @property {number} total - Total number of items
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total number of pages
 * 
 * @typedef {Object} SelectOption
 * @property {string|number} value - The option value
 * @property {string} label - The display label
 * @property {boolean} [disabled] - Whether the option is disabled
 * 
 * @typedef {Object.<string, string>} ValidationError
 * 
 * @typedef {Object.<string, string>} FormErrors
 * 
 * @typedef {Object} FormField
 * @property {string} name - Field name
 * @property {string} [label] - Field label
 * @property {string} [placeholder] - Field placeholder
 * @property {string} [type] - Input type
 * @property {boolean} [required] - Whether the field is required
 * @property {Function} [validate] - Custom validation function
 */

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

// Export all common types for JSDoc
/** @type {ApiResponse} */
export const ApiResponseType = {};

/** @type {PaginatedResponse} */
export const PaginatedResponseType = {};

/** @type {SelectOption} */
export const SelectOptionType = {};

/** @type {ValidationError} */
export const ValidationErrorType = {};

/** @type {FormErrors} */
export const FormErrorsType = {};

/** @type {FormField} */
export const FormFieldType = {};
