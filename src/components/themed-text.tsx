import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'largeTitle'
    | 'title'
    | 'title2'
    | 'body'
    | 'footnote'
    | 'caption'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'hero'
    | 'eyebrow';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const resolved = type === 'default' || type === 'body' ? 'body' : type;

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily: Fonts.rounded },
        resolved === 'largeTitle' && styles.largeTitle,
        resolved === 'hero' && styles.largeTitle,
        resolved === 'title' && styles.title,
        resolved === 'title2' && styles.title2,
        resolved === 'subtitle' && styles.title2,
        resolved === 'body' && styles.body,
        resolved === 'footnote' && styles.footnote,
        resolved === 'small' && styles.footnote,
        resolved === 'caption' && styles.caption,
        resolved === 'smallBold' && styles.footnoteBold,
        resolved === 'eyebrow' && styles.eyebrow,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  footnoteBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
