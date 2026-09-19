import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SAMPLE_SNAPS } from '@/analysis';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setPendingSnap } from '@/storage/session';

export default function SnapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  const openPending = useCallback(
    (imageUri: string, imageKey: string) => {
      setPendingSnap({ imageUri, imageKey });
      router.push('/result');
    },
    [router],
  );

  const pickFromLibrary = useCallback(async () => {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photos', 'Allow library access, or try a sample below.');
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (picked.canceled || !picked.assets[0]) return;
      const uri = picked.assets[0].uri;
      openPending(uri, uri);
    } finally {
      setBusy(false);
    }
  }, [openPending]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ThemedText type="largeTitle">Snappet</ThemedText>
        <ThemedText type="footnote" themeColor="textSecondary" style={styles.tag}>
          Snap a pet, read the signals
        </ThemedText>

        <View style={[styles.well, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.paw}>🐾</ThemedText>
          <ThemedText type="footnote" themeColor="textSecondary">
            We’ll guess cat, dog, or other from the photo.
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Take a photo"
          onPress={() => router.push('/camera')}
          style={({ pressed }) => [
            styles.shutter,
            { borderColor: theme.accent, opacity: pressed ? 0.75 : 1 },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose from library"
          onPress={pickFromLibrary}
          disabled={busy}
          style={styles.library}>
          <ThemedText type="body" themeColor="accent">
            Photo Library
          </ThemedText>
        </Pressable>

        <View style={styles.samples}>
          {SAMPLE_SNAPS.map((sample) => (
            <Pressable
              key={sample.imageKey}
              accessibilityRole="button"
              accessibilityLabel={sample.imageKey.includes('relaxed')
                ? 'Relaxed cat'
                : sample.imageKey.includes('uncomfortable')
                  ? 'Uncomfortable cat'
                  : sample.imageKey.includes('alert')
                    ? 'Alert dog'
                    : 'Discomfort-cue dog'}
              onPress={() => openPending('', sample.imageKey)}
              style={styles.sample}>
              <View style={[styles.thumb, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={{ fontSize: 28 }}>{sample.glyph}</ThemedText>
              </View>
              <ThemedText type="caption" themeColor="textSecondary">
                {sample.title}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    alignItems: 'center',
  },
  tag: {
    marginTop: 4,
    marginBottom: Spacing.four,
  },
  well: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  paw: {
    fontSize: 72,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  library: {
    minHeight: 44,
    justifyContent: 'center',
  },
  samples: {
    marginTop: 'auto',
    marginBottom: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
  },
  sample: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
