import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clearHistory, loadHistory, type HistoryItem } from '@/storage/history';

function levelColor(level: HistoryItem['result']['comfort']['level']): string {
  if (level === 'high') return Palette.danger;
  if (level === 'medium') return Palette.warning;
  return Palette.good;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory().then(setItems);
    }, []),
  );

  const confirmClear = () => {
    Alert.alert('Clear local history?', 'Snaps live only on this device.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void clearHistory().then(() => setItems([]));
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText themeColor="textSecondary">
          Recent snaps stay on this device. Nothing is uploaded unless you set a cloud vision
          endpoint.
        </ThemedText>

        {items.length === 0 ? (
          <Card>
            <ThemedText type="subtitle">No snaps yet</ThemedText>
            <ThemedText themeColor="textSecondary">
              Take a photo, pick one from the library, or run a sample on the Snap tab.
            </ThemedText>
          </Card>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/result', params: { id: item.id } })}
              accessibilityRole="button">
              <Card>
                <View style={styles.row}>
                  <View style={styles.meta}>
                    <ThemedText type="smallBold">
                      {item.result.speciesLabel} · {item.result.mood.label}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatWhen(item.createdAt)}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.pill,
                      { backgroundColor: theme.backgroundSelected },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: levelColor(item.result.comfort.level) }}>
                      {item.result.comfort.level}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Confidence {item.result.confidence.percent}% · {item.result.analysisMode}
                </ThemedText>
              </Card>
            </Pressable>
          ))
        )}

        {items.length > 0 ? (
          <Pressable onPress={confirmClear} accessibilityRole="button" style={styles.clear}>
            <ThemedText type="smallBold" themeColor="accent">
              Clear history
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  clear: {
    alignItems: 'center',
    padding: Spacing.three,
  },
});
