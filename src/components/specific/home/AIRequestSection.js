import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../../styles/theme';

const AIRequestSection = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>WHAT DO YOU WANT TO WEAR?</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Request outfit from AI"
          placeholderTextColor={colors.placeholderText}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={24} color={colors.blue} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightBlueBackground,
    borderRadius: 25,
    padding: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.blue,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputFrameBackground,
    borderRadius: 25,
    paddingHorizontal: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 40,
    color: colors.textPrimary,
  },
  sendButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});

export default AIRequestSection; 