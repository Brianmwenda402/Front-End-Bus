import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, Image,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = require('react-native').Dimensions.get('window');

const COLORS = {
  root:          '#0f202a',
  blobBlue:      '#15b0db',
  blobCyan:      '#06b6d4',
  card:          '#1e293b',
  cardBorder:    '#334155',
  textHeader:    '#f8fafc',
  textSecondary: '#94a3b8',
  primary:       '#6366f1',
  inputBg:       '#162032',
  inputBorder:   '#334155',
  placeholder:   '#475569',
  white:         '#FFFFFF',
};

const API_BASE_URL = "http://10.26.129.86:8089";

export default function LoginScreen({ navigation, route }) {
  const role = route?.params?.role || 'User';
  const isAdmin = role === 'Admin';
  const { setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isAdmin ? '/api/admins/login' : '/api/users/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          role: isAdmin ? 'Admin' : 'User',
        });

        Alert.alert('Success', `Welcome back, ${data.username}!`, [
          {
            text: 'Continue',
            onPress: () => navigation.replace(isAdmin ? 'AdminHome' : 'UserMain'),
          }
        ]);
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => {
    navigation.navigate('CreateAccount', { role });
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={28} color={COLORS.textHeader} />
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <View style={styles.glowRing} />
              <View style={styles.logoBg}>
                <Image
                  source={require('../images/bus.png')}
                  style={styles.busImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={[styles.rolePill, isAdmin && styles.rolePillAdmin]}>
              <MaterialIcons
                name={isAdmin ? 'admin-panel-settings' : 'person'}
                size={14}
                color={isAdmin ? '#f472b6' : '#60a5fa'}
              />
              <Text style={[styles.rolePillText, isAdmin && styles.rolePillTextAdmin]}>
                {isAdmin ? 'Admin Login' : 'Passenger Login'}
              </Text>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? 'Sign in to manage the system' : 'Sign in to book your bus seat'}
            </Text>

            <View style={styles.card}>

              <View style={styles.inputContainer}>
                <View style={styles.iconBadge}>
                  <MaterialIcons name="email" size={16} color={COLORS.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={[styles.iconBadge, { backgroundColor: COLORS.blobCyan + '22' }]}>
                  <MaterialIcons name="lock" size={16} color={COLORS.blobCyan} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor={COLORS.placeholder}
                  secureTextEntry={!showPass}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPass(v => !v)} 
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  disabled={loading}
                >
                  <MaterialIcons
                    name={showPass ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.btn, { opacity: loading ? 0.6 : 1 }]} 
                onPress={handleLogin} 
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Sign In</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.footerLink} onPress={goToSignUp}>Create Account</Text>
              </Text>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.root,
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    top: -130,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.blobBlue,
    opacity: 0.18,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.blobCyan,
    opacity: 0.12,
  },
  safeContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : 30,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
  },
  logoBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#63cbf1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  busImage: {
    width: 56,
    height: 56,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#60a5fa22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  rolePillAdmin: {
    backgroundColor: '#f472b622',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60a5fa',
  },
  rolePillTextAdmin: {
    color: '#f472b6',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textHeader,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: COLORS.inputBg,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textHeader,
  },
  btn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 17,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    color: '#818cf8',
    fontWeight: '700',
  },
});