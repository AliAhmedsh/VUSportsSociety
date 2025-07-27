import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { MD3Theme } from 'react-native-paper/lib/typescript/types';

interface SportFilterProps {
  sports: string[];
  selectedSport: string;
  onSelectSport: (sport: string) => void;
  theme: MD3Theme;
}

export const SportFilter: React.FC<SportFilterProps> = ({
  sports,
  selectedSport,
  onSelectSport,
  theme,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.sportFilterLabel, { color: theme.colors.onSurface }]}>
        Filter by Sport:
      </Text>
      <View style={styles.chipContainer}>
        <Button
          mode={selectedSport === '' ? 'contained' : 'outlined'}
          onPress={() => onSelectSport('')}
          style={[
            styles.chip,
            selectedSport === '' && { 
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
          labelStyle={{
            color: selectedSport === '' 
              ? theme.colors.onPrimary 
              : theme.colors.primary,
            fontSize: 12,
          }}
          compact
        >
          All Sports
        </Button>
        {sports.map((sport) => (
          <Button
            key={sport}
            mode={selectedSport === sport ? 'contained' : 'outlined'}
            onPress={() => onSelectSport(sport === selectedSport ? '' : sport)}
            style={[
              styles.chip,
              selectedSport === sport && { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
            labelStyle={{
              color: selectedSport === sport 
                ? theme.colors.onPrimary 
                : theme.colors.primary,
              fontSize: 12,
            }}
            compact
          >
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Button>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sportFilterLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    margin: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
