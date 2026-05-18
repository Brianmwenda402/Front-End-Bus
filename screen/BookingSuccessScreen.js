import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const COLORS = {
  root:          '#0f172a',
  blobBlue:      '#5C90EB',
  blobCyan:      '#589BF2',
  card:          '#1e293b',
  cardBorder:    '#334155',
  textHeader:    '#f8fafc',
  textSecondary: '#94a3b8',
  primary:       '#5C90EB',
  green:         '#4ade80',
  white:         '#FFFFFF',
};

export default function BookingSuccessScreen({ navigation, route }) {
  const { addTicket } = useUser();
  const [processingStep, setProcessingStep] = useState(0);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  const schedule = route?.params?.schedule || {};
  const passengers = route?.params?.passengers || [];

  const processingSteps = [
    'Processing Payment',
    'Verifying Seats',
    'Confirming Booking',
    'Generating Ticket',
  ];

  useEffect(() => {
    // Simulate payment processing
    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        } else {
          setIsProcessingComplete(true);
          // Add ticket to context
          if (schedule && passengers && passengers.length > 0) {
            addTicket({
              schedule,
              passengers,
            });
          }
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isProcessingComplete) return;
    const timer = setTimeout(() => {
      navigation.replace('YourTicket', {
        schedule,
        passengers,
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [isProcessingComplete, navigation, passengers, schedule]);

  const handleContinue = () => {
    navigation.replace('YourTicket', {
      schedule,
      passengers,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.root} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.statusIcon, isProcessingComplete && styles.completeIcon]}>
              {isProcessingComplete ? (
                <MaterialIcons name="check-circle" size={56} color={COLORS.green} />
              ) : (
                <MaterialIcons name="hourglass-bottom" size={56} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.title}>
              {isProcessingComplete ? 'Booking Confirmed!' : 'Processing Booking'}
            </Text>
            <Text style={styles.subtitle}>
              {isProcessingComplete
                ? 'Your ticket has been successfully created'
                : 'Please wait while we process your booking'}
            </Text>
          </View>

          {/* Processing Steps */}
          {!isProcessingComplete && (
            <View style={styles.stepsContainer}>
              {processingSteps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={[styles.stepCircle, index === processingStep && styles.stepActive, index < processingStep && styles.stepComplete]}>
                    {index < processingStep ? (
                      <MaterialIcons name="check" size={18} color={COLORS.white} />
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepText, index === processingStep && styles.stepTextActive]}>
                    {step}
                  </Text>
                  {index === processingStep && (
                    <View style={styles.spinnerDot}>
                      <View style={[styles.dot, styles.dot1]} />
                      <View style={[styles.dot, styles.dot2]} />
                      <View style={[styles.dot, styles.dot3]} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Summary Card */}
          {isProcessingComplete && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From</Text>
                <Text style={styles.summaryValue}>{schedule.from || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To</Text>
                <Text style={styles.summaryValue}>{schedule.to || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bus</Text>
                <Text style={styles.summaryValue}>{schedule.busName || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Seats</Text>
                <Text style={styles.summaryValue}>{schedule.seatNumbers?.join(', ') || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValueHighlight}>
                  ZMW {(schedule.pricePerSeat * (schedule.seatNumbers?.length || 1))}
                </Text>
              </View>
            </View>
          )}

          {/* Continue Button */}
          {isProcessingComplete && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>View Ticket</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {/* Loading Message */}
          {!isProcessingComplete && (
            <Text style={styles.loadingMessage}>
              {processingSteps[processingStep]}...
            </Text>
          )}
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  completeIcon: {
    opacity: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Steps
  stepsContainer: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
  },
  stepComplete: {
    backgroundColor: COLORS.green,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  stepTextActive: {
    color: COLORS.textHeader,
    fontWeight: '600',
  },
  spinnerDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.3,
  },

  // Summary Card
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryRowHighlight: {
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },

  // Buttons
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  loadingMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
