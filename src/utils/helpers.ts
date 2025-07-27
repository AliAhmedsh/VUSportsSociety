import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast, isFuture, parseISO } from 'date-fns';
import { Timestamp } from '@react-native-firebase/firestore';

type DateInput = Date | Timestamp | string | number;

/**
 * Format a date to a readable string
 * @param date - The date to format (can be Date, Timestamp, ISO string, or timestamp number)
 * @param formatStr - The format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: DateInput, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: DateInput): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Format a date to a human-readable format (e.g., "Today at 2:30 PM", "Tomorrow at 10:00 AM")
 * @param date - The date to format
 * @returns Human-readable date string
 */
export const formatHumanReadableDate = (date: DateInput): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    } else if (isTomorrow(dateObj)) {
      return `Tomorrow at ${format(dateObj, 'h:mm a')}`;
    } else if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'h:mm a')}`;
    } else if (isFuture(dateObj)) {
      return `${format(dateObj, 'EEEE, MMM d')} at ${format(dateObj, 'h:mm a')}`;
    } else {
      return format(dateObj, 'MMM d, yyyy h:mm a');
    }
  } catch (error) {
    console.error('Error formatting human-readable date:', error);
    return formatDate(date);
  }
};

/**
 * Convert a Firestore Timestamp to a JavaScript Date
 * @param timestamp - The Firestore Timestamp
 * @returns JavaScript Date object
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

/**
 * Convert a JavaScript Date to a Firestore Timestamp
 * @param date - The JavaScript Date
 * @returns Firestore Timestamp
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns True if the date is in the past
 */
export const isDateInPast = (date: DateInput): boolean => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    return isPast(dateObj);
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param date - The date to check
 * @returns True if the date is in the future
 */
export const isDateInFuture = (date: DateInput): boolean => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    return isFuture(dateObj);
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
};

/**
 * Format a duration in milliseconds to a human-readable string (e.g., "2h 30m")
 * @param milliseconds - The duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Truncate a string to a specified length and add an ellipsis if necessary
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string
 * @returns The truncated string
 */
export const truncateString = (str: string, maxLength: number = 100): string => {
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
  return str.charAt(0).toUpperCase() + str.slice(1);
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
 * Generate a random ID
 * @param length - The length of the ID (default: 20)
 * @returns A random ID string
 */
export const generateId = (length: number = 20): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
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

/**
 * Check if a string is a valid email address
 * @param email - The email address to validate
 * @returns True if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
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
 * Format a number with commas as thousands separators
 * @param num - The number to format
 * @returns The formatted number as a string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Convert a file to a base64 string
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert a base64 string to a Blob
 * @param base64 - The base64 string
 * @param type - The MIME type of the file
 * @returns A Blob object
 */
export const base64ToBlob = (base64: string, type: string): Blob => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type });
};

/**
 * Generate a random color in hex format
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
 * Deep clone an object
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are deeply equal
 * @param obj1 - The first object
 * @param obj2 - The second object
 * @returns True if the objects are deeply equal
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Get the value at a specific path in an object
 * @param obj - The object to query
 * @param path - The path of the property to get (e.g., 'user.profile.name')
 * @param defaultValue - The default value to return if the path doesn't exist
 * @returns The value at the specified path or the default value
 */
export const get = (obj: any, path: string, defaultValue: any = undefined): any => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

/**
 * Set a value at a specific path in an object
 * @param obj - The object to modify
 * @param path - The path of the property to set (e.g., 'user.profile.name')
 * @param value - The value to set
 * @returns A new object with the updated value
 */
export const set = (obj: any, path: string, value: any): any => {
  if (Object(obj) !== obj) return obj; // When obj is not an object
  if (typeof path === 'undefined') return obj;
  
  const keys = path.split('.');
  let current = { ...obj };
  let ref = current;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    ref[key] = ref[key] || {};
    ref = ref[key];
  }
  
  ref[keys[keys.length - 1]] = value;
  return current;
};
