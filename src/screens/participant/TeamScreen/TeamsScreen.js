import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView, 
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  FAB, 
  Snackbar, 
  Searchbar, 
  Chip, 
  Text, 
  Card, 
  Title, 
  Button as PaperButton
} from 'react-native-paper';
import { useAuth } from '../../../context/AuthContext';
import { useTeams } from '../../../hooks/useTeams';
import firestore from '@react-native-firebase/firestore';
import styles from './Style';



const TeamsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSport, setSelectedSport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { 
    teams = [], 
    myTeams = [], 
    sports = [], 
    loading = false, 
    refreshing = false, 
    error = null, 
    fetchTeams, 
    handleRefresh, 
    handleJoinTeam: joinTeam 
  } = useTeams(user?.uid || '');

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTeams();
      } catch (err) {
        console.error('Error loading teams:', err);
        showMessage('Failed to load teams. Please try again.');
      } finally {
        setInitialLoad(false);
      }
    };

    loadData();
  }, [fetchTeams]);
  
  
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  
  const handleSportFilter = useCallback((sport) => {
    setSelectedSport(sport);
    setSelectedFilter(sport ? 'sport' : 'all');
  }, []);
  
  const showMessage = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const filteredTeams = useMemo(() => {
    if (!Array.isArray(teams)) {
      return [];
    }
    
    return teams.filter(team => {
      if (!team) return false;
      
      const matchesSearch = !searchQuery || 
        (team.name && team.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (team.sport && team.sport.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSport = !selectedSport || team.sport === selectedSport;
      
      // Check if team.members is an array before using some
      const membersArray = Array.isArray(team.members) ? team.members : [];
      const matchesMyTeams = selectedFilter !== 'my' || 
        (user?.uid && membersArray.includes(user.uid));
      
      return matchesSearch && matchesSport && matchesMyTeams;
    });
  }, [teams, searchQuery, selectedSport, selectedFilter, user?.uid]);
  
  const handleTeamPress = useCallback((team) => {
    if (!team?.id) return;
    navigation.navigate('TeamDetails', { teamId: team.id });
  }, [navigation]);
  
  const handleJoinTeam = useCallback(async (teamId) => {
    if (!teamId || !user?.uid) return;
    
    setIsLoadingAction(true);
    try {
      await joinTeam(teamId);
      await fetchTeams();
      showMessage('Successfully joined the team');
    } catch (error) {
      console.error('Error joining team:', error);
      showMessage(error.message || 'Failed to join team. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  }, [joinTeam, fetchTeams]);
  
  // Handle team leave
  const handleLeaveTeam = useCallback(async (teamId) => {
    if (!teamId || !user?.uid) return;
    
    setIsLoadingAction(true);
    try {
      // Remove user from team members
      await firestore()
        .collection('teams')
        .doc(teamId)
        .update({
          members: firestore.FieldValue.arrayRemove(user.uid),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      
      await fetchTeams();
      showMessage('Successfully left the team');
    } catch (error) {
      console.error('Error leaving team:', error);
      showMessage('Failed to leave team. Please try again.');
    } finally {
      setIsLoadingAction(false);
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
  const renderTeamItem = useCallback(({ item }) => {
    const isMember = myTeams?.some(t => t.id === item.id) || false;
    return (
      <Card style={styles.teamCard}>
        <Card.Content>
          <Text style={styles.sportText}>
            {item.sport || 'General'}
          </Text>
          {item.description && (
            <Text 
              numberOfLines={2} 
              style={styles.descriptionText}
            >
              {item.description}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.memberCount}>
              {item.members?.length || 0} members
            </Text>
            {isMember ? (
              <PaperButton
                mode="outlined"
                onPress={() => handleLeaveTeam(item.id)}
                loading={isLoadingAction}
                style={styles.actionButton}
                textColor="#f44336"
              >
                Leave
              </PaperButton>
            ) : (
              <PaperButton
                mode="contained"
                onPress={() => handleJoinTeam(item.id)}
                loading={isLoadingAction}
                style={styles.actionButton}
              >
                Join
              </PaperButton>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  }, [myTeams, handleTeamPress, handleJoinTeam, handleLeaveTeam, isLoadingAction]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Loading teams...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Image
          source={{ uri: 'https://img.icons8.com/ios/100/cccccc/teamwork.png' }}
          style={{ width: 100, height: 100, opacity: 0.7 }}
        />
        <Text style={styles.emptyText}>
          {searchQuery || selectedSport || selectedFilter === 'my' 
            ? 'No teams match your search criteria.'
            : 'No teams available. Be the first to create one!'}
        </Text>
        <PaperButton
          mode="contained"
          onPress={() => navigation.navigate('CreateTeam')}
          style={{ marginTop: 16 }}
          icon="plus"
        >
          Create Team
        </PaperButton>
      </View>
    );
  }, [loading, selectedFilter, searchQuery, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search teams..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterContainer}>
          <PaperButton
            mode="contained"
            onPress={() => {
              setSelectedFilter('all');
              setSelectedSport(null);
            }}
            style={styles.chip}
          >
            All Teams
          </PaperButton>
          <PaperButton
            mode="contained"
            onPress={() => setSelectedFilter('my')}
            style={styles.chip}
          >
            My Teams
          </PaperButton>

          {sports.map((sport) => (
            <PaperButton
              key={sport}
              mode="contained"
              onPress={() => handleSportFilter(sport === selectedSport ? null : sport)}
              style={styles.chip}
            >
              {sport}
            </PaperButton>
          ))}
        </View>
      </View>

      {error ? (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>
            {error.message || 'Error loading teams. Please try again.'}
          </Text>
          <PaperButton
            mode="contained"
            onPress={handleRefresh}
            style={{ marginTop: 16 }}
            loading={refreshing}
          >
            Retry
          </PaperButton>
        </View>
      ) : filteredTeams.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card 
              style={styles.teamCard}
              onPress={() => handleTeamPress(item)}
            >
              <Card.Content>
                <Title style={styles.teamName}>{item.name || 'Unnamed Team'}</Title>
                <Text style={styles.sportText}>
                  {item.sport || 'General'}
                </Text>
                {item.description && (
                  <Text 
                    numberOfLines={2} 
                    style={styles.descriptionText}
                  >
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.memberCount}>
                    {item.members?.length || 0} members
                  </Text>
                  {item.members?.includes(user?.uid) ? (
                    <PaperButton
                      mode="outlined"
                      onPress={() => handleLeaveTeam(item.id)}
                      loading={isLoadingAction}
                      style={styles.actionButton}
                      textColor="#f44336"
                    >
                      Leave
                    </PaperButton>
                  ) : (
                    <PaperButton
                      mode="contained"
                      onPress={() => handleJoinTeam(item.id)}
                      loading={isLoadingAction}
                      style={styles.actionButton}
                    >
                      Join
                    </PaperButton>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[styles.theme.colors.primary]}
              tintColor={styles.theme.colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No teams found. Pull to refresh or create a new team.
              </Text>
            </View>
          }
        />
      )}
      
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#1a73e8',
        }}
        icon="plus"
        onPress={() => navigation.navigate('CreateTeam')}
        color="white"
      />
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#333' }}
        theme={{
          colors: {
            surface: '#ffffff',
            accent: '#1a73e8',
          },
        }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: '#ffffff' }}>{snackbarMessage}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};


export default TeamsScreen;