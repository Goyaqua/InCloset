import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../../styles/theme';

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'wardrobe', label: 'Wardrobe' },
  { id: 'outfits', label: 'Outfits' },
  { id: 'profile', label: 'Profile' }
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
            {/* We'll use text for now, can be replaced with icons */}
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
    marginHorizontal: spacing.xs,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BottomNavigation;
