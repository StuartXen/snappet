import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyzePet } from '@/analysis';
import type { AnalysisResult } from '@/analysis/types';
import { PhotoHero } from '@/components/photo-hero';
import { SignalRow } from '@/components/signal-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getHistoryItem, saveHistoryItem, type HistoryItem } from '@/storage/history';
import { takePendingSnap } from '@/storage/session';

const PAGES = ['species', 'vibe', 'signals', 'caption'] as const;
const ANALYZE_HOLD_MS = 900;

export default function ResultScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.min(windowWidth, MaxContentWidth);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [preview, setPreview] = useState({ uri: '', key: '' });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [analyzing, setAnalyzing] = useState(!id);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const started = Date.now();
      try {
        if (id) {
          const stored = await getHistoryItem(id);
          if (!stored) {
            setError('That snap is gone.');
            setAnalyzing(false);
            return;
          }
          if (!cancelled) {
            setItem(stored);
            setPreview({ uri: stored.imageUri, key: stored.imageKey });
            setAnalyzing(false);
          }
          return;
        }

        const pending = takePendingSnap();
        if (!pending) {
          setError('Nothing to read. Take a snap first.');
          setAnalyzing(false);
          return;
        }

        if (!cancelled) setPreview({ uri: pending.imageUri, key: pending.imageKey });

        const result = await analyzePet({
          imageKey: pending.imageKey,
          imageUri: pending.imageUri,
        });
        const saved = await saveHistoryItem({
          imageUri: pending.imageUri,
          imageKey: pending.imageKey,
          species: result.species,
          result,
        });
        const wait = Math.max(0, ANALYZE_HOLD_MS - (Date.now() - started));
        await new Promise((resolve) => setTimeout(resolve, wait));
        if (!cancelled) {
          setItem(saved);
          setAnalyzing(false);
        }
      } catch (cause) {
        if (!cancelled) {
          setAnalyzing(false);
          setError(cause instanceof Error ? cause.message : 'Could not read that snap.');
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const close = () => {
    router.replace(id ? '/history' : '/');
  };

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Hmm</ThemedText>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable onPress={close} accessibilityRole="button">
          <ThemedText themeColor="accent">Close</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (analyzing || !item) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.safe}>
          <ThemedText type="footnote" themeColor="textSecondary">
            Reading the face
          </ThemedText>
          <PhotoHero uri={preview.uri} imageKey={preview.key || 'demo://pending'} size="large" />
          <ThemedText type="title">A moment.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const result = item.result;
  const current = PAGES[page];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={[styles.safe, { width: pageWidth }]}>
        <View style={styles.top}>
          <Pressable onPress={close} accessibilityRole="button" hitSlop={12}>
            <ThemedText type="body" themeColor="accent">
              Close
            </ThemedText>
          </Pressable>
          <ThemedText type="footnote" themeColor="textSecondary">
            {page + 1} of {PAGES.length}
          </ThemedText>
          <View style={{ width: 48 }} />
        </View>

        <PhotoHero
          uri={item.imageUri}
          imageKey={item.imageKey}
          species={result.speciesLabel}
          size="large"
        />

        <View style={styles.body}>
          <PageBody
            page={current}
            result={result}
            onScience={() => router.push('/science')}
            vetBackground={theme.backgroundSelected}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {PAGES.map((name, index) => (
              <View
                key={name}
                style={[
                  styles.dot,
                  { backgroundColor: index === page ? theme.text : theme.line },
                ]}
              />
            ))}
          </View>
          <View style={styles.nav}>
            {page > 0 ? (
              <Pressable
                onPress={() => setPage((value) => value - 1)}
                accessibilityRole="button"
                accessibilityLabel="Back">
                <ThemedText type="body" themeColor="accent">
                  Back
                </ThemedText>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable
              onPress={() => {
                if (page < PAGES.length - 1) setPage((value) => value + 1);
                else close();
              }}
              accessibilityRole="button"
              accessibilityLabel={page < PAGES.length - 1 ? 'Next' : 'Done'}
              style={[styles.next, { backgroundColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: Palette.white, fontSize: 17 }}>
                {page < PAGES.length - 1 ? 'Next' : 'Done'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function PageBody({
  page,
  result,
  onScience,
  vetBackground,
}: {
  page: (typeof PAGES)[number];
  result: AnalysisResult;
  onScience: () => void;
  vetBackground: string;
}) {
  if (page === 'species') {
    return (
      <View style={styles.copy}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Species
        </ThemedText>
        <ThemedText type="largeTitle">
          {result.isFallbackSpecies ? 'Not sure' : `A ${result.speciesLabel.toLowerCase()}`}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {Math.round(result.speciesConfidence * 100)}% confident · estimated from the photo
        </ThemedText>
      </View>
    );
  }
  if (page === 'vibe') {
    return (
      <View style={styles.copy}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Vibe
        </ThemedText>
        <ThemedText type="largeTitle">{result.mood.label}</ThemedText>
        <ThemedText themeColor="textSecondary">{result.mood.detail}</ThemedText>
      </View>
    );
  }
  if (page === 'signals') {
    return (
      <View style={styles.copy}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Signals
        </ThemedText>
        <ThemedText type="title">Estimated</ThemedText>
        <View style={styles.signals}>
          {result.signals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          Facial-cue estimates — not a heart-rate sensor.
        </ThemedText>
      </View>
    );
  }
  return (
    <View style={styles.copy}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        A guess
      </ThemedText>
      <ThemedText type="title">“{result.caption}”</ThemedText>
      <ThemedText type="footnote" themeColor="textSecondary">
        Playful caption. Not science. Not a diagnosis.
      </ThemedText>
      {result.vetSuggestion ? (
        <View style={[styles.vet, { backgroundColor: vetBackground }]}>
          <ThemedText type="footnote">{result.vetSuggestion}</ThemedText>
        </View>
      ) : null}
      <Pressable
        onPress={onScience}
        accessibilityRole="button"
        accessibilityLabel="About the science"
        style={styles.scienceLink}>
        <ThemedText type="body" themeColor="accent">
          About the science
        </ThemedText>
      </Pressable>
    </View>
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
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  copy: {
    gap: 10,
  },
  signals: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  vet: {
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  scienceLink: {
    minHeight: 44,
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  next: {
    minWidth: 108,
    minHeight: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
});
