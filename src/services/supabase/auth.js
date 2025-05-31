import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qpozswddfqntfwtltdei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwb3pzd2RkZnFudGZ3dGx0ZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTIxNDQsImV4cCI6MjA2NDI2ODE0NH0.BTLaKRtJjB_K-QZrYJ2tJDar-oDRwQ9jANMHUdOUnJU';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Sign up with email
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
};

// Get current session
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session ?? null, error };
  } catch (error) {
    return { session: null, error };
  }
};

// Set up auth state change listener
export const onAuthStateChange = (callback) => {
  try {
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session);
      }
    );
    return { data: authListener, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
