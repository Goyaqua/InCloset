import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, spacing, layout } from '../../styles/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SocialButton } from '../../components/common/SocialButton';
import { signIn, signUp } from '../../services/supabase/auth';

export const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const { data, error } = await signIn(email, password);
    if (error) Alert.alert('Error', error.message);
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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LOGIN</Text>
          <Text style={styles.subtitle}>Welcome to InCloset!</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            icon="👤"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            icon="🔒"
            secureTextEntry
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Your Password?</Text>
          </TouchableOpacity>

          <Button title="Login" onPress={handleSignIn} />

          <TouchableOpacity onPress={handleSignUp} style={styles.createAccount}>
            <Text style={styles.createAccountText}>Create a new Account</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <Text style={styles.socialText}>Or Continue with</Text>
          <View style={styles.socialButtons}>
            <SocialButton 
              icon="google" 
              onPress={() => handleSocialLogin('Google')}
            />
            <SocialButton 
              icon="facebook" 
              onPress={() => handleSocialLogin('Facebook')}
            />
            <SocialButton 
              icon="github" 
              onPress={() => handleSocialLogin('GitHub')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.containerPadding,
    justifyContent: 'center',
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
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  createAccount: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createAccountText: {
    color: colors.primary,
    ...typography.caption,
  },
  socialSection: {
    alignItems: 'center',
  },
  socialText: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
