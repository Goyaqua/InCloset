import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../styles/theme';

const tabs = [
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'wardrobe', label: 'Closet', icon: 'wardrobe-outline' },
  { id: 'clothes', label: 'Combine', icon: 'hanger' },
  { id: 'profile', label: 'Profile', icon: 'account-circle-outline' }
];

const BottomNavigation = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && styles.activeTab
            ]}
            onPress={() => onTabPress(tab.id)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={24}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.tabText,
              isActive && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primary + '20', // 20% opacity
    borderRadius: 20,
    width: '90%',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BottomNavigation;
