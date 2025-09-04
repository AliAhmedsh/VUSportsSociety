import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, StyleSheet } from 'react-native';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/participant/HomeScreen/HomeScreen';
import EventsScreen from '../screens/participant/EventsScreen/EventsScreen';
import TeamsScreen from '../screens/participant/TeamScreen/TeamsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../screens/participant/DashboardScreen/Dashboard';
import EventsScreenv2 from '../screens/participant/EventsScreen/EventScreenV2';
import TeamsScreenv2 from '../screens/participant/TeamScreen/TeamsScreenv2';
import SettingsScreen from '../screens/setting/Setting';
import LeaderboardScreen from '../screens/leaderboard/Leaderboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          // Define image sources for each route
          const iconMap = {
            Home: {
              active: 'https://img.icons8.com/ios-filled/50/1a73e8/home.png',
              inactive: 'https://img.icons8.com/ios/50/9e9e9e/home.png',
            },
            Events: {
              active:
                'https://img.icons8.com/ios-filled/50/1a73e8/calendar.png',
              inactive: 'https://img.icons8.com/ios/50/9e9e9e/calendar.png',
            },
            Teams: {
              active: 'https://img.icons8.com/ios/100/cccccc/teamwork.png',
              inactive: 'https://img.icons8.com/ios/100/cccccc/teamwork.png',
            },
            Profile: {
              active:
                'https://img.icons8.com/ios-filled/50/1a73e8/user-male-circle.png',
              inactive:
                'https://img.icons8.com/ios/50/9e9e9e/user-male-circle.png',
            },
          };

          // Get the appropriate icon based on route and focus state
          const iconSource = focused
            ? iconMap[route.name]?.active
            : iconMap[route.name]?.inactive;

          return (
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: iconSource }}
                style={[styles.icon, { tintColor: color }]}
                resizeMode="contain"
              />
            </View>
          );
        },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={EventsScreenv2} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Teams" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
