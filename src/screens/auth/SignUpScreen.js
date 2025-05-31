import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors, spacing, layout } from '../../styles/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { signUp } from '../../services/supabase/auth';

export const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Please check your email for a confirmation link to complete your registration.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Welcome to InCloset!</Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                icon="👤"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                returnKeyType="next"
              />
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                icon="🔒"
                secureTextEntry
                editable={!loading}
                returnKeyType="next"
              />
              <Input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="🔒"
                secureTextEntry
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />

              <Button 
                title={loading ? "Creating Account..." : "Sign Up"} 
                onPress={handleSignUp}
                disabled={loading}
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')} 
                style={styles.loginLink}
                disabled={loading}
              >
                <Text style={styles.loginLinkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.containerPadding,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
