import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

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

export default function PassengerDetailsScreen({ navigation, route }) {
  const schedule = route?.params?.schedule || {
    busName: 'UBZ',
    busType: 'Semi-Luxury',
    from: 'Lusaka',
    to: 'Livingstone',
    depart: '6:00 AM',
    arrive: '11:00 AM',
    seatNumbers: ['1A'],
    pricePerSeat: 200,
  };

  const seatCount = schedule.seatNumbers?.length || 1;

  const [passengers, setPassengers] = useState(
    Array.from({ length: seatCount }, () => ({ fullName: '', phone: '', email: '' }))
  );

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const getCurrentDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleContinue = () => {
    const incomplete = passengers.find(p => !p.fullName.trim() || !p.phone.trim());
    if (incomplete) {
      Alert.alert('Error', 'Please fill in name and phone for all passengers.');
      return;
    }

    const totalAmount = (schedule.pricePerSeat || 0) * seatCount;
    navigation.navigate('PaymentConfirmation', {
      schedule: { ...schedule, date: schedule.date || getCurrentDate() },
      passengers,
      totalAmount,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Passenger Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tripSummary}>
          <Text style={styles.tripRoute}>{schedule.from} → {schedule.to}</Text>
          <Text style={styles.tripMeta}>
            {schedule.busName} · {schedule.depart} · Seats {schedule.seatNumbers?.join(', ')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {passengers.map((p, i) => (
            <View key={i} style={styles.passengerCard}>
              <View style={styles.passengerHeader}>
                <View style={styles.seatBadge}>
                  <MaterialIcons name="event-seat" size={14} color={COLORS.primary} />
                  <Text style={styles.seatBadgeText}>Seat {schedule.seatNumbers?.[i] || i + 1}</Text>
                </View>
                <Text style={styles.passengerNum}>Passenger {i + 1}</Text>
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.placeholder}
                  value={p.fullName}
                  onChangeText={v => updatePassenger(i, 'fullName', v)}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="phone" size={18} color={COLORS.blobCyan} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Mobile number"
                  placeholderTextColor={COLORS.placeholder}
                  value={p.phone}
                  onChangeText={v => updatePassenger(i, 'phone', v)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={18} color={COLORS.blobCyan} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email (optional)"
                  placeholderTextColor={COLORS.placeholder}
                  value={p.email}
                  onChangeText={v => updatePassenger(i, 'email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          ))}

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total ({seatCount} seat{seatCount > 1 ? 's' : ''})</Text>
            <Text style={styles.totalValue}>
              ZMW {((schedule.pricePerSeat || 0) * seatCount).toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue to Payment</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.root, overflow: 'hidden' },
  blobTop: {
    position: 'absolute', top: -100, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: COLORS.blobBlue, opacity: 0.15,
  },
  blobBottom: {
    position: 'absolute', bottom: '20%', left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: COLORS.blobCyan, opacity: 0.1,
  },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader },
  tripSummary: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: 16,
  },
  tripRoute: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader, marginBottom: 4 },
  tripMeta: { fontSize: 12, color: COLORS.textSecondary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  passengerCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 18, marginBottom: 16,
  },
  passengerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  seatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary + '22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  seatBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  passengerNum: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.inputBorder,
    paddingHorizontal: 14, height: 52, marginBottom: 10,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 14, color: COLORS.textHeader },
  totalCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary + '18', borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.primary + '44',
    padding: 16, marginBottom: 20,
  },
  totalLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  continueBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 17, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  continueBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
