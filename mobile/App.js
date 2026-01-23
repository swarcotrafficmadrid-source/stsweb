import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CreateTicketScreen from './src/screens/CreateTicketScreen';
import TicketDetailScreen from './src/screens/TicketDetailScreen';
import CameraScreen from './src/screens/CameraScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#006BAB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'SWARCO SAT' }}
        />
        <Stack.Screen 
          name="CreateTicket" 
          component={CreateTicketScreen}
          options={{ title: 'Nuevo Ticket' }}
        />
        <Stack.Screen 
          name="TicketDetail" 
          component={TicketDetailScreen}
          options={{ title: 'Detalle del Ticket' }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{ title: 'Tomar Foto' }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen}
          options={{ title: 'Escanear QR' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
