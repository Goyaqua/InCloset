import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qpozswddfqntfwtltdei.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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
