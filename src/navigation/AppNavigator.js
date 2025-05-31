import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import InclosetHomepage from '../screens/home/InclosetHomepage';
import ClosetScreen from '../screens/closet/ClosetScreen';
import { colors, typography } from '../styles/theme';

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
            <Stack.Screen 
              name="Closet"
              component={ClosetScreen}
              options={{ 
                headerShown: true,
                title: 'My Closet',
          headerTitleStyle: {
            ...typography.subtitle,
            fontWeight: '600',
          },
              }}
            />
            <Stack.Screen 
              name="AddClothes"
              component={ClosetScreen} // Placeholder until AddClothes screen is created
              options={{ 
                headerShown: true,
                title: 'Add New Item',
          headerTitleStyle: {
            ...typography.subtitle,
            fontWeight: '600',
          },
              }}
            />
            <Stack.Screen 
              name="ClothingDetails"
              component={ClosetScreen} // Placeholder until ClothingDetails screen is created
              options={{ 
                headerShown: true,
                title: 'Item Details',
          headerTitleStyle: {
            ...typography.subtitle,
            fontWeight: '600',
          },
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
