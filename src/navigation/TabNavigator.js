import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../styles/theme';

import InclosetHomepage from '../screens/home/InclosetHomepage';
import ClosetScreen from '../screens/closet/ClosetScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerShadowVisible: false,
      headerBackTitle: '',
      headerTintColor: colors.primary,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        },
      }),
    }}
  >
    <Stack.Screen
      name="HomeScreen"
      component={InclosetHomepage}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ClosetStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerShadowVisible: false,
      headerBackTitle: '',
      headerTintColor: colors.primary,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        },
      }),
    }}
  >
    <Stack.Screen
      name="ClosetScreen"
      component={ClosetScreen}
      options={{
        headerShown: true,
        title: 'Closet',
        headerTitleStyle: {
          ...typography.subtitle,
          fontWeight: '600',
        },
      }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

// Placeholder components for other tabs
const CombineScreen = () => null;

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Closet':
              iconName = 'wardrobe-outline';
              break;
            case 'Combine':
              iconName = 'hanger';
              break;
            case 'Profile':
              iconName = 'account-circle-outline';
              break;
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Closet"
        component={ClosetStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Combine"
        component={CombineScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};
