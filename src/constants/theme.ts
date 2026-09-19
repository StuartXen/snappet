import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  cream: '#F2F0EB',
  creamDeep: '#E7E2D8',
  surface: '#FFFFFF',
  terracotta: '#C45C26',
  terracottaDeep: '#9A4318',
  sage: '#5B7F6A',
  sageSoft: '#D8E6DC',
  ink: '#1C1C1E',
  inkMuted: '#8E8E93',
  line: '#E5E0D6',
  warning: '#B45309',
  warningSoft: '#FDE8C8',
  danger: '#C63C3C',
  dangerSoft: '#F8D7D3',
  good: '#2F6F4E',
  goodSoft: '#D7EDE0',
  white: '#FFFFFF',
};

export const Colors = {
  light: {
    text: Palette.ink,
    textSecondary: Palette.inkMuted,
    background: Palette.cream,
    backgroundElement: Palette.surface,
    backgroundSelected: Palette.creamDeep,
    accent: Palette.terracotta,
    accentText: Palette.white,
    sage: Palette.sage,
    line: Palette.line,
  },
  dark: {
    text: '#F5F5F7',
    textSecondary: '#8E8E93',
    background: '#000000',
    backgroundElement: '#1C1C1E',
    backgroundSelected: '#2C2C2E',
    accent: '#E08A55',
    accentText: '#1C1C1E',
    sage: '#8FB59C',
    line: '#3A3A3C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 18,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, default: 0 }) ?? 0;
export const MaxContentWidth = 430;
