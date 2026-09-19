import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  cream: '#F7F0E6',
  creamDeep: '#EFE4D4',
  surface: '#FFF8F0',
  terracotta: '#C45C26',
  terracottaDeep: '#9A4318',
  sage: '#5B7F6A',
  sageSoft: '#D8E6DC',
  ink: '#2C241C',
  inkMuted: '#6B5E52',
  line: '#E6D7C4',
  warning: '#B45309',
  warningSoft: '#FDE8C8',
  danger: '#9B2C2C',
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
    text: '#F6EFE4',
    textSecondary: '#C9B8A6',
    background: '#1C1814',
    backgroundElement: '#2A241E',
    backgroundSelected: '#3A322A',
    accent: '#E0894F',
    accentText: '#1C1814',
    sage: '#8FB59C',
    line: '#3F362C',
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
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, default: 0 }) ?? 0;
export const MaxContentWidth = 560;
