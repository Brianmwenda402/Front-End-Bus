import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { seatStorage } from '../utils/seatStorage';
import { bookingsApi } from '../api/api';

const COLORS = {
  root: '#0f172a',
  blobBlue: '#5C90EB',
  blobCyan: '#589BF2',
  card: '#1e293b',
  cardBorder: '#334155',
  textHeader: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#5C90EB',
  inputBg: '#162032',
  seatBooked: '#f87171',
  seatSelected: '#4ade80',
  seatAvailable: '#334155',
  white: '#FFFFFF',
};

const seatRows = [
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'gap', 'a', 'a', 'a'],
  ['a', 'a', 'a', 'a', 'a', 'a'],
];

const extractSeatNumbers = (seatStatusResponse) => {
  const extracted = [];

  const collectSeat = (candidate) => {
    const numeric = Number(candidate);
    if (Number.isInteger(numeric) && numeric > 0) {
      extracted.push(numeric);
    }
  };

  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value === 'number' || typeof value === 'string') {
      collectSeat(value);
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    if (value.seatNumber != null) {
      collectSeat(value.seatNumber);
      return;
    }

    if (value.seat != null) {
      collectSeat(value.seat);
      return;
    }

    if (Array.isArray(value.bookedSeats)) {
      value.bookedSeats.forEach(visit);
      return;
    }

    if (Array.isArray(value.occupiedSeats)) {
      value.occupiedSeats.forEach(visit);
      return;
    }

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (nestedValue === true) {
        collectSeat(key);
      } else {
        visit(nestedValue);
      }
    });
  };

  visit(seatStatusResponse);

  return [...new Set(extracted)];
};

export default function SelectSeatsScreen({ navigation, route }) {
  const selectedBus = route?.params?.bus || {
    name: 'POWER TOOLS',
    type: 'Time bus',
    timeFrom: '5:00 AM',
    timeTo: '12:00 PM',
    duration: '5h',
    price: 'ZMW 500',
    from: 'LUSAKA',
    to: 'CHIPATA',
  };

  const [selected, setSelected] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState([]);
  const [loadingSeatStatus, setLoadingSeatStatus] = useState(false);

  const selectedBusTripId = selectedBus?.id;

  useEffect(() => {
    const loadTripSeatStatus = async () => {
      if (!selectedBusTripId) {
        return;
      }

      setLoadingSeatStatus(true);
      try {
        const response = await bookingsApi.getTripSeatsStatus(selectedBusTripId);
        const parsedSeatNumbers = extractSeatNumbers(response);
        setBookedSeatNumbers(parsedSeatNumbers);
      } catch (error) {
        console.error('Failed to fetch trip seat status:', error);
      } finally {
        setLoadingSeatStatus(false);
      }
    };

    loadTripSeatStatus();
  }, [selectedBusTripId]);

  const bookedSeatSet = useMemo(() => new Set(bookedSeatNumbers), [bookedSeatNumbers]);

  const getSeatName = (rowIndex, seatIndex) => {
    const row = rowIndex + 1;
    const rowPattern = seatRows[rowIndex] || [];
    const seatLetters = rowPattern.includes('gap')
      ? ['A', 'B', null, 'D', 'E', 'F']
      : ['A', 'B', 'C', 'D', 'E', 'F'];

    return `${row}${seatLetters[seatIndex] || ''}`;
  };

  const getSeatNumber = (rowIndex, seatIndex) => {
    let seatNumber = 0;

    for (let i = 0; i < seatRows.length; i += 1) {
      for (let j = 0; j < seatRows[i].length; j += 1) {
        if (seatRows[i][j] === 'gap') {
          continue;
        }

        seatNumber += 1;

        if (i === rowIndex && j === seatIndex) {
          return seatNumber;
        }
      }
    }

    return null;
  };

  const toggleSeat = (rowIndex, seatIndex, seatType) => {
    if (seatType === 'gap') {
      return;
    }

    const seatName = getSeatName(rowIndex, seatIndex);
    const seatNumber = getSeatNumber(rowIndex, seatIndex);
    const key = `${rowIndex}-${seatIndex}`;

    if (seatType === 'b') {
      Alert.alert('Seat Unavailable', `${seatName} is already booked.`);
      return;
    }

    if (seatStorage.isReserved(seatName)) {
      Alert.alert('Seat Unavailable', `${seatName} has been temporarily reserved.`);
      return;
    }

    if (seatNumber && bookedSeatSet.has(seatNumber)) {
      Alert.alert('Seat Unavailable', `${seatName} is already booked.`);
      return;
    }

    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleReserve = () => {
    if (selected.length === 0) {
      Alert.alert('Error', 'Please select at least one seat');
      return;
    }

    setShowBookingModal(true);
  };

  const proceedWithBooking = (option) => {
    const selectedSeats = selected
      .slice()
      .sort((a, b) => {
        const [aRow, aSeat] = a.split('-').map(Number);
        const [bRow, bSeat] = b.split('-').map(Number);
        return aRow === bRow ? aSeat - bSeat : aRow - bRow;
      })
      .map((key) => {
        const [rowIdx, seatIdx] = key.split('-').map(Number);
        return {
          seatLabel: getSeatName(rowIdx, seatIdx),
          seatNumber: getSeatNumber(rowIdx, seatIdx),
        };
      });

    const seatNumbers = selectedSeats.map((item) => item.seatLabel);
    const seatNumbersNumeric = selectedSeats
      .map((item) => item.seatNumber)
      .filter((value) => Number.isInteger(value));

    seatStorage.reserveSeats(seatNumbers);

    const priceValue = parseInt(String(selectedBus.price).replace(/\D/g, ''), 10) || 400;

    const schedule = {
      busName: selectedBus.name || selectedBus.busNumber || 'POWER TOOLS',
      busType: selectedBus.type || 'Time bus',
      from: selectedBus.from || selectedBus.source || 'LUSAKA',
      to: selectedBus.to || selectedBus.destination || 'CHIPATA',
      depart: selectedBus.timeFrom || selectedBus.depart || '5:00 AM',
      arrive: selectedBus.timeTo || selectedBus.arrive || '12:00 PM',
      seatNumbers,
      seatNumbersNumeric,
      pricePerSeat: priceValue,
      busTripId: selectedBusTripId,
      bookingSelectionType: option,
    };

    const passengerCount = option === 'self' ? 1 : seatNumbers.length;

    setShowBookingModal(false);

    navigation.navigate('PassDetails', {
      schedule,
      passengerCount,
      bookingType: option,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Select Seats</Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>{selectedBus.from || selectedBus.source || 'LUSAKA'}</Text>
          <View style={styles.swapCircle}>
            <MaterialIcons name="arrow-forward" size={16} color={COLORS.white} />
          </View>
          <Text style={styles.routeText}>{selectedBus.to || selectedBus.destination || 'CHIPATA'}</Text>
        </View>

        <View style={styles.busPill}>
          <MaterialIcons name="directions-bus" size={14} color={COLORS.primary} />
          <Text style={styles.busNameText}>
            {selectedBus.name || selectedBus.busNumber || 'POWER TOOLS'}
          </Text>
        </View>

        <View style={styles.bottomPanel}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: COLORS.seatAvailable }]} />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: COLORS.seatSelected }]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: COLORS.seatBooked }]} />
                <Text style={styles.legendText}>Booked</Text>
              </View>
            </View>

            {loadingSeatStatus && (
              <View style={styles.seatStatusLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.seatStatusLoaderText}>Loading booked seats...</Text>
              </View>
            )}

            <View style={styles.frontIndicator}>
              <MaterialIcons name="navigation" size={13} color={COLORS.primary} />
              <Text style={styles.frontText}>FRONT</Text>
            </View>

            <View style={styles.seatGrid}>
              {seatRows.map((row, rowIndex) => (
                <View
                  key={`row-${rowIndex}`}
                  style={[styles.seatRow, !row.includes('gap') && styles.lastRow]}
                >
                  {row.map((seatType, seatIndex) => {
                    if (seatType === 'gap') {
                      return <View key={`gap-${rowIndex}-${seatIndex}`} style={styles.aisleGap} />;
                    }

                    const key = `${rowIndex}-${seatIndex}`;
                    const seatName = getSeatName(rowIndex, seatIndex);
                    const seatNumber = getSeatNumber(rowIndex, seatIndex);
                    const isSelected = selected.includes(key);
                    const isReserved = seatStorage.isReserved(seatName);
                    const isBookedFromBackend = seatNumber && bookedSeatSet.has(seatNumber);
                    const bgColor = seatType === 'b' || isReserved || isBookedFromBackend
                      ? COLORS.seatBooked
                      : isSelected
                        ? COLORS.seatSelected
                        : COLORS.seatAvailable;

                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.seat, { backgroundColor: bgColor }]}
                        onPress={() => toggleSeat(rowIndex, seatIndex, seatType)}
                        activeOpacity={seatType === 'b' || isReserved || isBookedFromBackend ? 1 : 0.7}
                      >
                        {isSelected ? (
                          <MaterialIcons name="check" size={14} color={COLORS.root} />
                        ) : (
                          <Text style={styles.seatLabel}>{seatName}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {selected.length > 0 && (
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedInfoText}>
                  {selected.length} seat{selected.length > 1 ? 's' : ''} selected
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.reserveBtn, selected.length === 0 && { opacity: 0.6 }]}
              activeOpacity={0.85}
              onPress={handleReserve}
              disabled={selected.length === 0}
            >
              <Text style={styles.reserveBtnText}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>

      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who are you booking for?</Text>
            <Text style={styles.modalSub}>
              You selected {selected.length} seat{selected.length > 1 ? 's' : ''}
            </Text>

            <TouchableOpacity style={styles.bookingOption} onPress={() => proceedWithBooking('self')}>
              <MaterialIcons name="person" size={24} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Just Me</Text>
                <Text style={styles.optionSub}>Book one seat for yourself</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookingOption} onPress={() => proceedWithBooking('group')}>
              <MaterialIcons name="group" size={24} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Group Booking</Text>
                <Text style={styles.optionSub}>Book all selected seats for others</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookingOption} onPress={() => proceedWithBooking('both')}>
              <MaterialIcons name="people" size={24} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Me and Others</Text>
                <Text style={styles.optionSub}>Book selected seats for your group</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBookingModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
    bottom: '30%',
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.blobCyan,
    opacity: 0.1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  routeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textHeader,
    letterSpacing: -0.3,
  },
  swapCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  busPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },
  busNameText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bottomPanel: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderBottomWidth: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  seatStatusLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  seatStatusLoaderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  frontIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: COLORS.primary + '18',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  frontText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  seatGrid: {
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lastRow: {
    justifyContent: 'space-between',
    width: 250,
  },
  seat: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  aisleGap: {
    width: 28,
  },
  selectedInfo: {
    backgroundColor: COLORS.seatSelected + '20',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  selectedInfoText: {
    color: COLORS.seatSelected,
    fontSize: 13,
    fontWeight: '700',
  },
  reserveBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    maxWidth: 340,
    paddingVertical: 17,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  reserveBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  bookingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
