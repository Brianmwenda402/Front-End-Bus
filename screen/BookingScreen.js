import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Platform, ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  green:         '#4ade80',
  gold:          '#fbbf24',
  white:         '#FFFFFF',
};

const API_BASE_URL = "http://10.26.129.86:8089/api";

export default function MyTicketsScreen({ navigation }) {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings();
    }
  }, [user?.id]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch user's bookings using correct endpoint
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings/user/${user.id}`);
      const bookingsData = await bookingsRes.json();
      
      // Fetch all trips
      const tripsRes = await fetch(`${API_BASE_URL}/trips`);
      const tripsData = await tripsRes.json();
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load your tickets');
      setLoading(false);
    }
  };

  const getTickets = () => {
    if (bookings.length === 0) return [];

    return bookings.map(booking => {
      const trip = trips.find(t => t.id === booking.busTripId);
      if (!trip) return null;

      const departTime = new Date(trip.departureTime * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      const arriveTime = new Date(trip.arrivalTime * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      const dateStr = new Date(trip.departureTime * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      // Determine if past or upcoming
      const tripDate = new Date(trip.departureTime * 1000);
      const now = new Date();
      const status = tripDate < now ? 'Past' : 'Confirmed';

      return {
        id: booking.id,
        bookingId: booking.id,
        schedule: {
          from: trip.source,
          to: trip.destination,
          busName: trip.busNumber,
          busType: 'Bus Trip',
          date: dateStr,
          depart: departTime,
          arrive: arriveTime,
          seatNumbers: [booking.seatNumber?.toString() || 'N/A'],
          pricePerSeat: trip.price,
        },
        status: status,
        tripId: trip.id,
        seatNumber: booking.seatNumber,
      };
    }).filter(t => t !== null);
  };

  const filtered = getTickets().filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return t.status === 'Confirmed';
    return t.status === 'Past';
  });

  const openTicket = (ticket) => {
    navigation.getParent()?.navigate('YourTicket', {
      passengers: [
        {
          fullName: user.fullName || 'Passenger',
          phone: user.phone || 'N/A',
          email: user.email || 'N/A',
        }
      ],
      schedule: ticket.schedule,
    });
  };

  const bookBus = () => {
    if (navigation.getParent()) {
      navigation.getParent().navigate('UserTabs', { screen: 'Book' });
    } else {
      navigation.navigate('Book');
    }
  };

  const onRefresh = () => {
    fetchUserBookings();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Tickets</Text>
            <Text style={styles.subtitle}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={loading}
          >
            <MaterialIcons 
              name="refresh" 
              size={22} 
              color={COLORS.primary}
              style={{ opacity: loading ? 0.5 : 1 }}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {['All', 'Upcoming', 'Past'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your tickets...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            <View style={styles.empty}>
              <MaterialIcons name="confirmation-number" size={56} color={COLORS.cardBorder} />
              <Text style={styles.emptyTitle}>No tickets yet</Text>
              <Text style={styles.emptySub}>Book your first bus trip to see tickets here</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={bookBus} activeOpacity={0.85}>
                <MaterialIcons name="directions-bus" size={18} color={COLORS.white} />
                <Text style={styles.emptyBtnText}>Book a Bus</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={onRefresh}
          >
            {filtered.map(ticket => {
              const s = ticket.schedule;
              const isPast = ticket.status === 'Past';
              return (
                <TouchableOpacity
                  key={ticket.id}
                  style={[styles.ticketCard, isPast && { opacity: 0.65 }]}
                  activeOpacity={0.85}
                  onPress={() => openTicket(ticket)}
                >
                  <View style={[styles.ticketStrip, { backgroundColor: isPast ? COLORS.cardBorder : COLORS.primary }]} />
                  <View style={styles.ticketBody}>
                    <View style={styles.ticketTop}>
                      <View style={styles.busIcon}>
                        <MaterialIcons name="directions-bus" size={22} color={COLORS.white} />
                      </View>
                      <View style={styles.ticketInfo}>
                        <Text style={styles.route}>
                          {s.from} → {s.to}
                        </Text>
                        <Text style={styles.meta}>
                          {s.busName} · {s.date}
                        </Text>
                        <Text style={styles.seats}>Seat: {s.seatNumbers?.join(', ')}</Text>
                      </View>
                      <View style={[styles.badge, isPast ? styles.badgePast : styles.badgeActive]}>
                        <Text style={[styles.badgeText, isPast && styles.badgeTextPast]}>
                          {ticket.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ticketFooter}>
                      <View>
                        <Text style={styles.depart}>{s.depart} → {s.arrive}</Text>
                        <Text style={styles.duration}>K {s.pricePerSeat}</Text>
                      </View>
                      <View style={styles.viewRow}>
                        <Text style={styles.viewText}>View ticket</Text>
                        <MaterialIcons name="chevron-right" size={18} color={COLORS.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.root, overflow: 'hidden' },
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
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20, 
    marginTop: 16, 
    marginBottom: 16 
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textHeader, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  refreshBtn: { padding: 8 },
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
  filterScroll: { maxHeight: 44, marginBottom: 16 },
  filterRow: { paddingHorizontal: 20, gap: 10 },
  filterTab: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  filterTabActive: { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textHeader, marginTop: 20, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 28 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  ticketCard: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: 14, overflow: 'hidden',
  },
  ticketStrip: { width: 4 },
  ticketBody: { flex: 1, padding: 16 },
  ticketTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  busIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  ticketInfo: { flex: 1 },
  route: { fontSize: 15, fontWeight: '800', color: COLORS.textHeader, marginBottom: 4 },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  seats: { fontSize: 11, color: COLORS.textSecondary },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: COLORS.green + '22' },
  badgePast: { backgroundColor: COLORS.cardBorder },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.green },
  badgeTextPast: { color: COLORS.textSecondary },
  ticketFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
  },
  depart: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  duration: { fontSize: 11, color: COLORS.gold, fontWeight: '700', marginTop: 2 },
  viewRow: { flexDirection: 'row', alignItems: 'center' },
  viewText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});
