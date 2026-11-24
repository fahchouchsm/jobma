import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

export const THEME = {
  light: {
    background: '#f8f9fb',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    primary: '#1d4ed8',
    primaryForeground: '#ffffff',
    secondary: '#059669',
    secondaryForeground: '#ffffff',
    muted: '#f1f5f9',
    mutedForeground: '#475569',
    accent: '#eef2ff',
    accentForeground: '#0f172a',
    destructive: '#dc2626',
    border: '#e2e8f0',
    input: '#cbd5e1',
    ring: '#1d4ed8',
  },
  dark: {
    background: '#000000',
    foreground: '#f5f5f5',
    card: '#121212',
    cardForeground: '#f5f5f5',
    popover: '#121212',
    popoverForeground: '#f5f5f5',
    primary: '#0095f6',
    primaryForeground: '#ffffff',
    secondary: '#10b981',
    secondaryForeground: '#000000',
    muted: '#262626',
    mutedForeground: '#a8a8a8',
    accent: '#363636',
    accentForeground: '#f5f5f5',
    destructive: '#ed4956',
    border: '#262626',
    input: '#363636',
    ring: '#0095f6',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
