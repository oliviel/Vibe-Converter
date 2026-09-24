import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/js-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useRef } from 'react';
import { View } from 'react-native';

import { AppThemeProvider, useAppTheme } from '@/context/app-theme-context';
import { CurrencyProvider } from '@/context/currency-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ThemedNavigator />
    </AppThemeProvider>
  );
}

function ThemedNavigator() {
  const { theme } = useAppTheme();
  const splashHidden = useRef(false);
  const navigationTheme = {
    ...DarkTheme,
    dark: theme.mode === 'dark',
    colors: {
      ...DarkTheme.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.muted,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <CurrencyProvider>
        <View
          style={{ flex: 1, backgroundColor: theme.background }}
          onLayout={() => {
            if (splashHidden.current) return;
            splashHidden.current = true;
            void SplashScreen.hideAsync();
          }}>
          <Stack
            detachInactiveScreens={false}
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              cardStyle: { backgroundColor: theme.background },
              detachPreviousScreen: false,
            }}
          />
        </View>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
