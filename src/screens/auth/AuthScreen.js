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
import { SocialButton } from '../../components/common/SocialButton';
import { signIn } from '../../services/supabase/auth';

export const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Confirmed',
            'Please check your email for a confirmation link.',
            [
              {
                text: 'OK',
                onPress: () => console.log('OK Pressed'),
              },
            ]
          );
        } else {
          Alert.alert('Error', error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} login pressed`);
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
              <Text style={styles.title}>LOGIN</Text>
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
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />

              <TouchableOpacity 
                onPress={handleForgotPassword} 
                style={styles.forgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Your Password?</Text>
              </TouchableOpacity>

              <Button 
                title={loading ? 'Logging in...' : 'Login'} 
                onPress={handleSignIn}
                disabled={loading}
              />

              <TouchableOpacity 
                onPress={handleSignUp} 
                style={styles.createAccount}
                disabled={loading}
              >
                <Text style={styles.createAccountText}>Create a new Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialSection}>
              <Text style={styles.socialText}>Or Continue with</Text>
              <View style={styles.socialButtons}>
                <SocialButton 
                  icon="google" 
                  onPress={() => handleSocialLogin('Google')}
                  disabled={loading}
                />
                <SocialButton 
                  icon="facebook" 
                  onPress={() => handleSocialLogin('Facebook')}
                  disabled={loading}
                />
                <SocialButton 
                  icon="github" 
                  onPress={() => handleSocialLogin('GitHub')}
                  disabled={loading}
                />
              </View>
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
    marginBottom: spacing.xxl * 1.25,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.sm,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  createAccount: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  createAccountText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  socialSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  socialText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
