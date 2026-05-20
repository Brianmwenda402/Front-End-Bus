import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  lightBlueBackground: '#DFEAF5',
  textHeader: '#000000',
  textSecondary: '#667C8A',
  buttonPrimary: '#5C90EB',
};

export default function SuccessScreen({ onContinue }) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.successBackground} />

      <SafeAreaView style={styles.statusBarMockSuccess}>
        <View style={styles.mockStatusLeft} />
        <View style={styles.mockStatusRight}>
          <Text style={styles.mockSignal}>||||</Text>
          <Text style={styles.mockBattery}>53%</Text>
        </View>
      </SafeAreaView>

      <View style={styles.congratulationContent}>
        <Image
          source={require('./assets/confetti-popper.png')} 
          style={styles.popperImage}
          resizeMode="contain"
        />

        <Text style={styles.successHeading}>Congratulation !</Text>

        <View style={styles.textBlock}>
          <Text style={styles.successText}>Thank you for signing up with us!</Text>
          <Text style={styles.successText}>
            We are excited to have you on board. Enjoy a seamless and{' '}
            <Text style={styles.boldText}>convenient experience</Text> as you explore our services.
          </Text>
          <Text style={styles.successText}>
            Stay tuned for updates and offers, and feel free to reach out if you need any assistance.
          </Text>
          <Text style={styles.successText}>We look forward to serving you!</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButtonSuccess} onPress={onContinue}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  successBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '60%',
    backgroundColor: COLORS.lightBlueBackground,
    borderBottomLeftRadius: 1000,
    borderBottomRightRadius: 1000,
    transform: [{ scaleX: 1.5 }],
  },
  statusBarMockSuccess: {
    flexDirection: 'row',
    width: width,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
    paddingHorizontal: 20,
    height: 70,
  },
  mockStatusLeft: {
    width: 20,
  },
  mockStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockSignal: {
    fontSize: 12,
    color: '#000',
    marginRight: 5,
    fontFamily: 'sans-serif-thin',
  },
  mockBattery: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'sans-serif-thin',
  },
  congratulationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 60,
    marginTop: 20,
  },
  popperImage: {
    width: 150,
    height: 150,
    marginBottom: 50,
  },
  successHeading: {
    fontSize: 26,
    color: COLORS.textHeader,
    marginBottom: 35,
    fontFamily: 'sans-serif-medium',
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
  },
  successText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
    fontFamily: 'sans-serif-light',
  },
  boldText: {
    color: COLORS.textHeader,
    fontFamily: 'sans-serif-medium',
  },
  primaryButtonSuccess: {
    backgroundColor: COLORS.buttonPrimary,
    width: width - 60,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    letterSpacing: 0.5,
    fontFamily: 'sans-serif-medium',
  },
});