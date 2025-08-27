import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar/TopBar';
import Button from '../../components/Button/Button';
import InputBar from '../../components/InputBar/InputBar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Navigation will be handled by the AuthContext
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar text={'VU Sports Society'} />
      <View style={styles.formContainer}>
        <InputBar placeholder="Email" value={email} onChange={setEmail} />
        <InputBar
          value={password}
          onChange={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Button
            onPress={() => navigation.navigate('Register')}
            title={'Sign up'}
          />
          <Button
            onPress={() => Alert.alert('Coming Soon')}
            title={'Continue as Guest'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1a73e8',
  },
  formContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
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
  button: {
    backgroundColor: '#1A78E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#1a73e8',
    fontSize: 14,
  },
  buttonStyle: {
    backgroundColor: '#E8EDF2',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
