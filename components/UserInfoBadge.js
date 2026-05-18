import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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
  success:       '#10b981',
  warning:       '#f59e0b',
};

export function UserInfoBadge({ onPress, compact = false }) {
  const { authState, user } = useUser();

  if (!authState.isAuthenticated) {
    return (
      <View style={[styles.badge, styles.notAuthenticated]}>
        <MaterialIcons name="person-off" size={14} color={COLORS.textSecondary} />
        <Text style={styles.badgeText}>Not Logged In</Text>
      </View>
    );
  }

  const isAdmin = authState.userRole === 'Admin';
  const displayName = user?.fullName || authState.email?.split('@')[0] || 'User';

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.badge, isAdmin ? styles.adminBadge : styles.userBadge]}
        onPress={onPress}
      >
        <MaterialIcons 
          name={isAdmin ? 'admin-panel-settings' : 'person'} 
          size={14} 
          color={isAdmin ? '#f472b6' : '#60a5fa'} 
        />
        <Text style={styles.badgeText}>{displayName}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.fullBadge, isAdmin ? styles.adminFullBadge : styles.userFullBadge]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, isAdmin ? styles.adminAvatar : styles.userAvatar]}>
          <MaterialIcons 
            name={isAdmin ? 'admin-panel-settings' : 'person'} 
            size={20} 
            color="white" 
          />
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.fullName}>{displayName}</Text>
        <Text style={styles.email}>{authState.email}</Text>
        <View style={styles.roleContainer}>
          <View style={[styles.rolePill, isAdmin ? styles.roleAdminPill : styles.roleUserPill]}>
            <Text style={[styles.roleText, isAdmin ? styles.roleAdminText : styles.roleUserText]}>
              {isAdmin ? 'Admin Account' : 'Passenger Account'}
            </Text>
          </View>
          <Text style={styles.loginTime}>
            Logged in: {formatLoginTime(authState.loginTime)}
          </Text>
        </View>
      </View>

      {onPress && (
        <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

export function UserStatusIndicator() {
  const { authState, user } = useUser();

  if (!authState.isAuthenticated) {
    return null;
  }

  const isAdmin = authState.userRole === 'Admin';

  return (
    <View style={styles.statusIndicator}>
      <View style={[styles.statusDot, isAdmin ? styles.adminDot : styles.userDot]} />
      <Text style={styles.statusText}>
        {isAdmin ? 'Admin' : 'User'} • {user?.fullName || 'User'}
      </Text>
    </View>
  );
}

function formatLoginTime(isoString) {
  if (!isoString) return 'Today';
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  notAuthenticated: {
    backgroundColor: COLORS.card + '88',
    borderColor: COLORS.textSecondary + '33',
  },
  adminBadge: {
    backgroundColor: '#f472b622',
    borderColor: '#f472b644',
  },
  userBadge: {
    backgroundColor: '#60a5fa22',
    borderColor: '#60a5fa44',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textHeader,
  },
  fullBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  adminFullBadge: {
    borderColor: '#f472b644',
    backgroundColor: '#f472b611',
  },
  userFullBadge: {
    borderColor: '#60a5fa44',
    backgroundColor: '#60a5fa11',
  },
  avatarContainer: {
    marginRight: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  adminAvatar: {
    backgroundColor: '#f472b6',
  },
  userAvatar: {
    backgroundColor: '#60a5fa',
  },
  infoContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  roleContainer: {
    gap: 4,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleAdminPill: {
    backgroundColor: '#f472b622',
  },
  roleUserPill: {
    backgroundColor: '#60a5fa22',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleAdminText: {
    color: '#f472b6',
  },
  roleUserText: {
    color: '#60a5fa',
  },
  loginTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  adminDot: {
    backgroundColor: '#f472b6',
  },
  userDot: {
    backgroundColor: '#60a5fa',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textHeader,
    fontWeight: '600',
  },
});
