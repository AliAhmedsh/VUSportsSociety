import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Button from '../../components/Button/Button';
import TopBar from '../../components/TopBar/TopBar';

const tabs = ['All', 'Individual', 'Team'];
const filters = ['All Sports', 'Basketball', 'Football'];

const topPlayers = [
  {
    id: '1',
    name: 'Ethan Carter',
    points: 1200,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Olivia Bennett',
    points: 1150,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Noah Thompson',
    points: 1100,
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
];

const topTeams = [
  {
    id: '1',
    name: 'The Strikers',
    wins: 15,
    logo: 'https://firebasestorage.googleapis.com/v0/b/the-grammobile.appspot.com/o/testing.png?alt=media&token=0fe60210-c9ec-49f2-9f63-61419281de96',
  },
  {
    id: '2',
    name: 'Net Rippers',
    wins: 14,
    logo: 'https://firebasestorage.googleapis.com/v0/b/the-grammobile.appspot.com/o/testing.png?alt=media&token=0fe60210-c9ec-49f2-9f63-61419281de96',
  },
  {
    id: '3',
    name: 'Court Aces',
    wins: 13,
    logo: 'https://firebasestorage.googleapis.com/v0/b/the-grammobile.appspot.com/o/testing.png?alt=media&token=0fe60210-c9ec-49f2-9f63-61419281de96',
  },
];

const LeaderboardScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All Sports');

  const renderPlayer = ({ item }) => (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: 56, height: 56, borderRadius: 25, marginRight: 12 }}
      />
      <View>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#0F1417' }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: '#5C708A' }}>
          {item.points} points
        </Text>
      </View>
    </View>
  );

  const renderTeam = ({ item }) => (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
    >
      <Image
        source={{ uri: item.logo }}
        style={{ width: 56, height: 56, borderRadius: 10, marginRight: 12 }}
      />
      <View>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#0F1417' }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: '#5C708A' }}>{item.wins} wins</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Tabs */}
      <TopBar text={'Leaderboards'} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginBottom: 10,
          height: 54,
          alignItems: 'center',
          borderBottomColor: '#D4DBE3',
          borderBottomWidth: 1,
          paddingHorizontal: 16,
        }}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ marginHorizontal: 10 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === tab ? '700' : '400',
                color: activeTab === tab ? '#0F1417' : '#5C708A',
                fontWeight: 'bold',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <View
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: 'row', marginTop: 15 }}
        >
          {filters.map(filter => (
            <Button
              title={filter}
              style={{
                backgroundColor:
                  activeFilter === filter ? '#EBEDF2' : '#EBEDF2',
                marginRight: 10,
                borderRadius: 12,
              }}
            />
          ))}
        </View>

        {/* Top Players */}
        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 20 }}>
          Top Players
        </Text>
        <View>
          <FlatList
            data={topPlayers}
            keyExtractor={item => item.id}
            renderItem={renderPlayer}
          />
        </View>

        {/* Top Teams */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          Top Teams
        </Text>
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={topTeams}
            keyExtractor={item => item.id}
            renderItem={renderTeam}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LeaderboardScreen;
