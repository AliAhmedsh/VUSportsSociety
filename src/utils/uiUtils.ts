import { Platform, Dimensions, StatusBar, Alert, Linking } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

// Screen dimensions
const { width, height } = Dimensions.get('window');

/**
 * Check if the device is an iPhone with notch
 */
export const hasNotch = (): boolean => {
  // iPhone X, XS, XR, 11, 12, 13, etc.
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (height >= 812 || width >= 812)
  );
};

/**
 * Get the status bar height
 */
export const statusBarHeight = (): number => {
  return Platform.select({
    ios: hasNotch() ? 44 : 20,
    android: StatusBar.currentHeight || 0,
    default: 0,
  });
};

/**
 * Get the bottom safe area inset (for devices with home indicator)
 */
export const bottomSafeArea = (): number => {
  return hasNotch() ? 34 : 0;
};

/**
 * Get a responsive font size based on screen width
 * @param size - The base font size
 * @param factor - The scaling factor (default: 0.5)
 * @returns The responsive font size
 */
export const responsiveFontSize = (size: number, factor: number = 0.5): number => {
  const { width: screenWidth } = Dimensions.get('window');
  const baseWidth = 375; // iPhone 6/7/8 width
  const scale = screenWidth / baseWidth;
  const newSize = size + (scale * size - size) * factor;
  
  return Math.round(newSize);
};

/**
 * Scale a size based on screen width
 * @param size - The base size
 * @returns The scaled size
 */
export const scaleSize = (size: number): number => {
  const { width: screenWidth } = Dimensions.get('window');
  const baseWidth = 375; // iPhone 6/7/8 width
  const scale = screenWidth / baseWidth;
  
  return Math.round(size * scale);
};

/**
 * Format a number with commas as thousands separators
 * @param num - The number to format
 * @returns The formatted number as a string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate a string to a specified length and add an ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string
 * @returns The truncated string
 */
export const truncateString = (str: string, maxLength: number = 50): string => {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};

/**
 * Capitalize the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert a string to title case
 * @param str - The string to convert
 * @returns The title-cased string
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Show a confirmation alert
 * @param title - The alert title
 * @param message - The alert message
 * @param confirmText - The confirm button text (default: 'OK')
 * @param cancelText - The cancel button text (default: 'Cancel')
 * @returns A promise that resolves to true if confirmed, false if cancelled
 */
export const showConfirmation = (
  title: string,
  message: string,
  confirmText: string = 'OK',
  cancelText: string = 'Cancel'
): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
};

/**
 * Show an error alert
 * @param title - The alert title
 * @param message - The error message
 * @param buttonText - The button text (default: 'OK')
 */
export const showError = (
  title: string,
  message: string,
  buttonText: string = 'OK'
): void => {
  Alert.alert(title, message, [{ text: buttonText }]);
};

/**
 * Open a URL in the device's default browser
 * @param url - The URL to open
 * @returns A promise that resolves when the URL is opened
 */
export const openUrl = async (url: string): Promise<void> => {
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Don't know how to open URL: ${url}`);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};

/**
 * Make a phone call
 * @param phoneNumber - The phone number to call
 * @returns A promise that resolves when the call is initiated
 */
export const makePhoneCall = async (phoneNumber: string): Promise<void> => {
  try {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Unable to make a call to: ${phoneNumber}`);
    }
  } catch (error) {
    console.error('Error making phone call:', error);
  }
};

/**
 * Send an email
 * @param to - The email recipient
 * @param subject - The email subject
 * @param body - The email body
 * @returns A promise that resolves when the email client is opened
 */
export const sendEmail = async (
  to: string,
  subject: string = '',
  body: string = ''
): Promise<void> => {
  try {
    const url = `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Unable to send email to: ${to}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Open the device's settings
 * @returns A promise that resolves when the settings app is opened
 */
export const openSettings = async (): Promise<void> => {
  try {
    const url = Platform.select({
      ios: 'app-settings:',
      android: 'package:com.vusportssociety.app', // Replace with your package name
    });
    
    if (!url) {
      console.error('Unable to open settings: Unsupported platform');
      return;
    }
    
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error('Unable to open settings');
    }
  } catch (error) {
    console.error('Error opening settings:', error);
  }
};

/**
 * Reset the navigation stack and navigate to a screen
 * @param navigation - The navigation object
 * @param routeName - The name of the route to navigate to
 * @param params - Optional route parameters
 */
export const resetNavigation = <T extends keyof RootStackParamList>(
  navigation: StackNavigationProp<RootStackParamList, T>,
  routeName: T,
  params?: RootStackParamList[T]
): void => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName, params }],
    })
  );
};

/**
 * Get a random color
 * @returns A random hex color code
 */
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
};

/**
 * Get a contrasting text color (black or white) for a given background color
 * @param hexColor - The background color in hex format
 * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export const getContrastTextColor = (hexColor: string): string => {
  // Remove the '#' if it exists
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate the relative luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Get the initials from a full name
 * @param name - The full name
 * @returns The initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes - The file size in bytes
 * @param decimals - The number of decimal places to show
 * @returns The formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value - The value to check
 * @returns True if the value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  
  return false;
};

/**
 * Debounce a function
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to wait
 * @returns A debounced function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle a function
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled function
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<F>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
