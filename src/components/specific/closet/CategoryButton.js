import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../../styles/theme';

const CategoryButton = ({ title, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
    onPress={onPress}
  >
    {icon ? (
      <Text style={[styles.categoryIcon, isActive && styles.activeCategoryIcon]}>
        {icon}
      </Text>
    ) : (
      <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  categoryButton: {
    paddingHorizontal: 18.5,
    paddingVertical: 5,
    borderRadius: 10
    ,
    marginRight: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  activeCategoryButton: {
    backgroundColor: '#2E7D32',
    borderColor:'rgb(42, 118, 47)',
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: colors.background,
  },
  categoryIcon: {
    fontSize: 18,
  },
  activeCategoryIcon: {
    fontSize: 18,
  },
});

export default CategoryButton;
