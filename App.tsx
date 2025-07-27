import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor="transparent"
            translucent
          />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
