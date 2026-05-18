import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  root: '#0f202a',
  blobBlue: '#5C90EB',
  blobCyan: '#589BF2',
  card: '#1e293b',
  cardBorder: '#334155',
  textHeader: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#5C90EB',
  green: '#4ade80',
  white: '#FFFFFF',
};

export default function BookingSuccessScreen({ navigation, route }) {
  const { schedule, passengers } = route?.params || {};

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color={COLORS.green} />
          </View>

          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>Your tickets are ready</Text>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Bus:</Text>
              <Text style={styles.value}>{schedule?.busName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Route:</Text>
              <Text style={styles.value}>{schedule?.from} -{schedule?.to}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{schedule?.depart} - {schedule?.arrive}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Seats:</Text>
              <Text style={styles.value}>{schedule?.seatNumbers?.join(', ')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Total:</Text>
              <Text style={[styles.value, { color: COLORS.green, fontWeight: '800' }]}>
                K {schedule?.pricePerSeat * (schedule?.seatNumbers?.length || 1)}
              </Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.viewBtn}
              onPress={() => navigation.navigate('YourTicket', { schedule, passengers })}
            >
              <MaterialIcons name="receipt" size={18} color={COLORS.white} />
              <Text style={styles.viewBtnText}>View Ticket</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.homeBtn}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'UserTabs', params: { screen: 'Book' } }],
                })
              }
            >
              <Text style={styles.homeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.root,
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.blobBlue,
    opacity: 0.15,
  },
  blobBottom: {
    position: 'absolute',
    bottom: '20%',
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.blobCyan,
    opacity: 0.1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  details: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    color: COLORS.textHeader,
    fontWeight: '700',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  viewBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  viewBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  homeBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
