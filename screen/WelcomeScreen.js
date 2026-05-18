import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const bgScale      = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoY        = useRef(new Animated.Value(40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY    = useRef(new Animated.Value(20)).current;
  const cardOpacity  = useRef(new Animated.Value(0)).current;
  const cardY        = useRef(new Animated.Value(50)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const btnScale     = useRef(new Animated.Value(0.8)).current;
  const floatY       = useRef(new Animated.Value(0)).current;
  const dotScale1    = useRef(new Animated.Value(0)).current;
  const dotScale2    = useRef(new Animated.Value(0)).current;
  const roleOpacity  = useRef(new Animated.Value(0)).current;
  const roleY        = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(bgScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(logoY,       { toValue: 0, friction: 7,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(titleY,       { toValue: 0, friction: 7,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(subtitleY,       { toValue: 0, friction: 7,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(cardY,       { toValue: 0, friction: 6,   useNativeDriver: true }),
        Animated.spring(dotScale1,   { toValue: 1, friction: 5,   useNativeDriver: true }),
      ]),
      Animated.spring(dotScale2, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(btnScale,   { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(roleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(roleY,       { toValue: 0, friction: 7,   useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0,   duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleUserSignUp = () => {
    navigation.navigate("CreateAccount", { role: "User" });
  };

  const handleUserLogin = () => {
    navigation.navigate("Login", { role: "User" });
  };

  const handleAdminLogin = () => {
    navigation.navigate("Login", { role: "Admin" });
  };

  const features = [
    { icon: "bus",                 label: "Search Routes", color: "#4ade80" },
    { icon: "ticket-confirmation", label: "Book Tickets",  color: "#60a5fa" },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f202a" />

      <Animated.View style={[styles.blobTop,    { transform: [{ scale: bgScale }] }]} />
      <Animated.View style={[styles.blobBottom, { transform: [{ scale: bgScale }] }]} />

      <View style={styles.content}>

        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: logoOpacity, transform: [{ translateY: logoY }, { translateY: floatY }] },
          ]}
        >
          <View style={styles.logoBg}>
            <Image
              source={require("../images/bus.png")}
              style={{ width: 70, height: 70, borderRadius: 35 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
          Welcome to TransitX
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }]}>
          Find and book your bus tickets effortlessly across Zambia
        </Animated.Text>

        <Animated.View style={[styles.featuresRow, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
          {features.map((f, i) => {
            const dotScales = [dotScale1, dotScale2];
            return (
              <Animated.View key={i} style={[styles.featureCard, { transform: [{ scale: dotScales[i] }] }]}>
                <View style={[styles.featureIconBg, { backgroundColor: f.color + "22" }]}>
                  <MaterialCommunityIcons name={f.icon} size={20} color={f.color} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </Animated.View>
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.btnWrapper, { opacity: btnOpacity, transform: [{ scale: btnScale }] }]}>
          <TouchableOpacity style={styles.btn} onPress={handleUserSignUp} activeOpacity={0.85}>
            <Text style={styles.btnText}>Create Account</Text>
            <Text style={styles.btnArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.roleRow, { opacity: roleOpacity, transform: [{ translateY: roleY }] }]}>

          <TouchableOpacity style={styles.roleCard} onPress={handleUserLogin} activeOpacity={0.8}>
            <View style={[styles.roleIconBg, { backgroundColor: "#60a5fa22" }]}>
              <MaterialCommunityIcons name="account" size={20} color="#60a5fa" />
            </View>
            <Text style={styles.roleLabel}>Passenger</Text>
            <Text style={styles.roleSubLabel}>Book a seat · Login</Text>
          </TouchableOpacity>

          <View style={styles.roleDivider} />

          <TouchableOpacity style={styles.roleCard} onPress={handleAdminLogin} activeOpacity={0.8}>
            <View style={[styles.roleIconBg, { backgroundColor: "#f472b622" }]}>
              <MaterialCommunityIcons name="shield-crown" size={20} color="#f472b6" />
            </View>
            <Text style={styles.roleLabel}>Admin</Text>
            <Text style={styles.roleSubLabel}>Manage system · Login</Text>
          </TouchableOpacity>

        </Animated.View>

        <Animated.Text style={[styles.signinText, { opacity: btnOpacity }]}>
          Already have an account?{" "}
          <Text style={styles.signinLink} onPress={handleUserLogin}>Sign In</Text>
        </Animated.Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f202a",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blobTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#15b0db",
    opacity: 0.18,
  },
  blobBottom: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#06b6d4",
    opacity: 0.15,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 28,
    width: "100%",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#63cbf1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
    fontWeight: "400",
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 36,
    gap: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 11,
    color: "#cbd5e1",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  btnWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#6366f1",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    gap: 10,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnArrow: {
    color: "#c7d2fe",
    fontSize: 18,
    fontWeight: "700",
  },
  roleRow: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 18,
    overflow: "hidden",
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },
  roleIconBg: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f1f5f9",
    letterSpacing: 0.2,
  },
  roleSubLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  roleDivider: {
    width: 1,
    backgroundColor: "#334155",
    marginVertical: 12,
  },
  signinText: {
    color: "#64748b",
    fontSize: 14,
  },
  signinLink: {
    color: "#818cf8",
    fontWeight: "600",
  },
});
