import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import CONFIG from '../config/config';

const COLORS = {
  root:          '#0f202a',
  blobBlue:      '#5C90EB',
  blobCyan:      '#589BF2',
  card:          '#1e293b',
  cardBorder:    '#334155',
  inputBg:       '#162032',
  textHeader:    '#f8fafc',
  textSecondary: '#94a3b8',
  primary:       '#5C90EB',
  green:         '#4ade80',
  gold:          '#fbbf24',
  red:           '#f87171',
  white:         '#FFFFFF',
};

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api`;

// Temporary seat storage
const seatStorage = {};

function TripCard({ trip, bookedCount, onBook }) {
  const seatsLeft = trip.totalSeats - bookedCount;
  const seatColor = seatsLeft <= 5 ? COLORS.red : seatsLeft <= 15 ? COLORS.gold : COLORS.green;
  const fillPct = Math.round(((bookedCount) / trip.totalSeats) * 100);

  const departTime = new Date(trip.departureTime * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const arriveTime = new Date(trip.arrivalTime * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View>
          <Text style={styles.busNumber}>{trip.busNumber}</Text>
          <Text style={styles.route}>{trip.source} → {trip.destination}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>K {trip.price}</Text>
          <Text style={styles.perSeat}>per seat</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.timeSection}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{departTime}</Text>
          <Text style={styles.city}>{trip.source}</Text>
        </View>
        <View style={styles.timeMiddle}>
          <View style={styles.line} />
          <MaterialIcons name="directions-bus" size={16} color={COLORS.primary} />
          <View style={styles.line} />
        </View>
        <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
          <Text style={styles.time}>{arriveTime}</Text>
          <Text style={styles.city}>{trip.destination}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.seatsSection}>
        <View style={styles.seatInfo}>
          <View style={styles.seatBar}>
            <View style={[styles.seatFill, { width: `${fillPct}%`, backgroundColor: seatColor }]} />
          </View>
          <Text style={[styles.seatsText, { color: seatColor }]}>
            {seatsLeft} of {trip.totalSeats} seats
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookBtn, { opacity: seatsLeft <= 0 ? 0.5 : 1 }]}
        onPress={() => onBook(trip)}
        disabled={seatsLeft <= 0}
        activeOpacity={0.8}
      >
        <Text style={styles.bookBtnText}>{seatsLeft <= 0 ? 'Fully Booked' : 'Book Seats'}</Text>
        {seatsLeft > 0 && <MaterialIcons name="arrow-forward" size={18} color={COLORS.white} />}
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useUser();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trips, setTrips] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingType, setBookingType] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [passengers, setPassengers] = useState([{ name: user?.username || '', age: '' }]);

  useEffect(() => {
    fetchAllTrips();
    fetchBookings();
  }, []);

  const fetchAllTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trips/all`);
      const data = await response.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/all`);
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Error', 'Please enter departure and destination cities');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/trips/search?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`
      );
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (error) {
      console.error('Error searching trips:', error);
      Alert.alert('Error', 'Failed to search trips');
    } finally {
      setLoading(false);
    }
  };

  const getBookedSeatsForTrip = (tripId) => {
    return bookings.filter(b => b.busTripId === tripId).length;
  };

  const handleBookTrip = (trip) => {
    setSelectedTrip(trip);
    setShowBookingModal(true);
  };

  const handleBookingTypeSelected = (type) => {
    setBookingType(type);
    if (type === 'self') {
      setPassengers([{ name: user?.username || '', age: '' }]);
    }
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: '' }]);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleConfirmBooking = async () => {
    if (!bookingType) {
      Alert.alert('Error', 'Please select booking type');
      return;
    }

    if (passengers.some(p => !p.name.trim() || !p.age)) {
      Alert.alert('Error', 'Please fill in all passenger details');
      return;
    }

    setLoading(true);
    try {
      // Store seat reservations temporarily
      if (!seatStorage[selectedTrip.id]) {
        seatStorage[selectedTrip.id] = [];
      }

      const seatNumbers = passengers.map((_, i) => ({
        seatNumber: Math.floor(Math.random() * selectedTrip.totalSeats) + 1,
      }));

      // Store temporary booking
      seatStorage[selectedTrip.id].push(...seatNumbers.map(s => s.seatNumber));

      // Navigate to seat selection with passenger details
      navigation.navigate('SelectSeats', {
        bus: {
          id: selectedTrip.id,
          busNumber: selectedTrip.busNumber,
          source: selectedTrip.source,
          destination: selectedTrip.destination,
          departureTime: selectedTrip.departureTime,
          arrivalTime: selectedTrip.arrivalTime,
          price: selectedTrip.price,
          totalSeats: selectedTrip.totalSeats,
          from: selectedTrip.source,
          to: selectedTrip.destination,
          depart: new Date(selectedTrip.departureTime * 1000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          arrive: new Date(selectedTrip.arrivalTime * 1000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        },
        passengers: passengers,
        reservedSeats: seatNumbers.map(s => s.seatNumber),
      });

      setShowBookingModal(false);
      setBookingType(null);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to process booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!searched ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerGreeting}>Hello, {user?.username}! 👋</Text>
                <Text style={styles.headerSub}>Book your next bus trip</Text>
              </View>

              {/* Search Card */}
              <View style={styles.searchCard}>
                <Text style={styles.searchLabel}>From</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="trip-origin" size={16} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Departure city"
                    placeholderTextColor={COLORS.textSecondary}
                    value={from}
                    onChangeText={setFrom}
                  />
                </View>

                <Text style={styles.searchLabel}>To</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="location-on" size={16} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Destination city"
                    placeholderTextColor={COLORS.textSecondary}
                    value={to}
                    onChangeText={setTo}
                  />
                </View>

                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={handleSearch}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="search" size={18} color={COLORS.white} />
                      <Text style={styles.searchBtnText}>Search Trips</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Featured Routes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Routes</Text>
                {trips.slice(0, 3).map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    bookedCount={getBookedSeatsForTrip(trip.id)}
                    onBook={handleBookTrip}
                  />
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Search Results Header */}
              <View style={styles.resultsHeader}>
                <TouchableOpacity onPress={() => setSearched(false)}>
                  <MaterialIcons name="chevron-left" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <View>
                  <Text style={styles.resultsTitle}>{searchResults.length} trips found</Text>
                  <Text style={styles.resultsSub}>{from} → {to}</Text>
                </View>
              </View>

              {/* Search Results */}
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : searchResults.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>🚍</Text>
                  <Text style={styles.emptyTitle}>No trips found</Text>
                  <Text style={styles.emptySub}>Try another route</Text>
                </View>
              ) : (
                <View style={styles.section}>
                  {searchResults.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      bookedCount={getBookedSeatsForTrip(trip.id)}
                      onBook={handleBookTrip}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Trip</Text>
              <TouchableOpacity onPress={() => { setShowBookingModal(false); setBookingType(null); }}>
                <MaterialIcons name="close" size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {!bookingType ? (
                <>
                  <Text style={styles.modalLabel}>Booking Type</Text>
                  <TouchableOpacity
                    style={[styles.optionBtn, { marginBottom: 12 }]}
                    onPress={() => handleBookingTypeSelected('self')}
                  >
                    <MaterialIcons name="person" size={20} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.optionTitle}>Book for Yourself</Text>
                      <Text style={styles.optionSub}>Only for you</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionBtn, { marginBottom: 12 }]}
                    onPress={() => handleBookingTypeSelected('others')}
                  >
                    <MaterialIcons name="group" size={20} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.optionTitle}>Book for Others</Text>
                      <Text style={styles.optionSub}>Add passenger details</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionBtn}
                    onPress={() => handleBookingTypeSelected('both')}
                  >
                    <MaterialIcons name="people" size={20} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.optionTitle}>Book for Group</Text>
                      <Text style={styles.optionSub}>You + other passengers</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalLabel}>Passenger Details</Text>
                  {passengers.map((passenger, index) => (
                    <View key={index} style={styles.passengerForm}>
                      <Text style={styles.passengerNum}>Passenger {index + 1}</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Full Name"
                        placeholderTextColor={COLORS.textSecondary}
                        value={passenger.name}
                        onChangeText={(value) => updatePassenger(index, 'name', value)}
                      />
                      <TextInput
                        style={styles.formInput}
                        placeholder="Age"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="numeric"
                        value={passenger.age?.toString() || ''}
                        onChangeText={(value) => updatePassenger(index, 'age', parseInt(value) || '')}
                      />
                    </View>
                  ))}

                  {bookingType !== 'self' && (
                    <TouchableOpacity
                      style={styles.addPassengerBtn}
                      onPress={addPassenger}
                    >
                      <MaterialIcons name="add-circle-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.addPassengerText}>Add Passenger</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirmBooking}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.confirmBtnText}>Continue to Seat Selection</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setBookingType(null)}
                  >
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
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
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 24,
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textHeader,
    marginLeft: 10,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  resultsSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Trip Card Styles
  tripCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  busNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  route: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  perSeat: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 10,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeBlock: {
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  city: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  seatsSection: {
    marginBottom: 10,
  },
  seatInfo: {
    gap: 6,
  },
  seatBar: {
    height: 5,
    backgroundColor: COLORS.inputBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  seatFill: {
    height: '100%',
    borderRadius: 3,
  },
  seatsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.root,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  modalScroll: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 14,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  optionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  passengerForm: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 12,
  },
  passengerNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textHeader,
    marginBottom: 8,
    fontSize: 13,
  },
  addPassengerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 14,
  },
  addPassengerText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  backBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
