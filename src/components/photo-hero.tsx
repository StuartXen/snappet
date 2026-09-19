import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PhotoHero({
  uri,
  imageKey,
  species,
  size = 'large',
}: {
  uri: string;
  imageKey: string;
  species?: string;
  size?: 'large' | 'small';
}) {
  const theme = useTheme();
  const glyph = species?.toLowerCase().includes('dog')
    ? '🐶'
    : species?.toLowerCase().includes('cat')
      ? '🐱'
      : '🐾';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={size === 'large' ? styles.large : styles.small}
        contentFit="cover"
        accessibilityLabel="Pet snap"
      />
    );
  }

  return (
    <View
      style={[
        size === 'large' ? styles.large : styles.small,
        styles.placeholder,
        { backgroundColor: theme.backgroundSelected },
      ]}>
      <ThemedText style={{ fontSize: size === 'large' ? 64 : 36 }}>{glyph}</ThemedText>
      {size === 'large' ? (
        <ThemedText type="footnote" themeColor="textSecondary">
          {imageKey.startsWith('demo://') ? 'Sample snap' : 'Your pet'}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  large: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.xl,
  },
  small: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
