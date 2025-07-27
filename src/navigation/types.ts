export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  
  // Main Tabs
  Main: undefined;
  
  // Team Screens
  TeamDetails: { teamId: string };
  CreateTeam: undefined;
  EditTeam: { teamId: string };
  
  // Event Screens
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  
  // Profile & Settings
  Profile: { userId?: string };
  EditProfile: undefined;
  ChangePassword: undefined;
  
  // Admin Screens
  AdminDashboard: undefined;
  UserManagement: undefined;
  UserDetails: { userId: string };
  AddUser: undefined;
  EditUser: { userId: string };
  
  EventManagement: undefined;
  
  TeamManagement: undefined;
  
  // Settings & Configuration
  Settings: undefined;
  AppSettings: undefined;
  NotificationSettings: undefined;
  
  // Other
  WebView: { url: string; title?: string };
};

export type TabParamList = {
  Home: undefined;
  Events: undefined;
  Teams: undefined;
  Profile: undefined;
};

// Extend the RootStackParamList with the TabParamList
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
