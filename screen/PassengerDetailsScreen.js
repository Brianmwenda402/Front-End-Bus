import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, Platform, ScrollView, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import CONFIG from '../config/config';

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
  green:         '#4ade80',
  red:           '#f87171',
};

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api`;

export default function PassengerDetailsScreen({ navigation, route }) {
  const { user } = useUser();
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

  const [passengers, setPassengers] = useState([]);
  const [savedPassengers, setSavedPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    fetchSavedPassengers();
    // Initialize with empty passengers based on seat count
    setPassengers(
      Array.from({ length: seatCount }, () => ({ fullName: '', nrc: '' }))
    );
  }, [seatCount]);

  const fetchSavedPassengers = async () => {
    if (!user?.id) {
      console.warn('User ID not available');
      return;
    }
    try {
      const url = `${API_BASE_URL}/passengers/user/${user.id}`;
      console.log('Fetching saved passengers from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Saved passengers:', data);
      setSavedPassengers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching passengers:', error);
      Alert.alert('Error', 'Failed to load saved passengers');
    }
  };

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addNewPassenger = () => {
    setPassengers([...passengers, { fullName: '', nrc: '' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > seatCount) {
      setPassengers(passengers.filter((_, i) => i !== index));
    } else {
      Alert.alert('Error', 'You need at least one passenger per seat');
    }
  };

  const useSavedPassenger = (passenger) => {
    const newIndex = passengers.findIndex(p => !p.fullName.trim());
    if (newIndex !== -1) {
      updatePassenger(newIndex, 'fullName', passenger.fullName);
      updatePassenger(newIndex, 'nrc', passenger.nrc);
      setShowSavedModal(false);
    } else {
      Alert.alert('Info', 'All passenger seats are filled');
    }
  };

  const savePassengerProfile = async (index) => {
    const passenger = passengers[index];
    
    if (!passenger.fullName.trim() || !passenger.nrc.trim()) {
      Alert.alert('Error', 'Please fill all fields before saving');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      setLoading(true);
      
      const url = `${API_BASE_URL}/passengers/create`;
      console.log('Saving passenger to:', url);
      
      const payload = {
        userId: user.id,
        fullName: passenger.fullName.trim(),
        nrc: passenger.nrc.trim(),
      };
      console.log('Payload:', payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        Alert.alert('Success', 'Passenger saved to your profile');
        await fetchSavedPassengers();
      } else {
        Alert.alert('Error', responseData.error || 'Failed to save passenger');
      }
    } catch (error) {
      console.error('Error saving passenger:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleContinue = () => {
    const incomplete = passengers.slice(0, seatCount).find(p => !p.fullName.trim() || !p.nrc.trim());
    if (incomplete) {
      Alert.alert('Error', 'Please fill in full name and NRC for all passengers.');
      return;
    }

    const totalAmount = (schedule.pricePerSeat || 0) * seatCount;
    navigation.navigate('PaymentConfirmation', {
      schedule: { ...schedule, date: schedule.date || getCurrentDate() },
      passengers: passengers.slice(0, seatCount),
      totalAmount,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={26} color={COLORS.textHeader} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Passenger Details</Text>
          <TouchableOpacity
            style={styles.savedBtn}
            onPress={() => setShowSavedModal(true)}
          >
            <MaterialIcons name="bookmark" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Trip Summary */}
        <View style={styles.tripSummary}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripRoute}>{schedule.from} → {schedule.to}</Text>
            <Text style={styles.tripMeta}>
              {schedule.busName} · {schedule.depart}
            </Text>
          </View>
          <View style={styles.seatsInfo}>
            <MaterialIcons name="event-seat" size={18} color={COLORS.primary} />
            <Text style={styles.seatsCount}>{seatCount} seat{seatCount > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'new' && styles.tabActive]}
            onPress={() => setActiveTab('new')}
          >
            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
              New Passengers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved ({savedPassengers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'new' ? (
            <>
              {passengers.map((p, i) => (
                <View key={i} style={styles.passengerCard}>
                  <View style={styles.passengerHeader}>
                    <View style={styles.seatBadge}>
                      <MaterialIcons name="event-seat" size={14} color={COLORS.white} />
                      <Text style={styles.seatBadgeText}>Seat {schedule.seatNumbers?.[i] || i + 1}</Text>
                    </View>
                    {passengers.length > seatCount && (
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removePassenger(i)}
                      >
                        <MaterialIcons name="close" size={16} color={COLORS.red} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Full Name Input */}
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

                  {/* NRC Input */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="badge" size={18} color={COLORS.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="NRC (e.g., 123456/89/1)"
                      placeholderTextColor={COLORS.placeholder}
                      value={p.nrc}
                      onChangeText={v => updatePassenger(i, 'nrc', v)}
                      autoCapitalize="characters"
                    />
                  </View>

                  {/* Save Passenger Button */}
                  {p.fullName.trim() && p.nrc.trim() && (
                    <TouchableOpacity
                      style={[styles.savePassengerBtn, { opacity: loading ? 0.6 : 1 }]}
                      onPress={() => savePassengerProfile(i)}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.primary} size="small" />
                      ) : (
                        <>
                          <MaterialIcons name="bookmark-border" size={16} color={COLORS.primary} />
                          <Text style={styles.savePassengerText}>Save to Profile</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Add More Passengers Button */}
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={addNewPassenger}
              >
                <MaterialIcons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.addMoreText}>Add More Passengers</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {savedPassengers.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="person-outline" size={56} color={COLORS.cardBorder} />
                  <Text style={styles.emptyTitle}>No saved passengers</Text>
                  <Text style={styles.emptySub}>Add passengers and save them for quick booking</Text>
                </View>
              ) : (
                savedPassengers.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.savedPassengerCard}
                    onPress={() => useSavedPassenger(p)}
                  >
                    <View style={styles.savedPassengerInfo}>
                      <MaterialIcons name="person-check" size={24} color={COLORS.green} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.savedName}>{p.fullName}</Text>
                        <Text style={styles.savedNrc}>{p.nrc}</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Total Card */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>Total ({seatCount} seat{seatCount > 1 ? 's' : ''})</Text>
              <Text style={styles.totalValue}>
                ZMW {((schedule.pricePerSeat || 0) * seatCount).toLocaleString()}
              </Text>
            </View>
            <MaterialIcons name="info-outline" size={20} color={COLORS.primary} />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue to Payment</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Saved Passengers Modal */}
      <Modal visible={showSavedModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Saved Passengers</Text>
              <TouchableOpacity onPress={() => setShowSavedModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            {savedPassengers.length === 0 ? (
              <View style={styles.emptyModal}>
                <MaterialIcons name="bookmark-outline" size={48} color={COLORS.cardBorder} />
                <Text style={styles.emptyModalText}>No saved passengers yet</Text>
              </View>
            ) : (
              <FlatList
                data={savedPassengers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.modalPassengerCard}>
                    <View style={styles.modalPassengerInfo}>
                      <Text style={styles.modalPassengerName}>{item.fullName}</Text>
                      <Text style={styles.modalPassengerNrc}>{item.nrc}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.selectPassengerBtn}
                      onPress={() => useSavedPassenger(item)}
                    >
                      <MaterialIcons name="add-circle" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={true}
              />
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader },
  savedBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  tripSummary: {
    marginHorizontal: 20, marginVertical: 16,
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tripInfo: { flex: 1 },
  tripRoute: { fontSize: 15, fontWeight: '800', color: COLORS.textHeader, marginBottom: 4 },
  tripMeta: { fontSize: 12, color: COLORS.textSecondary },
  seatsInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seatsCount: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  tabsContainer: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderBottomWidth: 2,
    borderBottomColor: 'transparent', alignItems: 'center',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
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
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  seatBadgeText: { fontSize: 12, color: COLORS.white, fontWeight: '700' },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.red + '22', alignItems: 'center', justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.inputBorder,
    paddingHorizontal: 14, height: 52, marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 14, color: COLORS.textHeader },
  savePassengerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary + '18', borderRadius: 10,
    paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary + '44',
  },
  savePassengerText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 12, marginBottom: 20,
  },
  addMoreText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  emptyState: {
    alignItems: 'center', paddingVertical: 60,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader, marginTop: 16 },
  emptySub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
  savedPassengerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 14, marginBottom: 10,
  },
  savedPassengerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  savedName: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  savedNrc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  totalCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary + '18', borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.primary + '44',
    padding: 16, marginBottom: 20,
  },
  totalLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  continueBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 17, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10, marginBottom: 20,
  },
  continueBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.root, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader },
  emptyModal: { alignItems: 'center', paddingVertical: 60 },
  emptyModalText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12 },
  modalPassengerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  modalPassengerInfo: { flex: 1 },
  modalPassengerName: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  modalPassengerNrc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  selectPassengerBtn: { padding: 8 },
});