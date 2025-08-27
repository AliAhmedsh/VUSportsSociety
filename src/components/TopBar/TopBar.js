import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function TopBar({ text }) {
  const { goBack } = useNavigation();
  return (
    <View style={styles.container}>
      <Pressable style={styles.arrow} onPress={goBack}>
        <Icon name="arrow-back-outline" size={26} color="#000" />
      </Pressable>
      <Text style={styles.title}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 47,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    left: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
