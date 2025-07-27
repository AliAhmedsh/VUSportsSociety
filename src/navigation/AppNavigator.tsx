import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/participant/HomeScreen';
import EventsScreen from '../screens/participant/EventsScreen';
import TeamsScreen from '../screens/participant/TeamsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Define icon names for each route
          const iconMap: { [key: string]: { active: string; inactive: string } } = {
            Home: { active: 'home', inactive: 'home-outline' },
            Events: { active: 'calendar', inactive: 'calendar-outline' },
            Teams: { active: 'people', inactive: 'people-outline' },
            Profile: { active: 'person', inactive: 'person-outline' }
          };
          
          // Get the appropriate icon name based on route and focus state
          const iconName = focused 
            ? iconMap[route.name]?.active || 'help-circle'
            : iconMap[route.name]?.inactive || 'help-circle-outline';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Authenticated users see the main app
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
        ) : (
          // Unauthenticated users see the auth screens
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
