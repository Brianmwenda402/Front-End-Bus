import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Dimensions, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { UserInfoBadge } from '../components/UserInfoBadge';

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
  gold:          '#fbbf24',
  green:         '#4ade80',
  white:         '#FFFFFF',
};

export default function TicketScreen({ navigation, route }) {
  const getCurrentDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const passengers = route?.params?.passengers || [
    { fullName: 'Kasamba Shakalima', nrc: '123456/78/1' },
    { fullName: 'Amelia Fernando', nrc: '223456/78/1' },
  ];
  const schedule = route?.params?.schedule || { date: getCurrentDate(), depart: '6:00 AM', seatNumbers: ['3A', '3B'] };
  const bookingRefs = route?.params?.bookings
    ?.map((booking) => booking?.id)
    .filter((id) => id != null);
  const totalPrice = (Number(schedule.pricePerSeat) || 0) * (schedule.seatNumbers?.length || 1);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeArea}>

        {/* back */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <MaterialIcons name="chevron-left" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.screenLabel}>Your Ticket</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* User Info Badge */}
        <View style={styles.userInfoWrapper}>
          <UserInfoBadge compact={true} />
        </View>

        {/* bus logo */}
        <View style={styles.logoArea}>
          <View style={styles.glowRing} />
          <View style={styles.logoBg}>
            <Image
              source={require('../images/bus.png')}
              style={styles.busLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ticket card */}
        <View style={styles.ticketCard}>

          {/* notch cutouts */}
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={[styles.notch, styles.notchRight]} />

          {/* route */}
          <View style={styles.routeRow}>
            <View style={styles.routeBlock}>
              <Text style={styles.routeCity}>{(schedule.from || 'Lusaka').toLowerCase()}</Text>
              <Text style={styles.routeSub}>Origin</Text>
            </View>
            <View style={styles.routeMiddle}>
              <View style={styles.routeLine} />
              <View style={styles.busIconCircle}>
                <MaterialIcons name="directions-bus" size={16} color={COLORS.white} />
              </View>
              <View style={styles.routeLine} />
            </View>
            <View style={[styles.routeBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.routeCity}>{(schedule.to || 'Destination').toLowerCase()}</Text>
              <Text style={styles.routeSub}>Destination</Text>
            </View>
          </View>

          {/* divider with dashes */}
          <View style={styles.dashedDivider}>
            {Array(18).fill(0).map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          {/* details grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Bus Name</Text>
              <Text style={styles.detailValue}>{schedule.busName || 'N/A'}</Text>
            </View>
            <View style={[styles.detailCell, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={[styles.detailValue, { color: COLORS.gold }]}>ZMW {totalPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Departure</Text>
              <Text style={styles.detailValue}>{schedule.depart || '--'}</Text>
            </View>
            <View style={[styles.detailCell, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>Arrival</Text>
              <Text style={styles.detailValue}>{schedule.arrive || '--'}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{schedule.date || getCurrentDate()}</Text>
            </View>
            <View style={[styles.detailCell, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>Seats</Text>
              <Text style={styles.detailValue}>{schedule.seatNumbers?.join(', ') || '--'}</Text>
            </View>
            <View style={[styles.detailCell, { width: '100%' }]}>
              <Text style={styles.detailLabel}>Booking Reference</Text>
              <Text style={styles.detailValue}>
                {bookingRefs?.length ? bookingRefs.join(', ') : schedule?.backendBookingIds?.join(', ') || 'N/A'}
              </Text>
            </View>
          </View>

          {/* second divider */}
          <View style={styles.dashedDivider}>
            {Array(18).fill(0).map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          {/* Passengers */}
          <View style={styles.passengerList}>
            <Text style={styles.passengerTitle}>Passengers</Text>
            {passengers.map((passenger, index) => (
              <View key={index} style={styles.passengerItem}>
                <View style={styles.passengerHeader}>
                  <View style={styles.passengerNumber}>
                    <Text style={styles.passengerNumberText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.passengerName}>{passenger.fullName}</Text>
                    <Text style={styles.passengerSeat}>Seat: {schedule.seatNumbers?.[index] || 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.passengerContact}>
                  <Text style={styles.contactLabel}>NRC:</Text>
                  <Text style={styles.contactValue}>{passenger.nrc || 'N/A'}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* QR code */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrBorder}>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png' }}
                style={styles.qrCode}
              />
            </View>
            <Text style={styles.qrHint}>Scan to verify ticket</Text>
          </View>

          {/* status badge */}
          <View style={styles.statusBadge}>
            <MaterialIcons name="check-circle" size={14} color={COLORS.green} />
            <Text style={styles.statusText}>Confirmed</Text>
          </View>

        </View>

        {/* download button */}
        <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
          <MaterialIcons name="download" size={20} color={COLORS.white} />
          <Text style={styles.downloadText}>Download Ticket</Text>
        </TouchableOpacity>

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
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.blobCyan,
    opacity: 0.12,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    alignItems: 'center',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textHeader,
  },

  // logo
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  busLogo: {
    width: 52,
    height: 52,
  },

  // ticket
  ticketCard: {
    width: width - 40,
    backgroundColor: COLORS.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.root,
    top: '55%',
  },
  notchLeft:  { left: -14 },
  notchRight: { right: -14 },

  // route
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  routeBlock: {
    alignItems: 'flex-start',
  },
  routeCity: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
    letterSpacing: -0.3,
  },
  routeSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  routeMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  busIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },

  // dashed divider
  dashedDivider: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  dash: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.cardBorder,
  },

  // details
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    rowGap: 16,
  },
  detailCell: {
    width: '50%',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 3,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },

  // QR removed - replaced with passenger details
  passengerList: {
    width: '100%',
    marginTop: 4,
  },
  passengerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 12,
  },
  passengerItem: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  passengerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  passengerNumberText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  passengerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  passengerSeat: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  passengerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  contactLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    minWidth: 45,
  },
  contactValue: {
    fontSize: 10,
    color: COLORS.textHeader,
    flex: 1,
  },

  // QR
  qrWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  qrBorder: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 10,
  },
  qrCode: {
    width: 120,
    height: 120,
  },
  qrHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // QR removed

  // status
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: '#4ade8020',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '700',
  },

  // download
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    width: width - 40,
    paddingVertical: 17,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  downloadText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
