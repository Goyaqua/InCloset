import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { colors, spacing, layout } from '../../../styles/theme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

const AddOutfitButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.plusIcon}>+</Text>
        <Text style={styles.text}>Add Outfit</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    marginRight: spacing.md,
    borderRadius: layout.borderRadius,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default AddOutfitButton;
