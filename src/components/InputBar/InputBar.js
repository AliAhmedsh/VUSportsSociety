import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function InputBar({ value, onChange, ...rest }) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Email"
      value={value}
      onChangeText={onChange}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#E8EDF2',
    paddingLeft: 10,
  },
});
