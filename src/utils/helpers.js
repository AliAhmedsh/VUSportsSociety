import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast, isFuture, parseISO } from 'date-fns';
import { Timestamp } from '@react-native-firebase/firestore';

/**
 * @typedef {Date|import('@react-native-firebase/firestore').Timestamp|string|number} DateInput
 */

/**
 * Format a date to a readable string
 * @param {DateInput} date - The date to format (can be Date, Timestamp, ISO string, or timestamp number)
 * @param {string} [formatStr='MMM d, yyyy'] - The format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  try {
    let dateObj;
    
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
 * @param {DateInput} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  try {
    let dateObj;
    
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
 * @param {DateInput} date - The date to format
 * @returns {string} Human-readable date string
 */
export const formatHumanReadableDate = (date) => {
  try {
    let dateObj;
    
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
 * @param {import('@react-native-firebase/firestore').Timestamp} timestamp - The Firestore Timestamp
 * @returns {Date} JavaScript Date object
 */
export const timestampToDate = (timestamp) => {
  return timestamp.toDate();
};

/**
 * Convert a JavaScript Date to a Firestore Timestamp
 * @param {Date} date - The JavaScript Date
 * @returns {import('@react-native-firebase/firestore').Timestamp} Firestore Timestamp
 */
export const dateToTimestamp = (date) => {
  return Timestamp.fromDate(date);
};

/**
 * Check if a date is in the past
 * @param {DateInput} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isDateInPast = (date) => {
  try {
    let dateObj;
    
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
 * @param {DateInput} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isDateInFuture = (date) => {
  try {
    let dateObj;
    
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
 * @param {number} milliseconds - The duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (milliseconds) => {
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
 * @param {string} str - The string to truncate
 * @param {number} [maxLength=100] - The maximum length of the string
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} The title-cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate a random ID
 * @param {number} [length=20] - The length of the ID
 * @returns {string} A random ID string
 */
export const generateId = (length = 20) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to wait
 * @returns {Function} A debounced function
 */
export const debounce = (func, wait) => {
  /** @type {NodeJS.Timeout} */
  let timeout;
  
  return function executedFunction(...args) {
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
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} A throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle = false;
  
  return function executedFunction(...args) {
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
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get the initials from a full name
 * @param {string} name - The full name
 * @returns {string} The initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} The formatted number as a string
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Convert a file to a base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves to the base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert a base64 string to a Blob
 * @param {string} base64 - The base64 string
 * @param {string} type - The MIME type of the file
 * @returns {Blob} A Blob object
 */
export const base64ToBlob = (base64, type) => {
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
 * @returns {string} A random hex color code
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
};

/**
 * Get a contrasting text color (black or white) for a given background color
 * @param {string} hexColor - The background color in hex format
 * @returns {string} '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export const getContrastTextColor = (hexColor) => {
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
 * @template T
 * @param {T} obj - The object to clone
 * @returns {T} A deep clone of the object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are deeply equal
 * @param {*} obj1 - The first object
 * @param {*} obj2 - The second object
 * @returns {boolean} True if the objects are deeply equal
 */
export const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Get the value at a specific path in an object
 * @param {Object} obj - The object to query
 * @param {string} path - The path of the property to get (e.g., 'user.profile.name')
 * @param {*} [defaultValue] - The default value to return if the path doesn't exist
 * @returns {*} The value at the specified path or the default value
 */
export const get = (obj, path, defaultValue) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

/**
 * Set a value at a specific path in an object
 * @param {Object} obj - The object to modify
 * @param {string} path - The path of the property to set (e.g., 'user.profile.name')
 * @param {*} value - The value to set
 * @returns {Object} A new object with the updated value
 */
export const set = (obj, path, value) => {
  if (Object(obj) !== obj) return obj; // When obj is not an object
  if (typeof path === 'undefined') return obj;
  
  const keys = path.split('.');
  const current = { ...obj };
  let ref = current;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    ref[key] = ref[key] || {};
    ref = ref[key];
  }
  
  ref[keys[keys.length - 1]] = value;
  return current;
};
