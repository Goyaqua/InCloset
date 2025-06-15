import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { AppNavigator } from './src/navigation/AppNavigator';
import { onAuthStateChange, getSession } from './src/services/supabase/auth';

// Configure and prevent auto hide
// Enable native screens implementation
enableScreens();

SplashScreen.preventAutoHideAsync()
  .then(result => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
  .catch(console.warn);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Loading splash screen...');
        
        // Check for existing session
        const { session: existingSession, error: sessionError } = await getSession();
        if (sessionError) {
          console.warn('Error getting session:', sessionError);
        }
        setSession(existingSession);

        // Set up auth state listener
        const { data: authListener } = onAuthStateChange((session) => {
          console.log('Auth state changed:', session ? 'logged in' : 'logged out');
          setSession(session);
        });

        // Wait for session to be properly initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Tell the application to render
        setAppIsReady(true);
        setIsInitializing(false);

        return () => {
          authListener?.unsubscribe();
        };
      } catch (e) {
        console.warn('Error in splash screen:', e);
        setIsInitializing(false);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        console.log('Hiding splash screen...');
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden successfully');
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady || isInitializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppNavigator session={session} />
      </View>
    </GestureHandlerRootView>
  );
}
