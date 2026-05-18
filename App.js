import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './context/UserContext';
import WelcomeScreen from './screen/WelcomeScreen';
import LoginScreen from './screen/LOGIN';
import CreateAccountScreen from './screen/CreateAccount';
import AdminHomeScreen from './screen/AdminHomeScreen';
import UserNavigator from './navigation/UsernavigationBar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
          <Stack.Screen name="UserMain" component={UserNavigator} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </UserProvider>
  );
}
