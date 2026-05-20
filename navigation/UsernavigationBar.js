import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import UserHomeScreen from '../screen/UserHomeScreen';
import BookingScreen from '../screen/BookingScreen';
import UserProfile from '../screen/UserProfile';
import SelectBusScreen from '../screen/Selectbus';
import SelectSeatsScreen from '../screen/Selectseats';
import PassengerDetailsScreen from '../screen/PassengerDetailsScreen';
import PaymentConfirmationScreen from '../screen/PaymentScreen';
import BookingSuccessScreen from '../screen/BookingSuccessScreen';
import TicketScreen from '../screen/TicketScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const THEME = {
  tabBg: '#1e293b',
  tabActive: '#6366f1',
  tabInactive: '#64748b',
  border: '#334155',
};

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.tabBg,
          borderTopColor: THEME.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: THEME.tabActive,
        tabBarInactiveTintColor: THEME.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Book: 'directions-bus',
            Tickets: 'confirmation-number',
            Profile: 'person',
          };
          return <MaterialIcons name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Book"
        component={UserHomeScreen}
        options={{ tabBarLabel: 'Book Bus' }}
      />
      <Tab.Screen
        name="Tickets"
        component={BookingScreen}
        options={{ tabBarLabel: 'My Tickets' }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfile}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function UserNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="SelectBus" component={SelectBusScreen} />
      <Stack.Screen name="SelectSeats" component={SelectSeatsScreen} />
      <Stack.Screen name="PassDetails" component={PassengerDetailsScreen} />
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      <Stack.Screen name="YourTicket" component={TicketScreen} />
    </Stack.Navigator>
  );
}
