import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type User = {
  uid: string;
  email: string;
  displayName: string;
  role: 'participant' | 'coach' | 'admin';
  approved: boolean;
  password?: string; // Only for dummy data
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: 'participant' | 'coach') => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users data
const DUMMY_USERS: User[] = [
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);

  // Simulate auto-login on app start
  useEffect(() => {
    // Auto-login the first user for demo purposes
    const demoUser = DUMMY_USERS[0];
    const { password: _, ...userWithoutPassword } = demoUser;
    setUser(userWithoutPassword as User);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
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
        setUser(userWithoutPassword as User);
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

  const register = async (email: string, password: string, displayName: string, role: 'participant' | 'coach') => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      setLoading(false);
      throw new Error('Email already in use');
    }
    
    const newUser: User = {
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
    setUser(userWithoutPassword as User);
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
