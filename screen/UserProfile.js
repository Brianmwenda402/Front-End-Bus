import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { UserInfoBadge, UserStatusIndicator } from '../components/UserInfoBadge';

const COLORS = {
  root:          '#0f202a',
  blobBlue:      '#15b0db',
  blobCyan:      '#06b6d4',
  card:          '#1e293b',
  cardBorder:    '#334155',
  inputBg:       '#162032',
  textHeader:    '#f8fafc',
  textSecondary: '#94a3b8',
  primary:       '#6366f1',
  green:         '#4ade80',
  red:           '#f87171',
  white:         '#FFFFFF',
};

const menuItems = [
  { icon: 'email',           label: 'Email',           field: 'email',    color: COLORS.primary },
  { icon: 'phone',           label: 'Phone',           field: 'phone',    color: COLORS.blobCyan },
  { icon: 'confirmation-number', label: 'My Tickets',  action: 'tickets', color: COLORS.green },
  { icon: 'help-outline',    label: 'Help & Support',  action: 'help',    color: '#fbbf24' },
];

export default function UserProfile({ navigation }) {
  const { user, tickets, logout, authState } = useUser();
  
  const isAdmin = authState.userRole === 'Admin';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          const appNav = navigation.getParent()?.getParent()?.getParent();
          appNav?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const handleMenuPress = (item) => {
    if (item.action === 'tickets') {
      navigation.navigate('Tickets');
    } else if (item.action === 'help') {
      Alert.alert('Help', 'Contact support at support@transitx.zm');
    }
  };

  const initials = (user.fullName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <Text style={styles.screenTitle}>My Profile</Text>

          <View style={styles.profileCard}>
            <View style={[styles.avatar, isAdmin && styles.adminAvatar]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            
            <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
              <MaterialIcons 
                name={isAdmin ? 'admin-panel-settings' : 'person-add'} 
                size={12} 
                color={isAdmin ? '#f472b6' : '#60a5fa'} 
              />
              <Text style={[styles.roleBadgeText, isAdmin ? styles.roleBadgeAdminText : styles.roleBadgeUserText]}>
                {isAdmin ? 'Admin Account' : 'Passenger Account'}
              </Text>
            </View>

            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <View style={styles.authStatusContainer}>
              <MaterialIcons name="verified-user" size={16} color="#10b981" />
              <Text style={styles.authStatusText}>
                {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Text>
              {authState.loginTime && (
                <Text style={styles.authStatusTime}>
                  {formatLoginTime(authState.loginTime)}
                </Text>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{tickets.length}</Text>
                <Text style={styles.statLabel}>Tickets</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{authState.userRole || 'N/A'}</Text>
                <Text style={styles.statLabel}>Role</Text>
              </View>
            </View>
          </View>

          {!isAdmin && (
            <TouchableOpacity
              style={styles.bookBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Book')}
            >
              <MaterialIcons name="directions-bus" size={20} color={COLORS.white} />
              <Text style={styles.bookBtnText}>Book a Bus Ticket</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
                activeOpacity={0.8}
                onPress={() => item.action ? handleMenuPress(item) : null}
              >
                <View style={[styles.menuIconBg, { backgroundColor: item.color + '22' }]}>
                  <MaterialIcons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.field && (
                    <Text style={styles.menuValue}>{user[item.field]}</Text>
                  )}
                </View>
                {item.action && (
                  <MaterialIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color={COLORS.red} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatLoginTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.root, overflow: 'hidden' },
  blobTop: {
    position: 'absolute', top: -100, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: COLORS.primary, opacity: 0.12,
  },
  blobBottom: {
    position: 'absolute', bottom: '15%', left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: COLORS.blobCyan, opacity: 0.1,
  },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  screenTitle: {
    fontSize: 26, fontWeight: '800', color: COLORS.textHeader,
    marginTop: 16, marginBottom: 24, letterSpacing: -0.3,
  },
  profileCard: {
    backgroundColor: COLORS.card, borderRadius: 24,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    alignItems: 'center', padding: 28, marginBottom: 16,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  adminAvatar: {
    backgroundColor: '#f472b6',
    shadowColor: '#f472b6',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, marginBottom: 12,
  },
  roleBadgeUser: {
    backgroundColor: '#60a5fa22',
  },
  roleBadgeAdmin: {
    backgroundColor: '#f472b622',
  },
  roleBadgeText: {
    fontSize: 11, fontWeight: '600',
  },
  roleBadgeUserText: {
    color: '#60a5fa',
  },
  roleBadgeAdminText: {
    color: '#f472b6',
  },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.textHeader, marginBottom: 4 },
  userEmail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  authStatusContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.inputBg, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, marginBottom: 16,
  },
  authStatusText: { fontSize: 12, fontWeight: '600', color: '#10b981' },
  authStatusTime: { fontSize: 11, color: COLORS.textSecondary, marginLeft: 'auto' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32, width: '100%',
    justifyContent: 'center',
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.cardBorder },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16,
    marginBottom: 28,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  bookBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  menuCard: {
    backgroundColor: COLORS.card, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 24,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  menuIconBg: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  menuValue: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.red + '18', borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.red + '33', paddingVertical: 14,
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
