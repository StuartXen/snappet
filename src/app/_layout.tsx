import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTheme, useThemeName } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useTheme();
  const scheme = useThemeName();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: theme.accent,
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: { fontWeight: '600', color: theme.text },
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="result" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen
          name="science"
          options={{
            presentation: 'modal',
            title: 'About the science',
          }}
        />
      </Stack>
    </>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};
