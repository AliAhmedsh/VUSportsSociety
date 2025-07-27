// Light theme colors
export const lightColors = {
  primary: '#6200ee',
  primaryVariant: '#3700b3',
  secondary: '#03dac6',
  secondaryVariant: '#018786',
  background: '#ffffff',
  surface: '#ffffff',
  error: '#b00020',
  onPrimary: '#ffffff',
  onSecondary: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#ffffff',
  text: '#000000',
  disabled: '#9e9e9e',
  placeholder: '#9e9e9e',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#f50057',
  card: '#ffffff',
  border: '#e0e0e0',
};

// Dark theme colors
export const darkColors = {
  primary: '#bb86fc',
  primaryVariant: '#3700b3',
  secondary: '#03dac6',
  secondaryVariant: '#03dac6',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#cf6679',
  onPrimary: '#000000',
  onSecondary: '#000000',
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onError: '#000000',
  text: '#ffffff',
  disabled: '#9e9e9e',
  placeholder: '#9e9e9e',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  notification: '#ff80ab',
  card: '#1e1e1e',
  border: '#424242',
};

// Common styles
export const commonStyles = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roundness: 4,
  padding: {
    small: 8,
    medium: 16,
    large: 24,
  },
  margin: {
    small: 8,
    medium: 16,
    large: 24,
  },
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
  },
};

// Export default theme (you can change this based on user preference)
const theme = {
  colors: lightColors, // or darkColors for dark theme
  ...commonStyles,
};

export default theme;
