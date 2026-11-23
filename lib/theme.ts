import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

export const THEME = {
  light: {
    background: '#faf8ff',
    foreground: '#131b2e',
    card: '#ffffff',
    cardForeground: '#131b2e',
    popover: '#ffffff',
    popoverForeground: '#131b2e',
    primary: '#00288e',
    primaryForeground: '#ffffff',
    secondary: '#006c49',
    secondaryForeground: '#ffffff',
    muted: '#f2f3ff',
    mutedForeground: '#444653',
    accent: '#eaedff',
    accentForeground: '#131b2e',
    destructive: '#ba1a1a',
    border: '#e2e8f0',
    input: '#cbd5e1',
    ring: '#1e40af',
  },
  dark: {
    background: '#0f172a',
    foreground: '#eef0ff',
    card: '#182238',
    cardForeground: '#eef0ff',
    popover: '#182238',
    popoverForeground: '#eef0ff',
    primary: '#b8c4ff',
    primaryForeground: '#001453',
    secondary: '#4edea3',
    secondaryForeground: '#002113',
    muted: '#202c47',
    mutedForeground: '#acbcd6',
    accent: '#283044',
    accentForeground: '#eef0ff',
    destructive: '#ff6467',
    border: '#334155',
    input: '#334155',
    ring: '#b8c4ff',
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
