import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Dimensions, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import CONFIG from '../config/config';

const { width, height } = Dimensions.get('window');

const COLORS = {
  root:          '#0f172a',
  blobBlue:      '#5C90EB',
  blobCyan:      '#589BF2',
  card:          '#1e293b',
  cardBorder:    '#334155',
  textHeader:    '#f8fafc',
  textSecondary: '#94a3b8',
  primary:       '#5C90EB',
  inputBg:       '#162032',
  green:         '#4ade80',
  white:         '#FFFFFF',
};

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api`;

export default function SelectBusScreen({ navigation, route }) {
  const routeData = route?.params || {};
  const { routeBuses = [], from = 'LUSAKA', to = 'CHIPATA', selectedBus = null } = routeData;
  const [displayBuses, setDisplayBuses] = useState(routeBuses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/trips`);
      const allTrips = await response.json();
      
      let filtered = allTrips.filter(trip => 
        trip.source?.toLowerCase() === from.toLowerCase() &&
        trip.destination?.toLowerCase() === to.toLowerCase()
      );

      setDisplayBuses(filtered.length > 0 ? filtered : routeBuses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching buses:", error);
      setDisplayBuses(routeBuses);
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const formatTripTime = (epochSeconds, fallback) => {
    if (!epochSeconds) return fallback;
    return new Date(epochSeconds * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeArea}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <MaterialIcons name="chevron-left" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Select your Bus</Text>

          <View style={styles.routeContainer}>
            <Text style={styles.routeText}>{from.toUpperCase()}</Text>
            <View style={styles.swapCircle}>
              <FontAwesome5 name="exchange-alt" size={12} color={COLORS.white} />
            </View>
            <Text style={styles.routeText}>{to.toUpperCase()}</Text>
          </View>

          <View style={styles.datePill}>
            <MaterialIcons name="event" size={13} color={COLORS.primary} />
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {displayBuses.map((bus) => {
              const displayName = bus.busNumber || 'Bus';
              const displayPrice = bus.price;
              const displaySeats = bus.availableSeats || 0;
              const departText = formatTripTime(bus.departureTime, bus.depart || '--:--');
              const arriveText = formatTripTime(bus.arrivalTime, bus.arrive || '--:--');

              return (
                <TouchableOpacity key={bus.id} style={styles.busCard} activeOpacity={0.8}>

                  <View style={styles.cardRowTop}>
                    <View>
                      <Text style={styles.busName}>{displayName}</Text>
                      <Text style={styles.busType}>Bus Service</Text>
                    </View>
                    <Text style={styles.busPrice}>K {displayPrice}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.timeRow}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeText}>{departText}</Text>
                      <Text style={styles.timeLabel}>Departure</Text>
                    </View>

                    <View style={styles.durationBlock}>
                      <View style={styles.durationLine} />
                      <View style={styles.durationBadge}>
                        <MaterialIcons name="directions-bus" size={12} color={COLORS.primary} />
                        <Text style={styles.durationText}>Trip</Text>
                      </View>
                      <View style={styles.durationLine} />
                    </View>

                    <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                      <Text style={styles.timeText}>{arriveText}</Text>
                      <Text style={styles.timeLabel}>Arrival</Text>
                    </View>
                  </View>

                  <View style={styles.cardRowBottom}>
                    <View style={styles.seatsBadge}>
                      <MaterialIcons name="event-seat" size={12} color={COLORS.green} />
                      <Text style={styles.seatsText}>{displaySeats} seats</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bookBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('SelectSeats', { bus })}
                    >
                      <Text style={styles.bookBtnText}>Book</Text>
                    </TouchableOpacity>
                  </View>

                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    opacity: 0.18,
  },
  blobBottom: {
    position: 'absolute',
    top: height * 0.25,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.blobCyan,
    opacity: 0.1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 0,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 4,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
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
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  dateText: {
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
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 14,
  },

  busCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  busName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 3,
  },
  busType: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  busPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginBottom: 14,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeBlock: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  timeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  durationBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  durationLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '18',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 6,
  },
  durationText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },

  cardRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.green + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  seatsText: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
