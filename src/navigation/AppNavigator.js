import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

// Main App Navigator
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
          headerBackTitle: '',
          headerTintColor: colors.primary,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={AuthScreen}
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ 
            headerShown: true, // Show header for Sign Up screen
            title: '' 
          }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{ 
            headerShown: true,
            title: '' 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
