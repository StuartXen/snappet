import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SAMPLE_SNAPS, isCloudVisionConfigured } from '@/analysis';
import type { Species } from '@/analysis/types';
import { Card } from '@/components/card';
import { DisclaimerBanner } from '@/components/disclaimer-banner';
import { PrimaryButton } from '@/components/primary-button';
import { SpeciesPicker } from '@/components/species-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setPendingSnap } from '@/storage/session';

export default function SnapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [species, setSpecies] = useState<Species>('cat');
  const [busy, setBusy] = useState(false);

  const openResult = useCallback(
    (imageUri: string, imageKey: string, nextSpecies: Species = species) => {
      setPendingSnap({ imageUri, imageKey, species: nextSpecies });
      router.push('/result');
    },
    [router, species],
  );

  const pickFromLibrary = useCallback(async () => {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Snappet reads a still photo. Allow library access, or try a sample snap instead.',
        );
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
      openResult(uri, uri);
    } finally {
      setBusy(false);
    }
  }, [openResult]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['left', 'right']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <ThemedText type="eyebrow" themeColor="accent">
              Snap a pet, read the signals
            </ThemedText>
            <ThemedText type="hero">Snappet</ThemedText>
            <ThemedText themeColor="textSecondary">
              Point the camera at a cat or dog. We map facial cues to published grimace-scale
              science — not mystical mind-reading.
            </ThemedText>
          </View>

          <Card>
            <ThemedText type="smallBold">Who are we looking at?</ThemedText>
            <SpeciesPicker value={species} onChange={setSpecies} />
            {species === 'other' ? (
              <ThemedText type="small" themeColor="textSecondary">
                Other animals get a shared-mammal fallback with lower confidence. Cat and dog
                scales are the ones we trust most.
              </ThemedText>
            ) : null}
          </Card>

          <View style={styles.actions}>
            <PrimaryButton
              label="Take a photo"
              onPress={() => router.push({ pathname: '/camera', params: { species } })}
            />
            <PrimaryButton
              label="Choose from library"
              variant="outline"
              loading={busy}
              onPress={pickFromLibrary}
            />
          </View>

          <Card>
            <ThemedText type="smallBold">Try a sample (offline demo)</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Always works without a camera or network. Same sample, same scores.
            </ThemedText>
            <View style={styles.samples}>
              {SAMPLE_SNAPS.map((sample) => (
                <Pressable
                  key={sample.imageKey}
                  onPress={() => openResult('', sample.imageKey, sample.species)}
                  style={[styles.sample, { borderColor: theme.line, backgroundColor: theme.background }]}>
                  <ThemedText type="smallBold">{sample.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {sample.blurb}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Card>

          <ThemedText type="small" themeColor="textSecondary">
            Analysis mode:{' '}
            {isCloudVisionConfigured()
              ? 'optional cloud vision is configured; demo mode is the fallback.'
              : 'offline deterministic demo (no cloud key set).'}
            {Platform.OS === 'web' ? ' Camera works best on a phone with Expo Go.' : ''}
          </ThemedText>

          <DisclaimerBanner compact />
        </ScrollView>
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
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  hero: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  actions: {
    gap: Spacing.two,
  },
  samples: {
    gap: Spacing.two,
  },
  sample: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 2,
  },
});
