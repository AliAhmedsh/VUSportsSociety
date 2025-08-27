import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../navigation/types';
import TopBar from '../../components/TopBar/TopBar';
import InputBar from '../../components/InputBar/InputBar';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');

  // const [role, setRole] =
  //   (useState < 'participant') | ('coach' > 'participant');

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, displayName, role);
      Alert.alert(
        'Registration Successful',
        role === 'coach'
          ? 'Your account is pending approval from an administrator.'
          : 'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TopBar text={'VU Sports Society'} />
        <View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              textAlign: 'center',
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            Join our community of sports enthusiasts at Virtual University.
          </Text>
        </View>
        <View style={styles.formContainer}>
          <InputBar
            value={displayName}
            onChange={setDisplayName}
            placeholder="Full Name"
            autoCapitalize="words"
          />
          <InputBar
            value={email}
            onChange={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={itemValue => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Participant" value="participant" />
              <Picker.Item label="Coach" value="coach" />
            </Picker>
          </View>
          <InputBar
            value={password}
            onChange={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <InputBar
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Register'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Already have an account? Login here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1a73e8',
  },
  formContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
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
    color: '#4F7096',
    fontSize: 14,
  },
});
