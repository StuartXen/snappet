import { StyleSheet, View } from 'react-native';

import type { BiometricSignal } from '@/analysis/types';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SignalRow({ signal }: { signal: BiometricSignal }) {
  const theme = useTheme();
  const width = `${Math.round(signal.value * 100)}%` as const;

  return (
    <View style={styles.wrap} accessibilityLabel={`${signal.label} ${Math.round(signal.value * 100)}`}>
      <View style={styles.header}>
        <ThemedText type="body">{signal.label}</ThemedText>
        <ThemedText type="footnote" themeColor="textSecondary">
          {Math.round(signal.value * 100)}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width, backgroundColor: theme.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  track: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: Radius.pill,
  },
});
