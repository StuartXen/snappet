import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Species } from '@/analysis/types';

const OPTIONS: { id: Species; label: string; hint: string }[] = [
  { id: 'cat', label: 'Cat', hint: 'Feline Grimace Scale' },
  { id: 'dog', label: 'Dog', hint: 'Dog facial cues' },
  { id: 'other', label: 'Other', hint: 'Gentle fallback' },
];

export function SpeciesPicker({
  value,
  onChange,
}: {
  value: Species;
  onChange: (species: Species) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.accent : theme.backgroundElement,
                borderColor: selected ? theme.accent : theme.line,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: selected ? Palette.white : theme.text }}>
              {option.label}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: selected ? Palette.white : theme.textSecondary, fontSize: 11 }}>
              {option.hint}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two,
    gap: 2,
  },
});
