import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { analyzePet } from '@/analysis';
import { Card } from '@/components/card';
import { ComfortMeter } from '@/components/comfort-meter';
import { DisclaimerBanner } from '@/components/disclaimer-banner';
import { FeatureBar } from '@/components/feature-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getHistoryItem, saveHistoryItem, type HistoryItem } from '@/storage/history';
import { takePendingSnap } from '@/storage/session';

export default function ResultScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCitations, setShowCitations] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (id) {
          const stored = await getHistoryItem(id);
          if (!stored) {
            setError('That snap is no longer in local history.');
            return;
          }
          if (!cancelled) setItem(stored);
          return;
        }

        const pending = takePendingSnap();
        if (!pending) {
          setError('Nothing to analyze. Take or pick a photo first.');
          return;
        }

        const result = await analyzePet({
          imageKey: pending.imageKey,
          species: pending.species,
          imageUri: pending.imageUri,
        });
        const saved = await saveHistoryItem({
          imageUri: pending.imageUri,
          imageKey: pending.imageKey,
          species: pending.species,
          result,
        });
        if (!cancelled) setItem(saved);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Analysis failed.');
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Couldn’t read this snap</ThemedText>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!item) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
        <ThemedText themeColor="textSecondary">Reading facial signals…</ThemedText>
      </ThemedView>
    );
  }

  const result = item.result;
  const isDemoImage = item.imageKey.startsWith('demo://');

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoBlock uri={item.imageUri} demoKey={item.imageKey} speciesLabel={result.speciesLabel} />

        {result.isFallbackSpecies ? (
          <Card style={{ backgroundColor: theme.backgroundSelected }}>
            <ThemedText type="smallBold">Graceful fallback</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              This snap is scored with shared mammalian grimace features. Treat it as a rough
              signal, not a cat- or dog-scale reading.
            </ThemedText>
          </Card>
        ) : null}

        <Card>
          <ThemedText type="eyebrow" themeColor="accent">
            Optional playful layer
          </ThemedText>
          <ThemedText type="subtitle">{result.mood.label}</ThemedText>
          <ThemedText themeColor="textSecondary">{result.mood.detail}</ThemedText>
        </Card>

        <Card>
          <ThemedText type="eyebrow">Science panel · comfort / pain cues</ThemedText>
          <ThemedText type="subtitle">
            Signals consistent with a {result.comfort.level} pattern
          </ThemedText>
          <ComfortMeter level={result.comfort.level} index={result.comfort.index} />
          <ThemedText>{result.comfort.summary}</ThemedText>
          {result.comfort.grimaceTotal != null ? (
            <ThemedText type="small" themeColor="textSecondary">
              Combined feature total {result.comfort.grimaceTotal.toFixed(1)} /{' '}
              {result.comfort.grimaceMax} (each unit 0–2, grimace-scale style).
            </ThemedText>
          ) : null}
        </Card>

        {result.vetSuggestion ? (
          <Card style={{ borderColor: Palette.danger, backgroundColor: Palette.dangerSoft }}>
            <ThemedText type="smallBold" style={{ color: Palette.danger }}>
              Consider a professional check
            </ThemedText>
            <ThemedText type="small" style={{ color: Palette.ink }}>
              {result.vetSuggestion}
            </ThemedText>
          </Card>
        ) : null}

        <Card>
          <ThemedText type="smallBold">Feature breakdown</ThemedText>
          {result.features.map((feature) => (
            <FeatureBar key={feature.id} feature={feature} />
          ))}
        </Card>

        <Card>
          <ThemedText type="smallBold">Confidence · {result.confidence.percent}%</ThemedText>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${result.confidence.percent}%`,
                  backgroundColor: theme.sage,
                },
              ]}
            />
          </View>
          {result.confidence.reasons.map((reason) => (
            <ThemedText key={reason} type="small" themeColor="textSecondary">
              • {reason}
            </ThemedText>
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            Mode: {result.analysisMode === 'cloud' ? 'cloud vision' : 'offline demo'}
            {isDemoImage ? ' · bundled sample key' : ''}
          </ThemedText>
        </Card>

        <Card>
          <Pressable onPress={() => setShowCitations((value) => !value)} accessibilityRole="button">
            <ThemedText type="smallBold">
              Science citations {showCitations ? '▴' : '▾'}
            </ThemedText>
          </Pressable>
          {showCitations
            ? result.citations.map((citation) => (
                <View key={citation.id} style={styles.citation}>
                  <ThemedText type="smallBold">{citation.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {citation.authors} ({citation.year}). {citation.source}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {citation.notes}
                  </ThemedText>
                  <ThemedText type="small" themeColor="accent">
                    {citation.url}
                  </ThemedText>
                </View>
              ))
            : (
              <ThemedText type="small" themeColor="textSecondary">
                Outputs are labeled as signals consistent with published scales — tap to read the
                sources.
              </ThemedText>
            )}
        </Card>

        <DisclaimerBanner />
      </ScrollView>
    </ThemedView>
  );
}

function PhotoBlock({
  uri,
  demoKey,
  speciesLabel,
}: {
  uri: string;
  demoKey: string;
  speciesLabel: string;
}) {
  const theme = useTheme();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={styles.photo}
        contentFit="cover"
        accessibilityLabel={`${speciesLabel} snap`}
      />
    );
  }

  return (
    <View style={[styles.photo, styles.demoPhoto, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="subtitle">{speciesLabel} sample</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {demoKey}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
  },
  demoPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
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
  citation: {
    gap: 4,
  },
});
