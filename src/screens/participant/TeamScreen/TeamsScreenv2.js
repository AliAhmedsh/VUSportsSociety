import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  Touchable,
  View,
} from 'react-native';
import TopBar from '../../../components/TopBar/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';

const TeamsScreenv2 = () => {
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
  ];

  const EventCard = ({ title, subtitle, image }) => (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar text={'My Teams'} />
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Joined Teams</Text>
      <View>
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EventCard {...item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Text style={styles.sectionTitle}>Create or Join</Text>
      <View style={{ gap: 10, marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 40,
              aspectRatio: 1,
              backgroundColor: '#EBEDF2',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="add" size={26} color="#000" />
          </View>
          <Text style={{ fontSize: 16, color: '#0F1417', fontWeight: '400' }}>
            Create a New Team
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 40,
              aspectRatio: 1,
              backgroundColor: '#EBEDF2',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="person-outline" size={26} color="#000" />
          </View>
          <Text style={{ fontSize: 16, color: '#0F1417', fontWeight: '400' }}>
            Join a Team
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: '#0F1417',
    fontSize: 18,
    fontWeight: 700,
  },
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
    backgroundColor: '#F7F9FC',
    marginBottom: 12,
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

export default TeamsScreenv2;
