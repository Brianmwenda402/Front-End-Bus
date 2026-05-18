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

export default function CreateAccountScreen({ navigation, route }) {
  const role = route?.params?.role || 'User';
  const isAdmin = role === 'Admin';
  const { setUser } = useUser();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isAdmin ? '/api/admins/register' : '/api/users/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
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

        Alert.alert(
          'Account Created',
          `Welcome, ${username}! Your ${isAdmin ? 'admin' : 'passenger'} account is ready.`,
          [{
            text: 'Continue',
            onPress: () => navigation.replace(isAdmin ? 'AdminHome' : 'UserMain'),
          }]
        );
      } else {
        Alert.alert('Registration Failed', data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
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
                name={isAdmin ? 'admin-panel-settings' : 'person-add'}
                size={14}
                color={isAdmin ? '#f472b6' : '#60a5fa'}
              />
              <Text style={[styles.rolePillText, isAdmin && styles.rolePillTextAdmin]}>
                {isAdmin ? 'Admin Account' : 'Passenger Account'}
              </Text>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {isAdmin
                ? 'Set up your admin profile to manage buses and bookings'
                : 'Join us to search routes and book bus seats'}
            </Text>

            <View style={styles.card}>
              <InputField 
                icon="person" 
                color={COLORS.primary} 
                placeholder="Username" 
                value={username} 
                onChangeText={setUsername}
                disabled={loading}
                autoCapitalize="none"
              />
              <InputField 
                icon="email" 
                color={COLORS.primary} 
                placeholder="Email address" 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address" 
                autoCapitalize="none"
                disabled={loading}
              />
              <InputField 
                icon="lock" 
                color={COLORS.blobCyan} 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                disabled={loading}
              />
              <InputField 
                icon="lock-outline" 
                color={COLORS.blobCyan} 
                placeholder="Confirm password" 
                value={confirmPass} 
                onChangeText={setConfirmPass}
                secureTextEntry={!showPass}
                disabled={loading}
              />

              <TouchableOpacity 
                style={styles.showPassRow} 
                onPress={() => setShowPass(v => !v)}
                disabled={loading}
              >
                <MaterialIcons 
                  name={showPass ? 'check-box' : 'check-box-outline-blank'} 
                  size={18} 
                  color={COLORS.primary} 
                />
                <Text style={styles.showPassText}>Show passwords</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, { opacity: loading ? 0.6 : 1 }]} 
                onPress={handleCreate} 
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Create Account</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.footerLink} onPress={() => navigation.navigate('Login', { role })}>
                  Sign In
                </Text>
              </Text>
            </View>

            {!isAdmin && (
              <TouchableOpacity
                style={styles.adminLink}
                onPress={() => navigation.navigate('CreateAccount', { role: 'Admin' })}
                disabled={loading}
              >
                <Text style={styles.adminLinkText}>Need an admin account instead?</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function InputField({ icon, color, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry, disabled }) {
  return (
    <View style={styles.inputContainer}>
      <View style={[styles.iconBadge, { backgroundColor: color + '22' }]}>
        <MaterialIcons name={icon} size={16} color={color} />
      </View>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={COLORS.placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'words'}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: COLORS.root, overflow: 'hidden' },
  blobTop: {
    position: 'absolute', top: -130, right: -90,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: COLORS.blobBlue, opacity: 0.18,
  },
  blobBottom: {
    position: 'absolute', bottom: -80, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: COLORS.blobCyan, opacity: 0.12,
  },
  safeContainer: { flex: 1, marginTop: Platform.OS === 'ios' ? 0 : 30 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  backBtn: {
    alignSelf: 'flex-start', marginBottom: 8,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  logoWrapper: { alignItems: 'center', marginBottom: 16 },
  logoBg: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#63cbf1', alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  busImage: { width: 50, height: 50 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#60a5fa22', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
  },
  rolePillAdmin: { backgroundColor: '#f472b622' },
  rolePillText: { fontSize: 12, fontWeight: '700', color: '#60a5fa' },
  rolePillTextAdmin: { color: '#f472b6' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textHeader, letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  card: {
    width: '100%', backgroundColor: COLORS.card, borderRadius: 28,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: 24,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', height: 54,
    borderColor: COLORS.inputBorder, borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 12, backgroundColor: COLORS.inputBg,
  },
  iconBadge: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  textInput: { flex: 1, fontSize: 14, color: COLORS.textHeader },
  showPassRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  showPassText: { fontSize: 13, color: COLORS.textSecondary },
  btn: {
    backgroundColor: COLORS.primary, width: '100%', paddingVertical: 17,
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  btnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  footerText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 13 },
  footerLink: { color: '#818cf8', fontWeight: '700' },
  adminLink: { marginTop: 20 },
  adminLinkText: { fontSize: 13, color: COLORS.textSecondary, textDecorationLine: 'underline' },
});