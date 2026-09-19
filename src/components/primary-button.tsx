import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PrimaryButton({
  label,
  loading,
  variant = 'solid',
  ...props
}: PressableProps & {
  label: string;
  loading?: boolean;
  variant?: 'solid' | 'ghost';
}) {
  const theme = useTheme();
  const solid = variant === 'solid';

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: solid ? theme.accent : 'transparent',
          opacity: pressed || props.disabled ? 0.65 : 1,
        },
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={solid ? Palette.white : theme.accent} />
      ) : (
        <ThemedText type="smallBold" style={{ color: solid ? Palette.white : theme.accent, fontSize: 17 }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
});
