import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'eyebrow' | 'hero';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'hero' && styles.hero,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'eyebrow' && styles.eyebrow,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 40,
    fontFamily: Fonts.rounded,
  },
  hero: {
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 46,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  link: {
    lineHeight: 22,
    fontSize: 15,
    fontWeight: 600,
  },
});
