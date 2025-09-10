import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Sample data for the chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [45, 55, 42, 58, 35, 65, 48],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(136, 136, 136, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1a73e8',
    },
  };

  const statsCards = [
    { title: 'Total\nParticipants', value: '1,250', color: '#f0f0f0' },
    { title: 'Active Teams', value: '75', color: '#f0f0f0' },
    { title: 'Upcoming\nEvents', value: '15', color: '#f0f0f0' },
    { title: 'Pending\nApprovals', value: '5', color: '#f0f0f0' },
  ];

  const eventData = [
    { name: 'Event 1', participation: 85 },
    { name: 'Event 2', participation: 65 },
    { name: 'Event 3', participation: 45 },
  ];

  const quickActions = [
    { title: 'Manage Users', color: '#1a73e8', textColor: '#fff' },
    { title: 'Manage Events', color: '#f0f0f0', textColor: '#333' },
    { title: 'Manage Teams', color: '#1a73e8', textColor: '#fff' },
    { title: 'View Reports', color: '#f0f0f0', textColor: '#333' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.hamburger}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </View>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statsCards.map((card, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: card.color }]}>
            <Text style={styles.statTitle}>{card.title}</Text>
            <Text style={styles.statValue}>{card.value}</Text>
          </View>
        ))}
      </View>

      {/* Participant Growth Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Participant Growth</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Participant Growth</Text>
            <Text style={styles.growthPercentage}>+15%</Text>
            <Text style={styles.growthSubtext}>Last 30 Days +15%</Text>
          </View>
          <LineChart
            data={chartData}
            width={width - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        </View>
      </View>

      {/* Event Overview */}
      <View style={styles.eventSection}>
        <Text style={styles.sectionTitle}>Event Overview</Text>
        <View style={styles.eventContainer}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>Event Participation</Text>
            <Text style={styles.eventPercentage}>+10%</Text>
            <Text style={styles.eventSubtext}>Last 30 Days +10%</Text>
          </View>
          <View style={styles.eventBars}>
            {eventData.map((event, index) => (
              <View key={index} style={styles.eventBarContainer}>
                <View style={styles.eventBar}>
                  <View 
                    style={[
                      styles.eventBarFill, 
                      { height: `${event.participation}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.eventBarLabel}>{event.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={() => {
                // Handle navigation based on action
                if (action.title === 'Manage Events') {
                  navigation.navigate('Main', { screen: 'Events' });
                } else if (action.title === 'Manage Teams') {
                  navigation.navigate('Main', { screen: 'Teams' });
                } else if (action.title === 'View Reports') {
                  navigation.navigate('Main', { screen: 'Profile' });
                }
              }}
            >
              <Text style={[styles.actionButtonText, { color: action.textColor }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
  },
  hamburger: {
    marginRight: 16,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    marginRight: '3%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  chartSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  growthPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  growthSubtext: {
    fontSize: 12,
    color: '#1a73e8',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  eventSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  eventContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  eventHeader: {
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  eventPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventSubtext: {
    fontSize: 12,
    color: '#1a73e8',
  },
  eventBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  eventBarContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  eventBar: {
    width: 40,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  eventBarFill: {
    backgroundColor: '#8e8e8e',
    width: '100%',
  },
  eventBarLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '47%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreen;