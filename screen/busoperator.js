import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, SafeAreaView, ScrollView, Platform, StatusBar,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const COLORS = {
  root:          "#0f202a",
  card:          "#1e293b",
  cardBorder:    "#334155",
  inputBg:       "#162032",
  textHeader:    "#f8fafc",
  textSecondary: "#94a3b8",
  primary:       "#15b0db",
  indigo:        "#6366f1",
  green:         "#4ade80",
  gold:          "#fbbf24",
  orange:        "#fb923c",
  red:           "#f87171",
  white:         "#FFFFFF",
};

const stats = [
  { label: "My Buses",        value: "4",   icon: "bus",              color: COLORS.primary },
  { label: "Today Trips",     value: "8",   icon: "calendar-today",   color: COLORS.green   },
  { label: "Seats Booked",    value: "112", icon: "seat-passenger",   color: COLORS.gold    },
  { label: "Seats Available", value: "36",  icon: "seat",             color: COLORS.orange  },
];

const menuItems = [
  { label: "My Buses",       icon: "bus-clock",         color: COLORS.primary, screen: "MyBuses"       },
  { label: "My Schedules",   icon: "calendar-clock",    color: COLORS.green,   screen: "MySchedules"   },
  { label: "View Bookings",  icon: "clipboard-list",    color: COLORS.gold,    screen: "ViewBookings"  },
  { label: "Seat Map",       icon: "seat-recline-extra",color: COLORS.orange,  screen: "SeatMap"       },
  { label: "Trip History",   icon: "history",           color: "#a78bfa",      screen: "TripHistory"   },
  { label: "My Profile",     icon: "account-edit",      color: COLORS.primary, screen: "Profile"       },
];

const todayTrips = [
  { bus: "Sangitam Travels", route: "Colombo → Kandy",  depart: "6:00 AM",  seats: "15/44", status: "On Time",  statusColor: COLORS.green  },
  { bus: "Sangitam Travels", route: "Kandy → Colombo",  depart: "10:00 AM", seats: "28/44", status: "On Time",  statusColor: COLORS.green  },
  { bus: "Sampath Travels",  route: "Colombo → Galle",  depart: "1:00 PM",  seats: "8/44",  status: "Delayed",  statusColor: COLORS.gold   },
  { bus: "Sampath Travels",  route: "Galle → Colombo",  depart: "5:00 PM",  seats: "0/44",  status: "Full",     statusColor: COLORS.red    },
];

export default function OperatorDashboard({ navigation }) {
  const fadeIn   = useRef(new Animated.Value(0)).current;
  const slideY   = useRef(new Animated.Value(30)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideY,  { toValue: 0, friction: 7,   useNativeDriver: true }),
      ]),
      Animated.spring(cardAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

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
              <Text style={styles.headerGreeting}>Welcome back 👋</Text>
              <Text style={styles.headerName}>Operator</Text>
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons name="bus-clock" size={12} color={COLORS.gold} />
                <Text style={styles.roleBadgeText}>Bus Operator</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account-tie" size={26} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>

          {/* Live status banner */}
          <Animated.View style={[styles.liveBanner, { opacity: fadeIn }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBannerText}>4 active trips running today</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
          </Animated.View>

          {/* Stats */}
          <Animated.View style={[styles.statsGrid, { opacity: cardAnim, transform: [{ scale: cardAnim }] }]}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: s.color + "22" }]}>
                  <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
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
                  onPress={() => navigation?.navigate(item.screen)}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: item.color + "22" }]}>
                    <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Today's trips */}
          <Animated.View style={{ opacity: cardAnim }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Today's Trips</Text>
              <TouchableOpacity onPress={() => navigation?.navigate("MySchedules")}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {todayTrips.map((t, i) => (
              <View key={i} style={styles.tripCard}>
                <View style={styles.tripStrip} />
                <View style={styles.tripContent}>
                  <View style={styles.tripTop}>
                    <View>
                      <Text style={styles.tripBus}>{t.bus}</Text>
                      <Text style={styles.tripRoute}>{t.route}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: t.statusColor + "22" }]}>
                      <Text style={[styles.statusText, { color: t.statusColor }]}>{t.status}</Text>
                    </View>
                  </View>
                  <View style={styles.tripBottom}>
                    <View style={styles.tripMeta}>
                      <MaterialCommunityIcons name="clock-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.tripMetaText}>{t.depart}</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <MaterialCommunityIcons name="seat-passenger" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.tripMetaText}>{t.seats} seats</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate("Home")}
          >
            <MaterialCommunityIcons name="logout" size={18} color={COLORS.red} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
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
    backgroundColor: COLORS.indigo, opacity: 0.1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 16,
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
    backgroundColor: COLORS.gold + "22",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  roleBadgeText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: "700",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  // Live banner
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary + "18",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + "33",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  liveBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textHeader,
    fontWeight: "600",
  },

  // Stats
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

  // Menu
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

  // Trip cards
  tripCard: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    overflow: "hidden",
  },
  tripStrip: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  tripContent: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  tripTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tripBus: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textHeader,
    marginBottom: 2,
  },
  tripRoute: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tripBottom: {
    flexDirection: "row",
    gap: 16,
  },
  tripMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tripMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.red + "18",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.red + "33",
    paddingVertical: 14,
    marginTop: 10,
  },
  logoutText: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: "700",
  },
});