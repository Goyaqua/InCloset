import React from 'react';
// This file defines a reusable Button component for the application
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout } from '../../styles/theme'; // Importing styles from the theme

// This component renders a button with customizable title, onPress handler, and styles
export const Button = ({ title, onPress, style }) => {
  return (
    // TouchableOpacity is used to create a button that can be pressed
    <TouchableOpacity 
      style={[styles.button, style]} // Merging default styles with any additional styles passed via props
      activeOpacity={0.8} // Adjusts opacity when the button is pressed
      onPress={onPress} // Function to call when the button is pressed
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

// Styles for the Button component
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  text: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
