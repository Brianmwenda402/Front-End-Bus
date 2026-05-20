import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, SafeAreaView, ScrollView, Platform, StatusBar,
  Modal, TextInput, ActivityIndicator, FlatList, Alert,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import TimeScrollPicker from "../components/TimeScrollPicker";
import { parseTimeToTimestamp, formatTimestamp, durationBetween } from "../utils/timeUtils";
import CONFIG from "../config/config";

const { width } = Dimensions.get("window");

const COLORS = {
  root:          "#0f202a",
  card:          "#1e293b",
  cardBorder:    "#334155",
  inputBg:       "#162032",
  textHeader:    "#f8fafc",
  textSecondary: "#94a3b8",
  primary:       "#6366f1",
  cyan:          "#15b0db",
  green:         "#4ade80",
  gold:          "#fbbf24",
  pink:          "#f472b6",
  red:           "#f87171",
  white:         "#FFFFFF",
};

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api`;

const menuItems = [
  { label: "Add Trip",         icon: "plus-circle",         color: COLORS.cyan,    screen: "AddTrip"        },
  { label: "View Trips",       icon: "bus-multiple",        color: COLORS.green,   screen: "ViewTrips"      },
  { label: "Seat Status",      icon: "seat",                color: COLORS.gold,    screen: "SeatStatus"     },
  { label: "Manage Users",     icon: "account-cog",         color: COLORS.pink,    screen: "ManageUsers"    },
];

export default function AdminDashboard({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    totalSeatsBooked: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: "",
    source: "",
    destination: "",
    stationPoint: "",
    departureTime: "06:00 AM",
    arrivalTime: "12:00 PM",
    price: "",
    totalSeats: "",
  });

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(30)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideY,  { toValue: 0, friction: 7,   useNativeDriver: true }),
      ]),
      Animated.spring(cardAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
    
    fetchTripsAndBookings();
  }, []);

  const fetchTripsAndBookings = async () => {
    try {
      setLoading(true);
      const [tripsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trips/all`),
        fetch(`${API_BASE_URL}/bookings/all`)
      ]);

      const tripsData = await tripsRes.json();
      const bookingsData = await bookingsRes.json();

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      const seatsBooked = bookingsData.length || 0;
      const totalRevenue = tripsData.reduce((sum, trip) => sum + (trip.price * (seatsBooked / tripsData.length || 0)), 0);

      setStats({
        totalTrips: tripsData.length,
        totalBookings: bookingsData.length,
        totalSeatsBooked: seatsBooked,
        totalRevenue: totalRevenue.toFixed(2),
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to fetch data");
    }
  };

  const handleAddTrip = async () => {
    if (!formData.busNumber || !formData.source || !formData.destination || !formData.totalSeats || !formData.price) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }
    if (!formData.departureTime || !formData.arrivalTime) {
      Alert.alert("Validation", "Please select departure and arrival times");
      return;
    }
    const depTs = parseTimeToTimestamp(formData.departureTime);
    const arrTs = parseTimeToTimestamp(formData.arrivalTime);
    if (arrTs <= depTs) {
      Alert.alert("Validation", "Arrival time must be after departure time");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/trips/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busNumber: formData.busNumber,
          source: formData.source,
          destination: formData.destination,
          stationPoint: formData.stationPoint,
          departureTime: depTs,
          arrivalTime: arrTs,
          price: parseFloat(formData.price),
          totalSeats: parseInt(formData.totalSeats),
          availableSeats: parseInt(formData.totalSeats),
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Trip added successfully");
        setFormData({
          busNumber: "",
          source: "",
          destination: "",
          stationPoint: "",
          departureTime: "06:00 AM",
          arrivalTime: "12:00 PM",
          price: "",
          totalSeats: "",
        });
        setModalVisible(false);
        fetchTripsAndBookings();
      } else {
        Alert.alert("Error", "Failed to add trip");
      }
    } catch (error) {
      console.error("Error adding trip:", error);
      Alert.alert("Error", "Failed to add trip");
    }
  };

  const handleDeleteTrip = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trips/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Alert.alert("Success", "Trip deleted successfully");
        fetchTripsAndBookings();
      } else {
        Alert.alert("Error", "Failed to delete trip");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      Alert.alert("Error", "Failed to delete trip");
    }
  };

  const getTripStats = (trip) => {
    const tripBookings = bookings.filter(b => b.busTripId === trip.id);
    const bookedSeats = tripBookings.length;
    const availableSeats = trip.totalSeats - bookedSeats;
    return { bookedSeats, availableSeats };
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}>
            <View>
              <Text style={styles.headerGreeting}>Welcome 👋</Text>
              <Text style={styles.headerName}>Admin Portal</Text>
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons name="shield-crown" size={12} color={COLORS.pink} />
                <Text style={styles.roleBadgeText}>Bus Management</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.avatarCircle} onPress={fetchTripsAndBookings}>
              <MaterialCommunityIcons name="refresh" size={26} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>

          {/* Stats grid */}
          <Animated.View style={[styles.statsGrid, { opacity: cardAnim, transform: [{ scale: cardAnim }] }]}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.cyan + "22" }]}>
                <MaterialCommunityIcons name="bus-multiple" size={22} color={COLORS.cyan} />
              </View>
              <Text style={styles.statValue}>{stats.totalTrips}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.green + "22" }]}>
                <MaterialCommunityIcons name="ticket-confirmation" size={22} color={COLORS.green} />
              </View>
              <Text style={styles.statValue}>{stats.totalBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.gold + "22" }]}>
                <MaterialCommunityIcons name="seat" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.statValue}>{stats.totalSeatsBooked}</Text>
              <Text style={styles.statLabel}>Seats Booked</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.pink + "22" }]}>
                <MaterialCommunityIcons name="cash-multiple" size={22} color={COLORS.pink} />
              </View>
              <Text style={styles.statValue}>${stats.totalRevenue}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </Animated.View>

          {/* Quick actions */}
          <Animated.View style={{ opacity: cardAnim }}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.menuCard}
                  activeOpacity={0.8}
                  onPress={() => item.screen === "AddTrip" ? setModalVisible(true) : null}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: item.color + "22" }]}>
                    <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* All Trips */}
          <Animated.View style={{ opacity: cardAnim }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>All Bus Trips</Text>
              <Text style={styles.seeAll}>{trips.length} trips</Text>
            </View>

            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bus-alert" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No trips added yet</Text>
              </View>
            ) : (
              trips.map((trip) => {
                const { bookedSeats, availableSeats } = getTripStats(trip);
                return (
                  <View key={trip.id} style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <View style={styles.tripRoute}>
                        <View style={[styles.tripBadge, { backgroundColor: COLORS.cyan + "22" }]}>
                          <MaterialCommunityIcons name="bus-multiple" size={16} color={COLORS.cyan} />
                        </View>
                        <View>
                          <Text style={styles.tripNumber}>{trip.busNumber}</Text>
                          <Text style={styles.tripDetails}>{trip.source} → {trip.destination}</Text>
                          <Text style={styles.tripTimes}>
                            {formatTimestamp(trip.departureTime) || '—'} → {formatTimestamp(trip.arrivalTime) || '—'}
                            {trip.departureTime && trip.arrivalTime
                              ? ` · ${durationBetween(formatTimestamp(trip.departureTime), formatTimestamp(trip.arrivalTime))}`
                              : ''}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tripPrice}>
                        <Text style={styles.priceValue}>${trip.price}</Text>
                      </View>
                    </View>

                    <View style={styles.tripStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemLabel}>Total Seats</Text>
                        <Text style={styles.statItemValue}>{trip.totalSeats}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemLabel}>Booked</Text>
                        <Text style={[styles.statItemValue, { color: COLORS.gold }]}>{bookedSeats}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemLabel}>Available</Text>
                        <Text style={[styles.statItemValue, { color: COLORS.green }]}>{availableSeats}</Text>
                      </View>
                    </View>

                    <View style={styles.seatBar}>
                      <View style={[styles.seatBarFill, { width: `${(bookedSeats / trip.totalSeats) * 100}%` }]} />
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => Alert.alert("Delete Trip", "Are you sure?", [
                        { text: "Cancel", onPress: () => {} },
                        { text: "Delete", onPress: () => handleDeleteTrip(trip.id), style: "destructive" }
                      ])}
                    >
                      <MaterialCommunityIcons name="trash-can" size={16} color={COLORS.red} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </Animated.View>

        </ScrollView>
      </SafeAreaView>

      {/* Add Trip Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Bus Trip</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Bus Number"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.busNumber}
                onChangeText={(text) => setFormData({...formData, busNumber: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Source"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.source}
                onChangeText={(text) => setFormData({...formData, source: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Destination"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.destination}
                onChangeText={(text) => setFormData({...formData, destination: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Station Point"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.stationPoint}
                onChangeText={(text) => setFormData({...formData, stationPoint: text})}
              />
              <TimeScrollPicker
                label="Departure Time"
                value={formData.departureTime}
                onChange={(t) => setFormData({ ...formData, departureTime: t })}
                colors={COLORS}
              />
              <TimeScrollPicker
                label="Arrival Time"
                value={formData.arrivalTime}
                onChange={(t) => setFormData({ ...formData, arrivalTime: t })}
                colors={COLORS}
              />
              {formData.departureTime && formData.arrivalTime ? (
                <Text style={styles.durationHint}>
                  Trip duration: {durationBetween(formData.departureTime, formData.arrivalTime)}
                </Text>
              ) : null}
              <TextInput
                style={styles.input}
                placeholder="Price per Seat"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Seats"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                value={formData.totalSeats}
                onChangeText={(text) => setFormData({...formData, totalSeats: text})}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddTrip}>
                <Text style={styles.submitBtnText}>Add Trip</Text>
              </TouchableOpacity>
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
    overflow: "hidden",
  },
  blobTop: {
    position: "absolute", top: -120, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: COLORS.primary, opacity: 0.12,
  },
  blobBottom: {
    position: "absolute", bottom: "20%", left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: COLORS.cyan, opacity: 0.1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 24,
  },
  headerGreeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textHeader,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.pink + "22",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  roleBadgeText: {
    fontSize: 11,
    color: COLORS.pink,
    fontWeight: "700",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textHeader,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textHeader,
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  menuCard: {
    width: (width - 52) / 3,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 10,
    fontWeight: "500",
  },
  tripCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tripRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  tripBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tripNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textHeader,
  },
  tripDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tripTimes: {
    fontSize: 11,
    color: COLORS.cyan,
    marginTop: 4,
    fontWeight: "600",
  },
  durationHint: {
    fontSize: 12,
    color: COLORS.green,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: -4,
    textAlign: "center",
  },
  tripPrice: {
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.green,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statItem: {
    alignItems: "center",
  },
  statItemLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textHeader,
  },
  seatBar: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  seatBarFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.red + "18",
    borderWidth: 1,
    borderColor: COLORS.red + "33",
  },
  deleteBtnText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.root,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textHeader,
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textHeader,
    marginBottom: 12,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
