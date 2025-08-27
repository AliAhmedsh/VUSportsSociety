import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor="transparent"
              translucent
            />
            <AppNavigator />
          </SafeAreaView>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
