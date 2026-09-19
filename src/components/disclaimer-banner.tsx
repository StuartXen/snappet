import { StyleSheet, View } from 'react-native';

import { DISCLAIMER } from '@/analysis/citations';
import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useThemeName } from '@/hooks/use-theme';

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  const dark = useThemeName() === 'dark';
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: dark ? '#3A322A' : Palette.warningSoft, borderColor: dark ? '#5A4A38' : '#E8C48A' },
      ]}>
      <ThemedText type="eyebrow" style={{ color: Palette.warning }}>
        Not a vet diagnosis
      </ThemedText>
      <ThemedText type="small" style={styles.copy}>
        {compact
          ? 'Photo signals only. Not a diagnosis. High discomfort cues → consider a veterinary check.'
          : DISCLAIMER}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  copy: {
    color: Palette.ink,
  },
});
