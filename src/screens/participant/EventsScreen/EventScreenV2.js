import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Button from '../../../components/Button/Button';
import TopBar from '../../../components/TopBar/TopBar';

// Dummy categories
const categories = ['All', 'Football', 'Basketball', 'Tennis'];

// Dummy events
const events = [
  {
    id: '1',
    title: 'VU Sports Cup',
    subtitle: 'Football Tournament',
    category: 'Football',
    image: 'https://i.ibb.co/n6J0tVj/football.jpg',
  },
  {
    id: '2',
    title: 'Inter-University League',
    subtitle: 'Basketball Match',
    category: 'Basketball',
    image: 'https://i.ibb.co/xL9n7HQ/basketball.jpg',
  },
  {
    id: '3',
    title: "Beginner's Clinic",
    subtitle: 'Tennis Session',
    category: 'Tennis',
    image: 'https://i.ibb.co/cNH6fb6/tennis.jpg',
  },
  {
    id: '4',
    title: 'Friendly Game',
    subtitle: 'Football Match',
    category: 'Football',
    image: 'https://i.ibb.co/F3mL4F0/football-field.jpg',
  },
];

// 🔹 Category Filter Component
const CategoryFilter = ({ selected, onSelect }) => (
  <View style={styles.filterRow}>
    {categories.map(cat => (
      <Button
        style={[styles.filterBtn, selected === cat && styles.activeFilter]}
        onPress={() => onSelect(cat)}
        title={cat}
        textStyle={{ color: selected === cat ? 'white' : 'black' }}
      />
    ))}
  </View>
);

// 🔹 Event Card Component
const EventCard = ({ title, subtitle, image }) => (
  <View style={styles.card}>
    <Image source={{ uri: image }} style={styles.cardImage} />
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

// 🔹 Main Events Screen
export default function EventsScreenv2() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents =
    selectedCategory === 'All'
      ? events
      : events.filter(e => e.category === selectedCategory);

  return (
    <View style={{ flex: 1 }}>
      <TopBar text={'Events'} />
      <View style={styles.container}>
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EventCard {...item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 16,
    marginTop: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingVertical: 8,
    marginVertical: 4,
  },
  activeFilter: {
    backgroundColor: '#000',
  },
  filterText: {
    color: '#000',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
});
