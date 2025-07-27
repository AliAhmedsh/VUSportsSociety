import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * @typedef {Object} User
 * @property {string} uid - The user's unique identifier
 * @property {string} email - The user's email address
 * @property {string} displayName - The user's display name
 * @property {'participant'|'coach'|'admin'} role - The user's role
 * @property {boolean} approved - Whether the user is approved
 * @property {string} [password] - Password (only for dummy data)
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user - The current user or null if not authenticated
 * @property {boolean} loading - Whether auth state is being loaded
 * @property {function(string, string): Promise<void>} login - Function to log in a user
 * @property {function(string, string, string, 'participant'|'coach'): Promise<void>} register - Function to register a new user
 * @property {function(): Promise<void>} logout - Function to log out the current user
 */

const AuthContext = createContext(undefined);

// Dummy users data
const DUMMY_USERS = [
  {
    uid: '1',
    email: 'participant@example.com',
    displayName: 'Test Participant',
    password: 'password123',
    role: 'participant',
    approved: true,
  },
  {
    uid: '2',
    email: 'coach@example.com',
    displayName: 'Test Coach',
    password: 'password123',
    role: 'coach',
    approved: true,
  },
  {
    uid: '3',
    email: 'admin@example.com',
    displayName: 'Admin User',
    password: 'admin123',
    role: 'admin',
    approved: true,
  },
];

export function AuthProvider({ children } ) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(DUMMY_USERS);

  // Simulate auto-login on app start
  useEffect(() => {
    // Auto-login the first user for demo purposes
    const demoUser = DUMMY_USERS[0];
    const { password: _, ...userWithoutPassword } = demoUser;
    setUser(userWithoutPassword );
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trim and lowercase email for case-insensitive comparison
      const normalizedEmail = email.trim().toLowerCase();
      
      const foundUser = users.find(
        u => u.email.toLowerCase() === normalizedEmail && u.password === password
      );
      
      if (foundUser) {
        // Create a copy without the password
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        console.log('Login successful:', userWithoutPassword);
      } else {
        console.log('Login failed - user not found or invalid credentials');
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName, role) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      setLoading(false);
      throw new Error('Email already in use');
    }
    
    const newUser = {
      uid: `user-${Date.now()}`,
      email,
      displayName,
      password, // In a real app, never store plain passwords
      role,
      approved: role === 'participant', // Auto-approve participants
    };
    
    setUsers(prev => [...prev, newUser]);
    
    // Auto-login after registration
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword );
    setLoading(false);
  };

  const logout = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
