import React from 'react';
// This file defines a reusable Button component for the application
// It includes a text input field with an optional icon, placeholder, and secure text entry
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { colors, layout, spacing } from '../../styles/theme';

// This component renders a text input field with customizable properties
export const Input = ({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false, 
  icon,
  ...props 
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </View>
    </View>
  );
};

// Styles for the Input component
const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: layout.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.md,
  },
});
