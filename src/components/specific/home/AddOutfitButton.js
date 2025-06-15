import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { colors, spacing, layout } from '../../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

const AddOutfitButton = ({ onPress, containerColor = colors.primary }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: containerColor }
      ]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name="add" size={50} color={colors.white} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: 186,
    borderRadius: layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  content: {
    alignItems: 'center',
  },
});

export default AddOutfitButton;
