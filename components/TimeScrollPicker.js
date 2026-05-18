import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HOURS_12, MINUTES, PERIODS, parseTimeLabel, buildTimeLabel } from '../utils/timeUtils';

const ITEM_H = 44;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

const DEFAULT_COLORS = {
  card: '#1e293b',
  cardBorder: '#334155',
  textHeader: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#6366f1',
  inputBg: '#162032',
};

function WheelColumn({ data, selectedIndex, onSelect, formatItem, colors }) {
  const scrollRef = useRef(null);
  const pad = Math.floor(VISIBLE / 2);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
    }, 50);
    return () => clearTimeout(t);
  }, [selectedIndex, data.length]);

  const onScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(y / ITEM_H)));
    onSelect(idx);
    scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
  };

  return (
    <View style={wheelStyles.column}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: ITEM_H * pad }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
      >
        {data.map((item, i) => {
          const label = formatItem ? formatItem(item) : String(item);
          const active = i === selectedIndex;
          return (
            <View key={`${label}-${i}`} style={wheelStyles.item}>
              <Text style={[
                wheelStyles.itemText,
                { color: active ? colors.textHeader : colors.textSecondary },
                active && wheelStyles.itemTextActive,
              ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function TimeScrollPicker({
  label,
  value = '06:00 AM',
  onChange,
  placeholder = 'Select time',
  colors = DEFAULT_COLORS,
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const parsed = parseTimeLabel(value);
  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  const openModal = () => {
    const p = parseTimeLabel(value);
    setHour12(p.hour12);
    setMinute(p.minute);
    setPeriod(p.period);
    setModalVisible(true);
  };

  const confirm = () => {
    const labelStr = buildTimeLabel(hour12, minute, period);
    onChange?.(labelStr);
    setModalVisible(false);
  };

  const hourIndex = HOURS_12.indexOf(hour12);
  const minuteIndex = minute;

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <MaterialIcons name="schedule" size={18} color={colors.primary} style={{ marginRight: 10 }} />
        <Text style={[styles.selectorText, { color: value ? colors.textHeader : colors.textSecondary }]}>
          {value || placeholder}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.sheetTitle, { color: colors.textHeader }]}>
                {label || 'Select time'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewRow}>
              <Text style={[styles.previewTime, { color: colors.primary }]}>
                {buildTimeLabel(hour12, minute, period)}
              </Text>
            </View>

            <View style={styles.wheelsRow}>
              <View style={[styles.selectionBand, { borderColor: colors.primary + '44', backgroundColor: colors.primary + '12' }]} />
              <WheelColumn
                data={HOURS_12}
                selectedIndex={hourIndex >= 0 ? hourIndex : 0}
                onSelect={(idx) => setHour12(HOURS_12[idx])}
                formatItem={(h) => String(h).padStart(2, '0')}
                colors={colors}
              />
              <Text style={[styles.colon, { color: colors.textHeader }]}>:</Text>
              <WheelColumn
                data={MINUTES}
                selectedIndex={minuteIndex}
                onSelect={(idx) => setMinute(MINUTES[idx])}
                formatItem={(m) => String(m).padStart(2, '0')}
                colors={colors}
              />
              <WheelColumn
                data={PERIODS}
                selectedIndex={PERIODS.indexOf(period)}
                onSelect={(idx) => setPeriod(PERIODS[idx])}
                colors={colors}
              />
            </View>

            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={confirm}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  column: { flex: 1, height: PICKER_H, overflow: 'hidden' },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: 20, fontWeight: '500' },
  itemTextActive: { fontSize: 24, fontWeight: '800' },
});

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', marginBottom: 8,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  selector: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14,
  },
  selectorText: { flex: 1, fontSize: 15, fontWeight: '600' },
  overlay: {
    flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  previewRow: { alignItems: 'center', paddingVertical: 16 },
  previewTime: { fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  wheelsRow: {
    flexDirection: 'row', alignItems: 'center',
    height: PICKER_H, marginHorizontal: 16, position: 'relative',
  },
  selectionBand: {
    position: 'absolute', left: 0, right: 0,
    top: ITEM_H * 2, height: ITEM_H,
    borderRadius: 12, borderWidth: 1,
    zIndex: 0,
  },
  colon: { fontSize: 28, fontWeight: '800', marginHorizontal: 4, zIndex: 1 },
  doneBtn: {
    marginHorizontal: 20, marginTop: 20,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
