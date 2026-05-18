import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Dimensions, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const COLORS = {
  root:         '#0f172a',
  blobBlue:     '#5C90EB',
  blobCyan:     '#589BF2',
  card:         '#1e293b',
  cardBorder:   '#334155',
  textHeader:   '#f8fafc',
  textSecondary:'#94a3b8',
  primary:      '#5C90EB',
  inputBg:      '#162032',
  white:        '#FFFFFF',
};

export default function SelectSeatsScreen({ navigation, route }) {
  const bus = route?.params?.bus || {
    busNumber: 'BUS-001',
    source: 'Lusaka',
    destination: 'Livingstone',
    depart: '6:00 AM',
    arrive: '12:00 PM',
    price: 250,
    totalSeats: 45,
    id: 1,
  };

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigateToRouteInParentChain = (routeName, params) => {
    let currentNav = navigation;

    while (currentNav) {
      const state = currentNav.getState?.();
      if (state?.routeNames?.includes(routeName)) {
        currentNav.navigate(routeName, params);
        return true;
      }
      currentNav = currentNav.getParent?.();
    }

    return false;
  };

  const handleBook = async () => {
    if (quantity === 0) {
      Alert.alert("No Tickets Selected", "Please select at least one ticket");
      return;
    }

    setLoading(true);
    try {
      // Demo-only fake processing. No backend booking call is made here.
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const seatNumbers = Array.from({ length: quantity }, (_, i) => i + 1);
      const params = {
        schedule: {
          busName: bus.busNumber,
          busType: 'Bus Trip',
          from: bus.source,
          to: bus.destination,
          depart: bus.depart,
          arrive: bus.arrive,
          seatNumbers,
          pricePerSeat: bus.price,
          date: new Date().toLocaleDateString('en-US'),
        },
        passengers: Array.from({ length: quantity }, (_, i) => ({
          fullName: `Passenger ${i + 1}`,
          phone: '+260-97-123-4567',
          email: `passenger${i + 1}@email.com`,
        })),
      };

      const didNavigate = navigateToRouteInParentChain('BookingSuccess', params);
      if (!didNavigate) {
        navigation.replace('YourTicket', params);
      }
    } catch (error) {
      console.error("Booking flow error:", error);
      Alert.alert("Error", "Unable to continue booking flow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          <Text style={styles.headerTitle}>Select Seats</Text>

          <View style={styles.routeContainer}>
            <Text style={styles.routeText}>{bus.source}</Text>
            <View style={styles.swapCircle}>
              <FontAwesome5 name="exchange-alt" size={12} color={COLORS.white} />
            </View>
            <Text style={styles.routeText}>{bus.destination}</Text>
          </View>

          <View style={styles.busPill}>
            <MaterialIcons name="directions-bus" size={13} color={COLORS.primary} />
            <Text style={styles.busNameText}>{bus.busNumber}</Text>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Number of Tickets</Text>

            {/* Quantity selector */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <MaterialIcons name="remove" size={24} color={COLORS.white} />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.min(bus.totalSeats, quantity + 1))}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Price info */}
            <View style={styles.priceInfo}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price per Ticket</Text>
                <Text style={styles.priceValue}>K {bus.price}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalValue}>K {bus.price * quantity}</Text>
              </View>
            </View>

            {/* Book button */}
            <TouchableOpacity
              style={[styles.bookBtn, { opacity: quantity === 0 ? 0.5 : 1 }]}
              activeOpacity={0.85}
              onPress={handleBook}
              disabled={quantity === 0 || loading}
            >
              {loading ? (
                <Text style={styles.bookBtnText}>Processing...</Text>
              ) : (
                <>
                  <Text style={styles.bookBtnText}>
                    Book {quantity} {quantity === 1 ? 'Ticket' : 'Tickets'}
                  </Text>
                  {quantity > 0 && <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />}
                </>
              )}
            </TouchableOpacity>

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

  // header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    gap: 12,
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
  },
  busPill: {
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
  busNameText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // panel
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

  // section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 32,
  },

  // quantity selector
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  quantityBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    minWidth: 60,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // price info
  priceInfo: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    marginBottom: 28,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.textHeader,
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.textHeader,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '800',
  },

  // legend (removed - no longer needed)
  legendRow: {
    display: 'none',
  },
  legendItem: {
    display: 'none',
  },
  legendBox: {
    display: 'none',
  },
  legendText: {
    display: 'none',
  },

  // front (removed - no longer needed)
  frontIndicator: {
    display: 'none',
  },
  frontText: {
    display: 'none',
  },

  // seat grid (removed - no longer needed)
  seatGrid: {
    display: 'none',
  },
  seatRow: {
    display: 'none',
  },
  lastRow: {
    display: 'none',
  },
  seat: {
    display: 'none',
  },
  seatLabel: {
    display: 'none',
  },
  aisleGap: {
    display: 'none',
  },

  // selected info (removed - no longer needed)
  selectedInfo: {
    display: 'none',
  },
  selectedInfoText: {
    display: 'none',
  },

  // book button
  bookBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    maxWidth: 340,
    paddingVertical: 17,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
