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
  primary:       "#6366f1",
  cyan:          "#15b0db",
  green:         "#4ade80",
  gold:          "#fbbf24",
  pink:          "#f472b6",
  red:           "#f87171",
  white:         "#FFFFFF",
};

const stats = [
  { label: "Total Users",     value: "128",  icon: "account-group",      color: COLORS.cyan  },
  { label: "Total Buses",     value: "34",   icon: "bus-multiple",        color: COLORS.green },
  { label: "Bookings Today",  value: "56",   icon: "ticket-confirmation", color: COLORS.gold  },
  { label: "Total Revenue",   value: "$4.2K",icon: "cash-multiple",       color: COLORS.pink  },
];

const menuItems = [
  { label: "Manage Users",     icon: "account-cog",        color: COLORS.cyan,    screen: "ManageUsers"    },
  { label: "Manage Buses",     icon: "bus-wrench",          color: COLORS.green,   screen: "ManageBuses"    },
  { label: "Schedules",        icon: "calendar-clock",      color: COLORS.gold,    screen: "Schedules"      },
  { label: "All Bookings",     icon: "clipboard-list",      color: COLORS.pink,    screen: "AllBookings"    },
  { label: "Stations",         icon: "map-marker-multiple", color: "#a78bfa",      screen: "Stations"       },
  { label: "Reports",          icon: "chart-bar",           color: COLORS.red,     screen: "Reports"        },
];

const recentBookings = [
  { name: "Kasamba Shakalima", route: "Colombo → Kandy",   seats: 2, status: "Confirmed", statusColor: COLORS.green },
  { name: "John Mutua",        route: "Kandy → Galle",     seats: 1, status: "Pending",   statusColor: COLORS.gold  },
  { name: "Amara Perera",      route: "Galle → Colombo",   seats: 3, status: "Confirmed", statusColor: COLORS.green },
  { name: "David Osei",        route: "Colombo → Matara",  seats: 2, status: "Cancelled", statusColor: COLORS.red   },
];

export default function AdminDashboard({ navigation }) {
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
              <Text style={styles.headerGreeting}>Good Morning 👋</Text>
              <Text style={styles.headerName}>Brian Mwenda</Text>
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons name="shield-crown" size={12} color={COLORS.pink} />
                <Text style={styles.roleBadgeText}>Administrator</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={26} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>

          {/* Stats grid */}
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

          {/* Recent bookings */}
          <Animated.View style={{ opacity: cardAnim }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => navigation?.navigate("AllBookings")}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {recentBookings.map((b, i) => (
              <View key={i} style={styles.bookingCard}>
                <View style={styles.bookingLeft}>
                  <View style={styles.bookingAvatar}>
                    <MaterialCommunityIcons name="account" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.bookingName}>{b.name}</Text>
                    <Text style={styles.bookingRoute}>{b.route} · {b.seats} seat{b.seats > 1 ? "s" : ""}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: b.statusColor + "22" }]}>
                  <Text style={[styles.statusText, { color: b.statusColor }]}>{b.status}</Text>
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

  // Header
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
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

  // Bookings
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  bookingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  bookingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  bookingName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textHeader,
    marginBottom: 2,
  },
  bookingRoute: {
    fontSize: 11,
    color: COLORS.textSecondary,
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