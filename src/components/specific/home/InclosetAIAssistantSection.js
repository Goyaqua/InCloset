import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../../styles/theme';

const InclosetAIAssistantSection = () => {
  const [prompt, setPrompt] = useState('');
  const [outputImage, setOutputImage] = useState(null); // Placeholder for AI-generated image

  const handleGenerateSuggestion = () => {
    // For now, this is just a UI placeholder.
    // In a real implementation, you would send the 'prompt' to your AI backend.
    console.log('AI Assistant Prompt:', prompt);
    // Simulate an image output for UI demonstration
    setOutputImage('https://via.placeholder.com/150/FFC0CB/000000?text=AI+Outfit'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>INCLOSET AI ASSISTANT</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask for outfit suggestions (e.g., 'casual look for a park')"
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          maxLength={200}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleGenerateSuggestion}>
          <MaterialCommunityIcons name="send" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {outputImage && (
        <View style={styles.outputImageContainer}>
          <Text style={styles.outputTitle}>AI Generated Outfit:</Text>
          <Image 
            source={{ uri: outputImage }}
            style={styles.outputImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.clearButton} onPress={() => setOutputImage(null)}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.container2, // Using container2 for consistency
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: spacing.md,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: spacing.xs,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outputImageContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: spacing.md,
  },
  outputTitle: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  outputImage: {
    width: Dimensions.get('window').width * 0.7, // Adjust size as needed
    height: Dimensions.get('window').width * 0.7, // Keep aspect ratio 1:1 for now
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  clearButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  clearButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default InclosetAIAssistantSection; 