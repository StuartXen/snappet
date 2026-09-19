import { StyleSheet, View } from 'react-native';

import type { ComfortLevel } from '@/analysis/types';
import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LEVEL_COPY: Record<ComfortLevel, { title: string; color: string; track: string }> = {
  low: { title: 'Low discomfort cues', color: Palette.good, track: Palette.goodSoft },
  medium: { title: 'Medium discomfort cues', color: Palette.warning, track: Palette.warningSoft },
  high: { title: 'High discomfort cues', color: Palette.danger, track: Palette.dangerSoft },
};

export function ComfortMeter({
  level,
  index,
}: {
  level: ComfortLevel;
  index: number;
}) {
  const theme = useTheme();
  const copy = LEVEL_COPY[level];
  const width = `${Math.round(index * 100)}%` as const;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={{ color: copy.color }}>
          {copy.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {Math.round(index * 100)} / 100
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width, backgroundColor: copy.color }]} />
      </View>
      <View style={styles.legend}>
        <ThemedText type="small" themeColor="textSecondary">
          Low
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Medium
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          High
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 12,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: Radius.pill,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
