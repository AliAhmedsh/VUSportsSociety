import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Button, useTheme, MD3Theme } from 'react-native-paper';
import { Team } from '../../types/Team';

type TeamCardProps = {
  team: Team;
  isMember: boolean;
  onPress: (teamId: string) => void;
  onJoinPress: (teamId: string) => Promise<void>;
  onLeavePress: (teamId: string) => Promise<void>;
  theme: MD3Theme;
};

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isMember,
  onPress,
  onJoinPress,
  onLeavePress,
  theme,
}) => {
  const handleButtonPress = async () => {
    try {
      if (isMember) {
        // Already a member, navigate to team details
        onPress(team.id);
      } else {
        // Not a member, trigger join
        await onJoinPress(team.id);
      }
    } catch (error) {
      console.error('Error handling team action:', error);
    }
  };

  const handleLeavePress = async () => {
    try {
      await onLeavePress(team.id);
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(team.id)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          {team.logoUrl ? (
            <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} />
          ) : (
            <View style={[styles.teamLogo, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.logoText}>
                {team.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.teamInfo}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {team.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {team.sport}
            </Text>
          </View>
        </View>

        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurface }]}>
          {team.description}
        </Text>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {team.members?.length || 0}/{team.maxMembers} members
          </Text>

          <Button
            mode={isMember ? 'outlined' : 'contained'}
            onPress={isMember ? handleLeavePress : handleButtonPress}
            style={styles.joinButton}
            labelStyle={styles.buttonLabel}
          >
            {isMember ? 'Leave' : 'Join'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  joinButton: {
    borderRadius: 20,
    minWidth: 100,
  },
  buttonLabel: {
    fontSize: 14,
  },
});
