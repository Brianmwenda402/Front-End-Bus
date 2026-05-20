// ── PaymentConfirmationScreen.jsx ────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', icon: 'credit-card',        color: COLORS.primary },
  { id: 'mobile', label: 'Mobile Money',         icon: 'cellphone-wireless', color: COLORS.green   },
  { id: 'cash',   label: 'Pay at Counter',       icon: 'cash-register',      color: COLORS.gold    },
];

export default function PaymentConfirmationScreen({ navigation, route }) {
  const getCurrentDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const schedule    = route?.params?.schedule    || { busName: 'UBZ', busType: 'A/C Sleeper (2+2)', from: 'LUSAKA', to: 'Kandy', date: getCurrentDate(), depart: '6:00 AM', seatNumbers: ['3A','3B'], pricePerSeat: 1000 };
  const passengers  = route?.params?.passengers  || [{ fullName: 'Kasamba Shakalima' }, { fullName: 'Brian mwenda' }];
  const totalAmount = route?.params?.totalAmount || 2000;

  const [method,   setMethod]   = useState('card');
  const [cardNum,  setCardNum]  = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry,   setExpiry]   = useState('');
  const [cvv,      setCvv]      = useState('');
  const [mobile,   setMobile]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [paid,     setPaid]     = useState(false);

  const fmtCard   = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setPaid(true); }, 2000);
  };

  // ── SUCCESS ──────────────────────────────────────────
  if (paid) {
    return (
      <View style={[p.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
        <View style={p.blobTop} /><View style={p.blobBottom} />

        <View style={p.successCard}>
          <View style={p.successIconWrap}>
            <View style={p.successRing} />
            <View style={p.successIconBg}>
              <MaterialIcons name="check" size={44} color={COLORS.white} />
            </View>
          </View>

          <Text style={p.successTitle}>Payment Successful!</Text>
          <Text style={p.successSub}>Your booking is confirmed. A ticket has been sent to your email.</Text>

          <View style={p.successDetails}>
            {[
              { label: 'Amount Paid', value: `ZMW ${totalAmount.toLocaleString()}` },
              { label: 'Route',       value: `${schedule.from} → ${schedule.to}`   },
              { label: 'Seats',       value: schedule.seatNumbers?.join(', ')       },
              { label: 'Date',        value: schedule.date                          },
              { label: 'Departure',   value: schedule.depart                        },
            ].map((r, i) => (
              <View key={i} style={p.successDetailRow}>
                <Text style={p.successDetailLabel}>{r.label}</Text>
                <Text style={p.successDetailValue}>{r.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={p.viewTicketBtn} onPress={() => navigation?.navigate('YourTicket', { passengers, schedule })} activeOpacity={0.85}>
            <MaterialIcons name="confirmation-number" size={18} color={COLORS.white} />
            <Text style={p.viewTicketBtnText}>View My Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity style={p.homeBtn} onPress={() => navigation?.navigate('Main')} activeOpacity={0.8}>
            <Text style={p.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── PAYMENT FORM ─────────────────────────────────────
  return (
    <View style={p.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={p.blobTop} /><View style={p.blobBottom} />

      <SafeAreaView style={p.safe}>

        {/* Header */}
        <View style={p.header}>
          <TouchableOpacity style={p.backBtn} onPress={() => navigation?.goBack()}>
            <MaterialIcons name="chevron-left" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={p.screenLabel}>Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>

          {/* Amount banner */}
          <View style={p.amountBanner}>
            <Text style={p.amountLabel}>Total Amount Due</Text>
            <Text style={p.amountValue}>ZMW {totalAmount.toLocaleString()}</Text>
            <Text style={p.amountSub}>
              {passengers.length} passenger{passengers.length > 1 ? 's' : ''} · {schedule.seatNumbers?.join(', ')}
            </Text>
          </View>

          {/* Trip recap */}
          <View style={p.card}>
            <View style={p.recapRow}>
              <View style={p.recapIcon}>
                <MaterialIcons name="directions-bus" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={p.recapBus}>{schedule.busName}</Text>
                <Text style={p.recapType}>{schedule.busType}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={p.recapRoute}>{schedule.from} → {schedule.to}</Text>
                <Text style={p.recapDate}>{schedule.date} · {schedule.depart}</Text>
              </View>
            </View>
          </View>

          {/* Passengers */}
          <View style={p.card}>
            <Text style={p.cardTitle}>Passengers</Text>
            {passengers.map((ps, i) => (
              <View key={i} style={p.passengerRow}>
                <View style={p.passengerAvatar}>
                  <MaterialIcons name="person" size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={p.passengerName}>{ps.fullName || `Passenger ${i+1}`}</Text>
                  <Text style={p.passengerSeat}>Seat {schedule.seatNumbers?.[i]}</Text>
                </View>
              <Text style={p.passengerAmt}>ZMW {schedule.pricePerSeat?.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Payment methods */}
          <View style={p.card}>
            <Text style={p.cardTitle}>Payment Method</Text>
            {METHODS.map(m => (
              <TouchableOpacity key={m.id}
                style={[p.methodCard, method === m.id && { borderColor: m.color, backgroundColor: m.color + '15' }]}
                onPress={() => setMethod(m.id)} activeOpacity={0.8}>
                <View style={[p.methodIconBg, { backgroundColor: m.color + '22' }]}>
                  <MaterialCommunityIcons name={m.icon} size={20} color={m.color} />
                </View>
                <Text style={[p.methodLabel, method === m.id && { color: m.color }]}>{m.label}</Text>
                {method === m.id && (
                  <View style={[p.methodCheck, { backgroundColor: m.color }]}>
                    <MaterialIcons name="check" size={10} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Card fields */}
          {method === 'card' && (
            <View style={p.card}>
              <Text style={p.cardTitle}>Card Details</Text>

              <PField label="Card Number">
                <PInputRow icon="credit-card" color={COLORS.primary}>
                  <TextInput style={p.input} placeholder="0000 0000 0000 0000"
                    placeholderTextColor={COLORS.textSecondary}
                    value={cardNum} onChangeText={v => setCardNum(fmtCard(v))}
                    keyboardType="numeric" maxLength={19} />
                </PInputRow>
              </PField>

              <PField label="Name on Card">
                <PInputRow icon="person" color={COLORS.primary}>
                  <TextInput style={p.input} placeholder="Full name as on card"
                    placeholderTextColor={COLORS.textSecondary}
                    value={cardName} onChangeText={setCardName}
                    autoCapitalize="characters" />
                </PInputRow>
              </PField>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <PField label="Expiry">
                    <PInputRow icon="event" color={COLORS.gold}>
                      <TextInput style={p.input} placeholder="MM/YY"
                        placeholderTextColor={COLORS.textSecondary}
                        value={expiry} onChangeText={v => setExpiry(fmtExpiry(v))}
                        keyboardType="numeric" maxLength={5} />
                    </PInputRow>
                  </PField>
                </View>
                <View style={{ flex: 1 }}>
                  <PField label="CVV">
                    <PInputRow icon="lock" color={COLORS.red}>
                      <TextInput style={p.input} placeholder="•••"
                        placeholderTextColor={COLORS.textSecondary}
                        value={cvv} onChangeText={setCvv}
                        keyboardType="numeric" maxLength={4} secureTextEntry />
                    </PInputRow>
                  </PField>
                </View>
              </View>
            </View>
          )}

          {/* Mobile money */}
          {method === 'mobile' && (
            <View style={p.card}>
              <Text style={p.cardTitle}>Mobile Money</Text>
              <PField label="Mobile Number">
                <PInputRow icon="phone" color={COLORS.green}>
                  <TextInput style={p.input} placeholder="Enter mobile number"
                    placeholderTextColor={COLORS.textSecondary}
                    value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
                </PInputRow>
              </PField>
              <View style={p.infoBanner}>
                <MaterialIcons name="info-outline" size={15} color={COLORS.green} />
                <Text style={[p.infoBannerText, { color: COLORS.green }]}>
                  A payment prompt will be sent to your mobile number.
                </Text>
              </View>
            </View>
          )}

          {/* Cash */}
          {method === 'cash' && (
            <View style={p.card}>
              <View style={p.infoBanner}>
                <MaterialIcons name="info-outline" size={15} color={COLORS.gold} />
                <Text style={[p.infoBannerText, { color: COLORS.gold }]}>
                  Please pay ZMW {totalAmount.toLocaleString()} at the counter before boarding.
                  Your seat is reserved for 30 minutes.
                </Text>
              </View>
            </View>
          )}

          {/* Price breakdown */}
          <View style={p.card}>
            <Text style={p.cardTitle}>Price Breakdown</Text>
            {passengers.map((ps, i) => (
              <View key={i} style={p.priceRow}>
                <Text style={p.priceLabel}>{ps.fullName || `Passenger ${i+1}`} · Seat {schedule.seatNumbers?.[i]}</Text>
                <Text style={p.priceValue}>ZMW {schedule.pricePerSeat?.toLocaleString()}</Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 12 }} />
            <View style={p.priceRow}>
              <Text style={p.priceTotalLabel}>Total</Text>
              <Text style={p.priceTotalValue}>ZMW {totalAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Pay button */}
          <TouchableOpacity style={[p.payBtn, loading && { opacity: 0.7 }]}
            onPress={handlePay} activeOpacity={0.85} disabled={loading}>
            {loading
              ? <Text style={p.payBtnText}>Processing...</Text>
              : <>
                  <MaterialIcons name="lock" size={18} color={COLORS.white} />
                  <Text style={p.payBtnText}>Pay ZMW {totalAmount.toLocaleString()}</Text>
                </>
            }
          </TouchableOpacity>

          <Text style={p.secureNote}>🔒 Secured with 256-bit SSL encryption</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PField({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={p.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function PInputRow({ icon, color, children }) {
  return (
    <View style={p.inputRow}>
      <View style={[p.inputIconWrap, { backgroundColor: color + '22' }]}>
        <MaterialIcons name={icon} size={16} color={color} />
      </View>
      {children}
    </View>
  );
}

const p = StyleSheet.create({
  root:       { flex: 1, backgroundColor: COLORS.root, overflow: 'hidden' },
  blobTop:    { position: 'absolute', top: -100, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: COLORS.blobBlue, opacity: 0.15 },
  blobBottom: { position: 'absolute', bottom: '30%', left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.blobCyan, opacity: 0.1 },
  safe:       { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  screenLabel: { fontSize: 17, fontWeight: '700', color: COLORS.textHeader },

  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 16 },

  amountBanner: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  amountLabel:  { fontSize: 13, color: '#c7d2fe', fontWeight: '600', marginBottom: 6 },
  amountValue:  { fontSize: 40, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5, marginBottom: 4 },
  amountSub:    { fontSize: 13, color: '#c7d2fe' },

  card:      { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 20 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader, marginBottom: 16 },

  recapRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recapIcon:  { width: 42, height: 42, borderRadius: 13, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  recapBus:   { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  recapType:  { fontSize: 11, color: COLORS.textSecondary },
  recapRoute: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  recapDate:  { fontSize: 11, color: COLORS.textSecondary },

  passengerRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  passengerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  passengerName:   { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  passengerSeat:   { fontSize: 11, color: COLORS.textSecondary },
  passengerAmt:    { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  methodCard:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.cardBorder, marginBottom: 10 },
  methodIconBg:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodLabel:   { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  methodCheck:   { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  fieldLabel:   { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 },
  inputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, height: 50, paddingHorizontal: 12 },
  inputIconWrap:{ width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  input:        { flex: 1, fontSize: 14, color: COLORS.textHeader },

  infoBanner:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.green + '12', borderRadius: 12, borderWidth: 1, borderColor: COLORS.green + '33', padding: 14 },
  infoBannerText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  priceRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel:      { fontSize: 13, color: COLORS.textSecondary, flex: 1, marginRight: 8 },
  priceValue:      { fontSize: 13, color: COLORS.textHeader, fontWeight: '600' },
  priceTotalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader },
  priceTotalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  payBtn:    { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  payBtnText:{ color: COLORS.white, fontSize: 17, fontWeight: '700' },
  secureNote:{ textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

  // success
  successCard:       { width: '90%', backgroundColor: COLORS.card, borderRadius: 28, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 32, alignItems: 'center' },
  successIconWrap:   { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successRing:       { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.green, opacity: 0.12 },
  successIconBg:     { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.green, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  successTitle:      { fontSize: 26, fontWeight: '800', color: COLORS.textHeader, marginBottom: 10, letterSpacing: -0.3 },
  successSub:        { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successDetails:    { width: '100%', backgroundColor: COLORS.inputBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 16, marginBottom: 24 },
  successDetailRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  successDetailLabel:{ fontSize: 13, color: COLORS.textSecondary },
  successDetailValue:{ fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  viewTicketBtn:     { width: '100%', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
  viewTicketBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  homeBtn:           { width: '100%', backgroundColor: COLORS.inputBg, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  homeBtnText:       { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
});
