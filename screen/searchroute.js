import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, StatusBar, Modal,
  FlatList,
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
  orange:        '#fb923c',
  white:         '#FFFFFF',
};

// ── Zambian Cities ──────────────────────────────────────
const CITIES = [
  'Lusaka', 'Kitwe', 'Ndola', 'Livingstone', 'Kabwe',
  'Chipata', 'Solwezi', 'Kasama', 'Mongu', 'Choma',
  'kapiri', 'Kafue', 'Luanshya', 'Mufulira', 'Chingola',
  'Mansa', 'Mpika', 'Serenje', 'Petauke', 'Nyimba',
];

// ── Zambian Bus Companies ───────────────────────────────
const ALL_BUSES = [
  {
    id: '1',
    company:    'Jonda motors Bus',
    busNumber:  'ABB 1234 ZM',
    type:       'Luxury (2+1)',
    from:       'Lusaka',
    to:         'Livingstone',
    depart:     '06:00 AM',
    arrive:     '11:00 AM',
    duration:   '5h',
    price:      280,
    seats:      32,
    totalSeats: 45,
    rating:     4.8,
    amenities:  ['ac', 'wifi', 'usb'],
    color:      COLORS.primary,
  },
  {
    id: '2',
    company:    'UBZ',
    busNumber:  'ACA 5678 ZM',
    type:       'Semi-Luxury (2+2)',
    from:       'Lusaka',
    to:         'Livingstone',
    depart:     '07:30 AM',
    arrive:     '12:30 PM',
    duration:   '5h',
    price:      200,
    seats:      18,
    totalSeats: 44,
    rating:     4.5,
    amenities:  ['ac', 'usb'],
    color:      COLORS.green,
  },
  {
    id: '3',
    company:    'Power Tools Bus',
    busNumber:  'ACB 9999 ZM',
    type:       'Standard (2+2)',
    from:       'Lusaka',
    to:         'Livingstone',
    depart:     '09:00 AM',
    arrive:     '02:00 PM',
    duration:   '5h',
    price:      150,
    seats:      40,
    totalSeats: 55,
    rating:     4.2,
    amenities:  ['ac'],
    color:      COLORS.orange,
  },
  {
    id: '4',
    company:    'Jordan Motors',
    busNumber:  'ADA 3456 ZM',
    type:       'Luxury (2+1)',
    from:       'Lusaka',
    to:         'Kitwe',
    depart:     '05:30 AM',
    arrive:     '09:30 AM',
    duration:   '4h',
    price:      250,
    seats:      22,
    totalSeats: 45,
    rating:     4.7,
    amenities:  ['ac', 'wifi', 'usb', 'tv'],
    color:      COLORS.primary,
  },
  {
    id: '5',
    company:    'zambia-malawi Bus Services',
    busNumber:  'ACZ 7890 ZM',
    type:       'Semi-Luxury (2+2)',
    from:       'Lusaka',
    to:         'Kitwe',
    depart:     '08:00 AM',
    arrive:     '12:00 PM',
    duration:   '4h',
    price:      180,
    seats:      10,
    totalSeats: 44,
    rating:     4.3,
    amenities:  ['ac', 'usb'],
    color:      COLORS.blobCyan,
  },
  {
    id: '6',
    company:    'zambia-malawi Bus Services',
    busNumber:  'ABD 2345 ZM',
    type:       'Standard (2+2)',
    from:       'Lusaka',
    to:         'Chipata',
    depart:     '06:00 AM',
    arrive:     '12:00 PM',
    duration:   '6h',
    price:      160,
    seats:      35,
    totalSeats: 55,
    rating:     4.1,
    amenities:  ['ac'],
    color:      COLORS.gold,
  },
  {
    id: '7',
    company:    'Power tools bus',
    busNumber:  'ABB 5555 ZM',
    type:       'Luxury (2+1)',
    from:       'Lusaka',
    to:         'Chipata',
    depart:     '07:00 AM',
    arrive:     '01:00 PM',
    duration:   '6h',
    price:      300,
    seats:      28,
    totalSeats: 45,
    rating:     4.9,
    amenities:  ['ac', 'wifi', 'usb', 'tv'],
    color:      COLORS.primary,
  },
  {
    id: '8',
    company:    'UBZ',
    busNumber:  'ACC 1122 ZM',
    type:       'Semi-Luxury (2+2)',
    from:       'Lusaka',
    to:         'Ndola',
    depart:     '06:30 AM',
    arrive:     '10:30 AM',
    duration:   '4h',
    price:      190,
    seats:      20,
    totalSeats: 44,
    rating:     4.4,
    amenities:  ['ac', 'usb'],
    color:      COLORS.green,
  },
  {
    id: '9',
    company:    'Shalom Bus Services',
    busNumber:  'ACA 3344 ZM',
    type:       'Luxury (2+1)',
    from:       'Kitwe',
    to:         'Lusaka',
    depart:     '05:00 AM',
    arrive:     '09:00 AM',
    duration:   '4h',
    price:      260,
    seats:      14,
    totalSeats: 45,
    rating:     4.6,
    amenities:  ['ac', 'wifi', 'usb'],
    color:      COLORS.green,
  },
  {
    id: '10',
    company:    'Jordan motors',
    busNumber:  'ABE 6677 ZM',
    type:       'Standard (2+2)',
    from:       'Livingstone',
    to:         'Lusaka',
    depart:     '07:00 AM',
    arrive:     '12:00 PM',
    duration:   '5h',
    price:      140,
    seats:      45,
    totalSeats: 55,
    rating:     4.0,
    amenities:  ['ac'],
    color:      COLORS.orange,
  },
];

const POPULAR_ROUTES = [
  { from: 'Lusaka',     to: 'Livingstone', duration: '5h',  price: 150, icon: '🦁' },
  { from: 'Lusaka',     to: 'Kitwe',       duration: '4h',  price: 180, icon: '⛏️' },
  { from: 'Lusaka',     to: 'Chipata',     duration: '6h',  price: 160, icon: '🌿' },
  { from: 'Lusaka',     to: 'Ndola',       duration: '4h',  price: 190, icon: '🏭' },
  { from: 'Livingstone', to: 'Lusaka',     duration: '5h',  price: 140, icon: '💦' },
  { from: 'Kitwe',      to: 'Lusaka',      duration: '4h',  price: 180, icon: '🔩' },
];

const AMENITY_ICONS = {
  ac:   { icon: 'air-conditioner',    label: 'A/C'     },
  wifi: { icon: 'wifi',               label: 'WiFi'    },
  usb:  { icon: 'usb-port',           label: 'USB'     },
  tv:   { icon: 'television-play',    label: 'TV'      },
};

const SORT_OPTIONS = ['Price: Low to High', 'Price: High to Low', 'Departure Time', 'Rating', 'Seats Available'];

// ── City Picker Modal ───────────────────────────────────
function CityPicker({ visible, onClose, onSelect, title, exclude }) {
  const [search, setSearch] = useState('');
  const filtered = CITIES.filter(c => c !== exclude && c.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.sheetHeader}>
            <Text style={m.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={m.sheetClose}>
              <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={m.searchRow}>
            <MaterialIcons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={m.searchInput}
              placeholder="Search city..."
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={i => i}
            renderItem={({ item }) => (
              <TouchableOpacity style={m.cityItem} onPress={() => { onSelect(item); onClose(); }}>
                <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                <Text style={m.cityItemText}>{item}</Text>
                <MaterialIcons name="chevron-right" size={18} color={COLORS.cardBorder} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Bus Card ────────────────────────────────────────────
function BusCard({ bus, onBook }) {
  const seatsLeft = bus.seats;
  const seatColor = seatsLeft <= 5 ? COLORS.red : seatsLeft <= 15 ? COLORS.gold : COLORS.green;
  const fillPct   = Math.round(((bus.totalSeats - bus.seats) / bus.totalSeats) * 100);

  return (
    <View style={bc.card}>
      {/* Left accent */}
      <View style={[bc.accent, { backgroundColor: bus.color }]} />

      <View style={bc.content}>
        {/* Top row */}
        <View style={bc.topRow}>
          <View>
            <Text style={bc.company}>{bus.company}</Text>
            <Text style={bc.busNum}>{bus.busNumber}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={bc.price}>K {bus.price}</Text>
            <Text style={bc.perPerson}>per person</Text>
          </View>
        </View>

        {/* Time row */}
        <View style={bc.timeRow}>
          <View style={bc.timeBlock}>
            <Text style={bc.timeText}>{bus.depart}</Text>
            <Text style={bc.timeCity}>{bus.from}</Text>
          </View>
          <View style={bc.timeMiddle}>
            <View style={bc.timeLine} />
            <View style={bc.timeBadge}>
              <MaterialIcons name="directions-bus" size={12} color={bus.color} />
              <Text style={[bc.timeDuration, { color: bus.color }]}>{bus.duration}</Text>
            </View>
            <View style={bc.timeLine} />
          </View>
          <View style={[bc.timeBlock, { alignItems: 'flex-end' }]}>
            <Text style={bc.timeText}>{bus.arrive}</Text>
            <Text style={bc.timeCity}>{bus.to}</Text>
          </View>
        </View>

        {/* Bus type + rating */}
        <View style={bc.metaRow}>
          <View style={[bc.typeBadge, { backgroundColor: bus.color + '18' }]}>
            <Text style={[bc.typeText, { color: bus.color }]}>{bus.type}</Text>
          </View>
          <View style={bc.ratingBadge}>
            <MaterialIcons name="star" size={12} color={COLORS.gold} />
            <Text style={bc.ratingText}>{bus.rating}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={bc.divider} />

        {/* Amenities */}
        <View style={bc.amenitiesRow}>
          {bus.amenities.map(a => (
            <View key={a} style={bc.amenityChip}>
              <MaterialCommunityIcons name={AMENITY_ICONS[a].icon} size={13} color={COLORS.textSecondary} />
              <Text style={bc.amenityText}>{AMENITY_ICONS[a].label}</Text>
            </View>
          ))}
          <View style={{ flex: 1 }} />
          {/* Seat fill bar */}
          <View style={bc.seatBarWrap}>
            <View style={bc.seatBarBg}>
              <View style={[bc.seatBarFill, { width: `${fillPct}%`, backgroundColor: seatColor }]} />
            </View>
            <Text style={[bc.seatsLeft, { color: seatColor }]}>{seatsLeft} seats left</Text>
          </View>
        </View>

        {/* Book button */}
        <TouchableOpacity
          style={[bc.bookBtn, { backgroundColor: bus.color }]}
          onPress={() => onBook(bus)}
          activeOpacity={0.85}
        >
          <Text style={bc.bookBtnText}>Book Now</Text>
          <MaterialIcons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────
export default function SearchScreen({ navigation }) {
  const [from,          setFrom]         = useState('');
  const [to,            setTo]           = useState('');
  const [date,          setDate]         = useState('');
  const [seats,         setSeats]        = useState('1');
  const [fromModal,     setFromModal]    = useState(false);
  const [toModal,       setToModal]      = useState(false);
  const [sortModal,     setSortModal]    = useState(false);
  const [selectedSort,  setSelectedSort] = useState('Price: Low to High');
  const [results,       setResults]      = useState([]);
  const [searched,      setSearched]     = useState(false);
  const [filterType,    setFilterType]   = useState('All');

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const handleSearch = () => {
    let found = ALL_BUSES.filter(b => {
      const fromMatch = !from || b.from.toLowerCase() === from.toLowerCase();
      const toMatch   = !to   || b.to.toLowerCase()   === to.toLowerCase();
      return fromMatch && toMatch;
    });
    setResults(found);
    setSearched(true);
  };

  const applyRoute = (route) => {
    setFrom(route.from);
    setTo(route.to);
  };

  const sortedResults = [...results]
    .filter(b => filterType === 'All' || b.type.includes(filterType))
    .sort((a, b) => {
      if (selectedSort === 'Price: Low to High')  return a.price - b.price;
      if (selectedSort === 'Price: High to Low')  return b.price - a.price;
      if (selectedSort === 'Rating')              return b.rating - a.rating;
      if (selectedSort === 'Seats Available')     return b.seats - a.seats;
      if (selectedSort === 'Departure Time')      return a.depart.localeCompare(b.depart);
      return 0;
    });

  const BUS_TYPES = ['All', 'Luxury', 'Semi-Luxury', 'Standard'];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerGreeting}>Find Your Bus 🚌</Text>
              <Text style={styles.headerSub}>Zambia's trusted booking platform</Text>
            </View>
            <View style={styles.zmFlag}>
              <Text style={{ fontSize: 22 }}>🇿🇲</Text>
            </View>
          </View>

          {/* Search card */}
          <View style={styles.searchCard}>

            {/* From */}
            <Text style={styles.fieldLabel}>From</Text>
            <TouchableOpacity
              style={styles.citySelector}
              onPress={() => setFromModal(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.cityIconWrap, { backgroundColor: COLORS.primary + '22' }]}>
                <MaterialIcons name="trip-origin" size={16} color={COLORS.primary} />
              </View>
              <Text style={[styles.citySelectorText, !from && { color: COLORS.textSecondary }]}>
                {from || 'Select departure city'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Swap */}
            <View style={styles.swapWrap}>
              <View style={styles.swapLine} />
              <TouchableOpacity style={styles.swapBtn} onPress={swap} activeOpacity={0.8}>
                <MaterialCommunityIcons name="swap-vertical" size={18} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.swapLine} />
            </View>

            {/* To */}
            <Text style={styles.fieldLabel}>To</Text>
            <TouchableOpacity
              style={styles.citySelector}
              onPress={() => setToModal(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.cityIconWrap, { backgroundColor: COLORS.blobCyan + '22' }]}>
                <MaterialIcons name="location-on" size={16} color={COLORS.blobCyan} />
              </View>
              <Text style={[styles.citySelectorText, !to && { color: COLORS.textSecondary }]}>
                {to || 'Select destination city'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Date + Seats row */}
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.halfInput}>
                  <MaterialIcons name="event" size={16} color={COLORS.gold} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.halfInputText}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={COLORS.textSecondary}
                    value={date}
                    onChangeText={setDate}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ width: '38%' }}>
                <Text style={styles.fieldLabel}>Passengers</Text>
                <View style={styles.seatsRow}>
                  <TouchableOpacity
                    style={styles.seatsBtn}
                    onPress={() => setSeats(s => String(Math.max(1, parseInt(s) - 1)))}
                  >
                    <MaterialIcons name="remove" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.seatsValue}>{seats}</Text>
                  <TouchableOpacity
                    style={styles.seatsBtn}
                    onPress={() => setSeats(s => String(Math.min(10, parseInt(s) + 1)))}
                  >
                    <MaterialIcons name="add" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Search button */}
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
              <MaterialIcons name="search" size={20} color={COLORS.white} />
              <Text style={styles.searchBtnText}>Search Buses</Text>
            </TouchableOpacity>

          </View>

          {/* Popular routes */}
          {!searched && (
            <>
              <Text style={styles.sectionTitle}>Popular Routes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }}>
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
                  {POPULAR_ROUTES.map((r, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.routeCard}
                      onPress={() => applyRoute(r)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.routeCardIcon}>{r.icon}</Text>
                      <Text style={styles.routeCardRoute}>{r.from}</Text>
                      <MaterialIcons name="arrow-forward" size={12} color={COLORS.textSecondary} />
                      <Text style={styles.routeCardRoute}>{r.to}</Text>
                      <View style={styles.routeCardMeta}>
                        <Text style={styles.routeCardDuration}>{r.duration}</Text>
                        <Text style={styles.routeCardPrice}>from K{r.price}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* All companies */}
              <Text style={styles.sectionTitle}>Bus Companies</Text>
              <View style={styles.companiesGrid}>
                {['UBZ', 'Shalom Bus Services', 'Power Tools Bus',
                  'Jordan Motors', 'CR Carriers', 'Zambia-malawi Bus Services',
                  'Euro Africa Bus', 'Germins Bus Services'].map((c, i) => (
                  <View key={i} style={styles.companyChip}>
                    <MaterialCommunityIcons name="bus" size={14} color={COLORS.primary} />
                    <Text style={styles.companyChipText}>{c}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Results */}
          {searched && (
            <>
              {/* Results header */}
              <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.resultsTitle}>
                    {sortedResults.length} bus{sortedResults.length !== 1 ? 'es' : ''} found
                  </Text>
                  {from && to && (
                    <Text style={styles.resultsSub}>{from} → {to}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModal(true)} activeOpacity={0.8}>
                  <MaterialIcons name="sort" size={16} color={COLORS.primary} />
                  <Text style={styles.sortBtnText}>Sort</Text>
                </TouchableOpacity>
              </View>

              {/* Filter tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10 }}>
                  {BUS_TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.filterTab, filterType === t && styles.filterTabActive]}
                      onPress={() => setFilterType(t)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterTabText, filterType === t && styles.filterTabTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {sortedResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>🚍</Text>
                  <Text style={styles.emptyTitle}>No buses found</Text>
                  <Text style={styles.emptySub}>Try a different route or date</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={() => setSearched(false)}>
                    <Text style={styles.emptyBtnText}>Browse Routes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                sortedResults.map(bus => (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    onBook={b => navigation?.navigate('SelectBus', { routeBuses: sortedResults, from, to, selectedBus: b })}
                  />
                ))
              )}
            </>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* City modals */}
      <CityPicker
        visible={fromModal}
        onClose={() => setFromModal(false)}
        onSelect={setFrom}
        title="Select Departure City"
        exclude={to}
      />
      <CityPicker
        visible={toModal}
        onClose={() => setToModal(false)}
        onSelect={setTo}
        title="Select Destination City"
        exclude={from}
      />

      {/* Sort modal */}
      <Modal visible={sortModal} animationType="slide" transparent onRequestClose={() => setSortModal(false)}>
        <View style={m.overlay}>
          <View style={[m.sheet, { maxHeight: '50%' }]}>
            <View style={m.sheetHeader}>
              <Text style={m.sheetTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setSortModal(false)} style={m.sheetClose}>
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[m.cityItem, selectedSort === opt && { backgroundColor: COLORS.primary + '18' }]}
                onPress={() => { setSelectedSort(opt); setSortModal(false); }}
              >
                <MaterialIcons
                  name={selectedSort === opt ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={18}
                  color={selectedSort === opt ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[m.cityItemText, selectedSort === opt && { color: COLORS.primary }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: COLORS.root, overflow: 'hidden' },
  blobTop:    { position: 'absolute', top: -100, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: COLORS.blobBlue, opacity: 0.15 },
  blobBottom: { position: 'absolute', bottom: '30%', left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.blobCyan, opacity: 0.1 },
  safe:       { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  scroll:     { paddingHorizontal: 20, paddingBottom: 48 },

  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 20 },
  headerGreeting:  { fontSize: 24, fontWeight: '800', color: COLORS.textHeader, letterSpacing: -0.3 },
  headerSub:       { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  zmFlag:          { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },

  searchCard:   { backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 20, marginBottom: 28 },
  fieldLabel:   { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  citySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, height: 54, paddingHorizontal: 14, marginBottom: 4 },
  cityIconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  citySelectorText: { flex: 1, fontSize: 15, color: COLORS.textHeader, fontWeight: '600' },

  swapWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  swapLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  swapBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginHorizontal: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },

  rowInputs:     { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 },
  halfInput:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, height: 50, paddingHorizontal: 14 },
  halfInputText: { flex: 1, fontSize: 14, color: COLORS.textHeader },
  seatsRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, height: 50, paddingHorizontal: 8, justifyContent: 'space-between' },
  seatsBtn:      { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  seatsValue:    { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },

  searchBtn:     { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  searchBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textHeader, marginBottom: 14 },

  routeCard:         { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 16, width: 160, alignItems: 'center' },
  routeCardIcon:     { fontSize: 28, marginBottom: 10 },
  routeCardRoute:    { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  routeCardMeta:     { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  routeCardDuration: { fontSize: 11, color: COLORS.textSecondary },
  routeCardPrice:    { fontSize: 11, color: COLORS.primary, fontWeight: '700' },

  companiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  companyChip:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: 12, paddingVertical: 8 },
  companyChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },

  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  resultsTitle:  { fontSize: 17, fontWeight: '700', color: COLORS.textHeader },
  resultsSub:    { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sortBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: 12, paddingVertical: 8 },
  sortBtnText:   { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  filterTab:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  filterTabActive:   { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
  filterTabText:     { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.primary },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textHeader, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  emptyBtn:   { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});

// ── Bus Card Styles ─────────────────────────────────────
const bc = StyleSheet.create({
  card:     { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16, overflow: 'hidden' },
  accent:   { width: 4 },
  content:  { flex: 1, padding: 16 },

  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  company:   { fontSize: 15, fontWeight: '800', color: COLORS.textHeader },
  busNum:    { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  price:     { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  perPerson: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'right' },

  timeRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timeBlock:   { alignItems: 'flex-start' },
  timeText:    { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },
  timeCity:    { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  timeMiddle:  { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  timeLine:    { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  timeBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.inputBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: 6 },
  timeDuration:{ fontSize: 11, fontWeight: '700' },

  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeText:  { fontSize: 11, fontWeight: '700' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.gold + '18', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },

  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginBottom: 12 },

  amenitiesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  amenityChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.inputBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  amenityText:  { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },

  seatBarWrap: { alignItems: 'flex-end', gap: 4 },
  seatBarBg:   { width: 80, height: 5, backgroundColor: COLORS.cardBorder, borderRadius: 3, overflow: 'hidden' },
  seatBarFill: { height: '100%', borderRadius: 3 },
  seatsLeft:   { fontSize: 10, fontWeight: '700' },

  bookBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12 },
  bookBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});

// ── Modal Styles ────────────────────────────────────────
const m = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.cardBorder, maxHeight: '75%', paddingBottom: 32 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  sheetTitle:  { fontSize: 17, fontWeight: '700', color: COLORS.textHeader },
  sheetClose:  { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  searchRow:   { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textHeader },
  cityItem:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder + '66' },
  cityItemText:{ flex: 1, fontSize: 15, color: COLORS.textHeader, fontWeight: '500' },
});
