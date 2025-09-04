import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // You can swap with Ionicons/MaterialIcons
import TopBar from '../../components/TopBar/TopBar';

const sections = [
  {
    title: 'Account',
    data: [
      {
        id: '1',
        label: 'Personal Information',
        desc: 'Manage your personal information',
        icon: 'user',
      },
      {
        id: '2',
        label: 'Password',
        desc: 'Change your password',
        icon: 'lock',
      },
    ],
  },
  {
    title: 'Preferences',
    data: [
      {
        id: '3',
        label: 'App Preferences',
        desc: 'Manage your app preferences',
        icon: 'settings',
      },
    ],
  },
  {
    title: 'Notifications',
    data: [
      {
        id: '4',
        label: 'Event Notifications',
        desc: 'Manage event notifications',
        icon: 'bell',
      },
      {
        id: '5',
        label: 'Team Notifications',
        desc: 'Manage team activity notifications',
        icon: 'users',
      },
    ],
  },
  {
    title: 'Support',
    data: [
      {
        id: '6',
        label: 'Help & Support',
        desc: 'Get help and support',
        icon: 'help-circle',
      },
    ],
  },
];

const SettingsScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderColor: '#ddd',
      }}
    >
      <View
        style={{
          height: 48,
          width: 48,
          borderRadius: 10,
          backgroundColor: '#f5f5f5',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Icon name={item.icon} size={22} color="#333" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#0F1417' }}>
          {item.label}
        </Text>
        <Text style={{ fontSize: 14, color: '#5C708A' }}>{item.desc}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 }}
    >
      <TopBar text={'Settings'} />
      <FlatList
        data={sections}
        keyExtractor={(section, index) => index.toString()}
        renderItem={({ item: section }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
              {section.title}
            </Text>
            {section.data.map(setting => (
              <View key={setting.id}>{renderItem({ item: setting })}</View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
