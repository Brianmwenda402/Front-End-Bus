import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

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

const API_BASE_URL = "http://10.26.129.86:8089/api";

function TripCard({ trip, bookedCount, onBook }) {
  const seatsLeft = trip.totalSeats - bookedCount;
  const seatColor = seatsLeft <= 5 ? COLORS.red : seatsLeft <= 15 ? COLORS.gold : COLORS.green;
  const fillPct = Math.round(((bookedCount) / trip.totalSeats) * 100);

  const departTime = new Date(trip.departureTime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const arriveTime = new Date(trip.arrivalTime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
        <Text style={styles.bookBtnText}>{seatsLeft <= 0 ? 'Fully Booked' : 'Book Trip'}</Text>
        {seatsLeft > 0 && <MaterialIcons name="arrow-forward" size={18} color={COLORS.white} />}
      </TouchableOpacity>
    </View>
  );
}

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trips`),
        fetch(`${API_BASE_URL}/bookings`)
      ]);

      const tripsData = await tripsRes.json();
      const bookingsData = await bookingsRes.json();

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getBookedSeatsForTrip = (tripId) => {
    return bookings.filter(b => b.busTripId === tripId).length;
  };

  const handleBookTrip = (trip) => {
    navigation.navigate('SelectSeats', { 
      bus: {
        id: trip.id,
        busNumber: trip.busNumber,
        source: trip.source,
        destination: trip.destination,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        price: trip.price,
        totalSeats: trip.totalSeats,
        from: trip.source,
        to: trip.destination,
        depart: new Date(trip.departureTime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        arrive: new Date(trip.arrivalTime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Trips</Text>
          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <MaterialIcons 
              name="refresh" 
              size={22} 
              color={COLORS.primary}
              style={{ opacity: refreshing ? 0.5 : 1 }}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🚍</Text>
            <Text style={styles.emptyTitle}>No trips available</Text>
            <Text style={styles.emptySub}>Check back later</Text>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            refreshing={refreshing}
            onRefresh={onRefresh}
          >
            {trips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                bookedCount={getBookedSeatsForTrip(trip.id)}
                onBook={handleBookTrip}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
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
  refreshBtn: {
    padding: 8,
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