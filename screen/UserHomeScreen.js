import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import CONFIG from '../config/config';

const COLORS = {
  root: '#0f202a',
  blobBlue: '#5C90EB',
  blobCyan: '#589BF2',
  card: '#1e293b',
  cardBorder: '#334155',
  inputBg: '#162032',
  textHeader: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#5C90EB',
  green: '#4ade80',
  gold: '#fbbf24',
  red: '#f87171',
  white: '#FFFFFF',
};

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api`;
const CITIES = ['Lusaka', 'Chipata', 'Livingstone', 'Ndola', 'Kitwe', 'Copperbelt', 'Kabwe', 'Kasama'];

function TripCard({ trip, bookedCount, onBook }) {
  const totalSeats = Number(trip.totalSeats) || 0;
  const seatsLeft = Math.max(0, totalSeats - bookedCount);
  const seatColor = seatsLeft <= 5 ? COLORS.red : seatsLeft <= 15 ? COLORS.gold : COLORS.green;
  const fillPct = totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;

  const departTime = new Date(Number(trip.departureTime) * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const arriveTime = new Date(Number(trip.arrivalTime) * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View>
          <Text style={styles.busNumber}>{trip.busNumber || 'Bus'}</Text>
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
            {seatsLeft} of {totalSeats} seats
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookBtn, { opacity: seatsLeft <= 0 ? 0.5 : 1 }]}
        onPress={() => onBook(trip)}
        disabled={seatsLeft <= 0}
        activeOpacity={0.8}
      >
        <Text style={styles.bookBtnText}>{seatsLeft <= 0 ? 'Fully Booked' : 'Book Trip'}</Text>
        {seatsLeft > 0 && <MaterialIcons name="arrow-forward" size={18} color={COLORS.white} />}
      </TouchableOpacity>
    </View>
  );
}

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [error, setError] = useState('');

  const filteredFromCities = CITIES.filter(city =>
    city.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCities = CITIES.filter(city =>
    city.toLowerCase().includes(toSearch.toLowerCase()) && city !== from
  );

  const fetchData = async () => {
    if (!from.trim() || !to.trim()) {
      setError('Please select both origin and destination');
      Alert.alert('Error', 'Please select both origin and destination');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Use the search endpoint with query parameters: stationPoint and destination
      const searchUrl = `${API_BASE_URL}/trips/search?stationPoint=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
      console.log('Searching with URL:', searchUrl);

      const tripsRes = await fetch(searchUrl);
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings/all`);

      if (!tripsRes.ok) {
        throw new Error(`HTTP error! status: ${tripsRes.status}`);
      }

      const tripsData = await tripsRes.json();
      const bookingsData = await bookingsRes.json();

      console.log('Trips data:', tripsData);
      console.log('Bookings data:', bookingsData);

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setSearched(true);

      if (!Array.isArray(tripsData) || tripsData.length === 0) {
        setError('No trips found for this route');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to search trips: ' + error.message);
      Alert.alert('Error', 'Failed to search trips: ' + error.message);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTrips = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all available trips
      const tripsRes = await fetch(`${API_BASE_URL}/trips`);
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings/all`);

      if (!tripsRes.ok) {
        throw new Error(`HTTP error! status: ${tripsRes.status}`);
      }

      const tripsData = await tripsRes.json();
      const bookingsData = await bookingsRes.json();

      console.log('All trips data:', tripsData);
      console.log('Bookings data:', bookingsData);

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setSearched(true);

      if (!Array.isArray(tripsData) || tripsData.length === 0) {
        setError('No trips available');
      }
    } catch (error) {
      console.error('Error fetching all trips:', error);
      setError('Failed to load trips: ' + error.message);
      Alert.alert('Error', 'Failed to load trips: ' + error.message);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const getBookedSeatsForTrip = (tripId) => {
    return bookings.filter((b) => (b.busTripId ?? b.tripId) === tripId).length;
  };

  const handleBookTrip = (trip) => {
    const depart = new Date(Number(trip.departureTime) * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const arrive = new Date(Number(trip.arrivalTime) * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    navigation.navigate('SelectSeats', {
      bus: {
        id: trip.id,
        name: trip.company || trip.busNumber || 'Bus',
        busNumber: trip.busNumber,
        type: trip.type || 'Time bus',
        source: trip.source,
        destination: trip.destination,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        timeFrom: depart,
        timeTo: arrive,
        price: `ZMW ${trip.price}`,
        totalSeats: trip.totalSeats,
        from: trip.source,
        to: trip.destination,
        depart,
        arrive,
      },
      bookingType: 'search',
    });
  };

  const handleSelectFromCity = (city) => {
    setFrom(city);
    setFromSearch('');
    setShowFromModal(false);
  };

  const handleSelectToCity = (city) => {
    setTo(city);
    setToSearch('');
    setShowToModal(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search Trips</Text>
        </View>

        {/* From City Selection */}
        <View style={styles.searchPanel}>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setShowFromModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="trip-origin" size={18} color={COLORS.primary} />
            <Text style={from ? styles.selectedCity : styles.placeholderCity}>
              {from || 'Select departure'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.swapBtn}
            onPress={() => {
              const temp = from;
              setFrom(to);
              setTo(temp);
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="swap-vert" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setShowToModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
            <Text style={to ? styles.selectedCity : styles.placeholderCity}>
              {to || 'Select destination'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.searchBtn, { opacity: loading ? 0.6 : 1 }]}
            onPress={fetchData}
            disabled={loading}
            activeOpacity={0.8}
          >
            <MaterialIcons name="search" size={20} color={COLORS.white} />
            <Text style={styles.searchBtnText}>{loading ? 'Searching...' : 'Search Trips'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.allTripsBtn, { opacity: loading ? 0.6 : 1 }]}
            onPress={fetchAllTrips}
            disabled={loading}
            activeOpacity={0.8}
          >
            <MaterialIcons name="list" size={20} color={COLORS.white} />
            <Text style={styles.searchBtnText}>{loading ? 'Loading...' : 'Show All Trips'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching trips...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={56} color={COLORS.red} />
            <Text style={styles.emptyTitle}>{error}</Text>
            <Text style={styles.emptySub}>Try a different route</Text>
          </View>
        ) : searched && trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="directions-bus" size={56} color={COLORS.cardBorder} />
            <Text style={styles.emptyTitle}>No trips found</Text>
            <Text style={styles.emptySub}>Try a different route</Text>
          </View>
        ) : searched ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                bookedCount={getBookedSeatsForTrip(trip.id)}
                onBook={handleBookTrip}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search" size={56} color={COLORS.cardBorder} />
            <Text style={styles.emptySub}>Select your route and search</Text>
          </View>
        )}
      </SafeAreaView>

      {/* From City Modal */}
      {showFromModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowFromModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Departure City</Text>
              <TouchableOpacity onPress={() => setShowFromModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredFromCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleSelectFromCity(item)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                  <Text style={styles.cityItemText}>{item}</Text>
                  {from === item && <MaterialIcons name="check" size={18} color={COLORS.green} />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      )}

      {/* To City Modal */}
      {showToModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowToModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Destination City</Text>
              <TouchableOpacity onPress={() => setShowToModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredToCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleSelectToCity(item)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                  <Text style={styles.cityItemText}>{item}</Text>
                  {to === item && <MaterialIcons name="check" size={18} color={COLORS.green} />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  searchPanel: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    height: 54,
  },
  selectedCity: {
    flex: 1,
    color: COLORS.textHeader,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  placeholderCity: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 15,
    marginLeft: 12,
  },
  swapBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 6,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  allTripsBtn: {
    backgroundColor: COLORS.blobCyan,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.root,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
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
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 12,
  },
  cityItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textHeader,
  },
  // Trip Card Styles
  tripCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  route: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  perSeat: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 12,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBlock: {
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  city: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  timeMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  seatsSection: {
    marginBottom: 14,
  },
  seatInfo: {
    gap: 8,
  },
  seatBar: {
    height: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  seatFill: {
    height: '100%',
    borderRadius: 3,
  },
  seatsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});