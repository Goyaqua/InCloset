import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../styles/theme';

import InclosetHomepage from '../screens/home/InclosetHomepage';
import ClosetScreen from '../screens/closet/ClosetScreen';
import AddClothesScreen from '../screens/closet/AddClothesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabs = [
  { name: 'Home', icon: 'home-outline' },
  { name: 'Closet', icon: 'wardrobe-outline' },
  { name: 'Combine', icon: 'hanger' },
  { name: 'Profile', icon: 'account-circle-outline' },
];

// Common stack options
const defaultStackOptions = {
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  animationEnabled: true,
  animation: 'slide_from_right',
};

// Stack navigators
const HomeStack = () => (
  <Stack.Navigator screenOptions={defaultStackOptions}>
    <Stack.Screen name="HomeScreen" component={InclosetHomepage} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const ClosetStack = () => (
  <Stack.Navigator screenOptions={defaultStackOptions}>
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
    <Stack.Screen
      name="AddClothes"
      component={AddClothesScreen}
      options={{
        headerShown: true,
        title: 'Add Item',
        headerTitleStyle: {
          ...typography.subtitle,
          fontWeight: '600',
        },
      }}
    />
  </Stack.Navigator>
);

// Placeholder screens
const CombineScreen = () => <View />;
const ProfileScreen = () => <View />;

const screenMap = {
  Home: HomeStack,
  Closet: ClosetStack,
  Combine: CombineScreen,
  Profile: ProfileScreen,
};

// Custom Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const tabWidth = Dimensions.get('window').width / tabs.length;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.tabBar}>
      <Animated.View
        style={[
          styles.bubble,
          {
            width: tabWidth * 0.75,
            transform: [
              {
                translateX: Animated.add(
                  translateX,
                  new Animated.Value((tabWidth - tabWidth * 0.75) / 2)
                ),
              },
            ],
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = tabs[index].icon;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconLabelContainer}>
              <MaterialCommunityIcons
                name={iconName}
                size={26}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.label, isFocused && styles.activeLabel]}>
                {route.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Final Tab Navigator
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={screenMap[tab.name]}
        />
      ))}
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1.3,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    height: 78,
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    transform: [{ translateY: -4 }],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  bubble: {
    height: 52,
    backgroundColor: colors.primary + '50',
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    left: 0,
    zIndex: 0,
  },
});
