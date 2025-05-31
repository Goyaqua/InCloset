import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import InclosetHomepage from '../screens/home/InclosetHomepage';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

// Main App Navigator
export const AppNavigator = ({ session }) => {
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
        {session ? (
          // Authenticated Stack
          <Stack.Group>
            <Stack.Screen 
              name="Home"
              component={InclosetHomepage}
              options={{ 
                headerShown: false
              }}
            />
          </Stack.Group>
        ) : (
          // Non-authenticated Stack
          <Stack.Group>
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
                headerShown: true,
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
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
