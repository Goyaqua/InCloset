import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qpozswddfqntfwtltdei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwb3pzd2RkZnFudGZ3dGx0ZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTIxNDQsImV4cCI6MjA2NDI2ODE0NH0.BTLaKRtJjB_K-QZrYJ2tJDar-oDRwQ9jANMHUdOUnJU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};
