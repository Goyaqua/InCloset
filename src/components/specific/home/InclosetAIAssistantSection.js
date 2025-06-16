import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../../styles/theme';

const InclosetAIAssistantSection = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={() => navigation.navigate('ChatbotScreen')}>
      <View style={styles.iconContainer}>
        <Ionicons name="sparkles" size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>AI Stylist</Text>
        <Text style={styles.subtitle}>
          Get personalized outfit suggestions and chat with your AI fashion assistant!
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Try AI Stylist</Text>
        <Ionicons name="arrow-forward-circle" size={18} color={colors.white} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.container2,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    backgroundColor: colors.background,
    borderRadius: 50,
    padding: 12,
    marginBottom: spacing.sm,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  buttonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InclosetAIAssistantSection; 
