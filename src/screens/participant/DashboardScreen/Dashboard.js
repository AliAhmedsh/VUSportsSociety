import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// import { VictoryLine, VictoryChart, VictoryTheme, VictoryBar } from 'victory-native';

function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      {/* Top Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Participants</Text>
          <Text style={styles.statValue}>1,250</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Teams</Text>
          <Text style={styles.statValue}>75</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Upcoming Events</Text>
          <Text style={styles.statValue}>15</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending Approvals</Text>
          <Text style={styles.statValue}>5</Text>
        </View>
      </View>

      {/* Participant Growth */}
      <Text style={styles.sectionTitle}>Participant Growth</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Participant Growth</Text>
        <Text style={styles.cardStat}>+15%</Text>
        <Text style={styles.cardSubtitle}>
          Last 30 Days <Text style={{ color: 'green' }}>+15%</Text>
        </Text>
        {/* <VictoryChart theme={VictoryTheme.material}>
          <VictoryLine
            style={{ data: { stroke: "#1a73e8", strokeWidth: 3 } }}
            data={[
              { x: "Jan", y: 3 },
              { x: "Feb", y: 5 },
              { x: "Mar", y: 4 },
              { x: "Apr", y: 7 },
              { x: "May", y: 6 },
              { x: "Jun", y: 8 },
            ]}
          />
        </VictoryChart> */}
      </View>

      {/* Event Overview */}
      <Text style={styles.sectionTitle}>Event Overview</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Event Participation</Text>
        <Text style={styles.cardStat}>+10%</Text>
        <Text style={styles.cardSubtitle}>
          Last 30 Days <Text style={{ color: 'green' }}>+10%</Text>
        </Text>
        {/* <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
          <VictoryBar
            style={{ data: { fill: "#1a73e8", width: 30 } }}
            data={[
              { x: "Event 1", y: 3 },
              { x: "Event 2", y: 4 },
              { x: "Event 3", y: 5 },
            ]}
          />
        </VictoryChart> */}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.quickButton, styles.primaryButton]}>
          <Text style={styles.quickButtonTextPrimary}>Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton}>
          <Text style={styles.quickButtonText}>Manage Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickButton, styles.primaryButton]}>
          <Text style={styles.quickButtonTextPrimary}>Manage Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton}>
          <Text style={styles.quickButtonText}>View Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#E8EDF2',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D141C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
    color: '#0D141C',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0D141C',
  },
  cardStat: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D141C',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickButton: {
    width: '48%',
    borderRadius: 8,
    paddingVertical: 15,
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: '#E8EDF2',
  },
  primaryButton: {
    backgroundColor: '#1a73e8',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#0D141C',
    fontWeight: '600',
  },
  quickButtonTextPrimary: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});

export default Dashboard;
