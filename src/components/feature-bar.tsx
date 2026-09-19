import { StyleSheet, View } from 'react-native';

import type { FeatureScore } from '@/analysis/types';
import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function FeatureBar({ feature }: { feature: FeatureScore }) {
  const theme = useTheme();
  const width = `${Math.round(feature.normalized * 100)}%` as const;
  const color =
    feature.rawScore >= 1.34 ? Palette.danger : feature.rawScore >= 0.67 ? Palette.warning : Palette.sage;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <ThemedText type="smallBold">{feature.label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {feature.rawScore.toFixed(1)} / 2
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {feature.evidence}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: Radius.pill,
  },
});
