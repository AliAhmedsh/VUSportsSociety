import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FAB, Snackbar, Searchbar, Chip, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { Team, RootStackParamList } from '../../types';
// import { useAuth } from '../../contexts/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { useTeams } from '../../hooks/useTeams';
import { TeamCard } from '../../components/teams/TeamCard';
import { SportFilter } from '../../components/teams/SportFilter';


type Styles = {
  container: ViewStyle;
  searchContainer: ViewStyle;
  searchInput: ViewStyle;
  filterTabs: ViewStyle;
  filterTabsContent: ViewStyle;
  filterChip: ViewStyle;
  filterChipLabel: TextStyle;
  filterChipLabelActive: TextStyle;
  sportFilterContainer: ViewStyle;
  sportFilterLabel: TextStyle;
  sportChips: ViewStyle;
  sportChip: ViewStyle;
  sportChipText: TextStyle;
  listContent: ViewStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  fab: ViewStyle;
};

const TeamsScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my' | 'sport'>('all');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { 
    teams, 
    myTeams, 
    sports, 
    loading, 
    refreshing, 
    error, 
    fetchTeams, 
    handleRefresh, 
    handleJoinTeam: joinTeam 
  } = useTeams(user?.uid || '');
  
  const styles = useStyles(theme);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleSportFilter = useCallback((sport: string) => {
    setSelectedSport(sport);
    setSelectedFilter(sport ? 'sport' : 'all');
  }, []);
  
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = !searchQuery || 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesSport = !selectedSport || team.sport === selectedSport;
      
      const matchesMyTeams = selectedFilter !== 'my' || 
        (user?.uid && team.members?.some(member => member.userId === user.uid));
      
      return matchesSearch && matchesSport && matchesMyTeams;
    });
  }, [teams, searchQuery, selectedSport, selectedFilter, user?.uid]);
  
  // Handle team press
  const handleTeamPress = useCallback((teamId: string) => {
    navigation.navigate('TeamDetails', { teamId });
  }, [navigation]);
  
  // Handle join team
  const handleJoinTeam = useCallback(async (teamId: string) => {
    try {
      await joinTeam(teamId);
      await fetchTeams();
      setSnackbarMessage('Successfully joined the team');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error joining team:', error);
      setSnackbarMessage('Failed to join team. Please try again.');
      setSnackbarVisible(true);
    }
  }, [joinTeam, fetchTeams]);
  
  // Handle team leave
  const handleLeaveTeam = useCallback(async (teamId: string) => {
    try {
      if (!user?.uid) return;
      
      setIsLoading(true);
      
      // Remove user from team members
      await firestore()
        .collection('teams')
        .doc(teamId)
        .update({
          members: firestore.FieldValue.arrayRemove(user.uid),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      // Refresh teams data
      await fetchTeams();
      
      setSnackbarMessage('Successfully left the team');
    } catch (error) {
      console.error('Error leaving team:', error);
      setSnackbarMessage('Failed to leave team. Please try again.');
    } finally {
      setIsLoading(false);
      setSnackbarVisible(true);
    }
  }, [user?.uid, fetchTeams]);
  
  // Show error message if any
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  // Initialize with user ID if available
  useEffect(() => {
    if (user?.uid) {
      fetchTeams();
    }
  }, [user?.uid, fetchTeams]);
  
  // Render team item
  const renderTeamItem = useCallback(({ item }: { item: Team }) => {
    const isMember = myTeams.some(t => t.id === item.id);
    return (
      <TeamCard 
        team={item} 
        isMember={isMember}
        onPress={handleTeamPress}
        onJoinPress={handleJoinTeam}
        onLeavePress={handleLeaveTeam}
        theme={theme}
      />
    );
  }, [myTeams, handleTeamPress, handleJoinTeam, handleLeaveTeam, theme]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            Loading teams...
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          No teams found
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
          {selectedFilter === 'my'
            ? 'You are not a member of any teams yet.'
            : searchQuery
            ? 'No teams match your search criteria.'
            : 'There are no teams available at the moment.'}
        </Text>
      </View>
    );
  }, [loading, selectedFilter, searchQuery, theme]);
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          onChangeText={handleSearch}
          left={
            <TextInput.Icon 
              name="magnify" 
              color={theme.colors.onSurfaceVariant} 
            />
          }
          mode="outlined"
          outlineColor="transparent"
          activeOutlineColor={theme.colors.primary}
        />
      </View>
      
      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        <Button
          mode={selectedFilter === 'all' ? 'contained' : 'outlined'}
          onPress={() => setSelectedFilter('all')}
          style={styles.filterChip}
          labelStyle={{
            color: selectedFilter === 'all' 
              ? theme.colors.onPrimary 
              : theme.colors.primary
          }}
        >
          All Teams
        </Button>
        
        <Button
          mode={selectedFilter === 'my' ? 'contained' : 'outlined'}
          onPress={() => setSelectedFilter('my')}
          style={styles.filterChip}
          labelStyle={{
            color: selectedFilter === 'my' 
              ? theme.colors.onPrimary 
              : theme.colors.primary
          }}
        >
          My Teams
        </Button>
        
        <Button
          mode={selectedFilter === 'sport' ? 'contained' : 'outlined'}
          onPress={() => setSelectedFilter('sport')}
          style={styles.filterChip}
          labelStyle={{
            color: selectedFilter === 'sport' 
              ? theme.colors.onPrimary 
              : theme.colors.primary
          }}
        >
          By Sport
        </Button>
      </ScrollView>
      
      {/* Sport Filter */}
      {selectedFilter === 'sport' && (
        <View style={styles.sportFilterContainer}>
          <SportFilter 
            sports={sports} 
            selectedSport={selectedSport} 
            onSelectSport={handleSportFilter}
            theme={theme}
          />
        </View>
      )}
      
      {/* Team List */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
      
      {/* Create Team FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('CreateTeam')}
      />
      
      {/* Snackbar for error messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
};

// Define styles with theme
const useStyles = (theme: MD3Theme): Styles => {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    searchInput: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    filterTabs: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    filterTabsContent: {
      flexDirection: 'row',
    },
    filterChip: {
      marginRight: 8,
      borderRadius: 16,
    },
    filterChipLabel: {
      fontSize: 12,
    },
    filterChipLabelActive: {
      color: theme.colors.onPrimary,
    },
    sportFilterContainer: {
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    sportFilterLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      color: theme.colors.onSurfaceVariant,
    },
    sportChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    sportChip: {
      margin: 4,
      borderRadius: 16,
    },
    sportChipText: {
      fontSize: 12,
    },
    listContent: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      marginBottom: 16,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
  });
};
export default TeamsScreen;