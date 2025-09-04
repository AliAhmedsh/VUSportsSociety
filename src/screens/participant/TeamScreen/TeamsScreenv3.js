import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import TopBar from '../../../components/TopBar/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';

const TeamsScreenv3 = () => {
  const events = [
    {
      id: '1',
      title: 'VU Sports Cup',
      subtitle: 'Football Tournament',
      category: 'Football',
      image:
        'https://firebasestorage.googleapis.com/v0/b/the-grammobile.appspot.com/o/testing.png?alt=media&token=0fe60210-c9ec-49f2-9f63-61419281de96',
    },
    {
      id: '2',
      title: 'Inter-University League',
      subtitle: 'Basketball Match',
      category: 'Basketball',
      image:
        'https://firebasestorage.googleapis.com/v0/b/the-grammobile.appspot.com/o/testing.png?alt=media&token=0fe60210-c9ec-49f2-9f63-61419281de96',
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
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Teams</Text>
      <View style={{}}>
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EventCard {...item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <TouchableOpacity
        style={{
          height: 56,
          backgroundColor: '#B2C9E5',
          width: '40%',
          borderRadius: 12,
          position: 'absolute',
          bottom: 20,
          right: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="add" size={24} color="#0F1417" />
          <Text style={{ fontSize: 16, color: '#0F1417', fontWeight: 'bold' }}>
            Create Team
          </Text>
        </View>
      </TouchableOpacity>
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
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

export default TeamsScreenv3;
