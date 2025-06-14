import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, ActivityIndicator, Keyboard } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../../styles/theme';

const InclosetAIAssistantSection = () => {
  const [prompt, setPrompt] = useState('');
  const [outputImage, setOutputImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateSuggestion = async () => {
    if (!prompt) return;
    
    // Dismiss keyboard
    Keyboard.dismiss();
    
    setIsLoading(true);
    setIsExpanded(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // For demo purposes, using a placeholder image
      setOutputImage('https://via.placeholder.com/400x600/FFC0CB/000000?text=AI+Generated+Outfit');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
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
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !prompt && styles.sendButtonDisabled
          ]} 
          onPress={handleGenerateSuggestion}
          disabled={!prompt || isLoading}
        >
          <MaterialCommunityIcons name="send" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.outputContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Generating your outfit...</Text>
            </View>
          ) : outputImage ? (
            <View style={styles.outputImageContainer}>
              <Image 
                source={{ uri: outputImage }}
                style={styles.outputImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => {
                  setOutputImage(null);
                  setIsExpanded(false);
                  setPrompt('');
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
    backgroundColor: colors.container2,
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1,
  },
  containerExpanded: {
    minHeight: 500,
    position: 'relative',
    zIndex: 1,
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#1B5E20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    minHeight: 40,
    borderRadius: 10,
    marginHorizontal: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: spacing.xs,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  outputContainer: {
    flex: 1,
    marginTop: spacing.md,
    backgroundColor: colors.container2,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  outputImageContainer: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.container2,
    position: 'relative',
    zIndex: 1,
  },
  outputImage: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    borderRadius: 15,
    marginBottom: spacing.md,
  },
  clearButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    marginTop: spacing.md,
  },
  clearButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InclosetAIAssistantSection; 
