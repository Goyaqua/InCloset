import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { colors, spacing, layout } from '../../../styles/theme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

const AddOutfitButton = ({ onPress, containerColor = colors.primary }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { borderColor: containerColor }
      ]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.plusIcon, { color: containerColor }]}>+</Text>
        <Text style={[styles.text, { color: containerColor }]}>Add Outfit</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: 186,
    marginRight: spacing.md,
    borderRadius: layout.borderRadius,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  content: {
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AddOutfitButton;
