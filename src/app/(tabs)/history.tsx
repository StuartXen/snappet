import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clearHistory, loadHistory, type HistoryItem } from '@/storage/history';

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
    Alert.alert('Clear Recents?', 'Snaps stay on this device.', [
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
        {items.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="title">No snaps yet</ThemedText>
            <ThemedText themeColor="textSecondary">
              Take a photo. We’ll read the face from there.
            </ThemedText>
          </View>
        ) : (
          items.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/result', params: { id: item.id } })}
              accessibilityRole="button"
              style={[
                styles.row,
                {
                  borderBottomColor: theme.line,
                  borderBottomWidth: index === items.length - 1 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}>
              <View style={styles.meta}>
                <ThemedText type="body">
                  {item.result.speciesLabel} · {item.result.mood.label}
                </ThemedText>
                <ThemedText type="footnote" themeColor="textSecondary">
                  {formatWhen(item.createdAt)}
                </ThemedText>
              </View>
              <ThemedText type="footnote" themeColor="textSecondary">
                {item.result.comfort.level === 'high' ? 'High cues' : '›'}
              </ThemedText>
            </Pressable>
          ))
        )}

        {items.length > 0 ? (
          <Pressable onPress={confirmClear} accessibilityRole="button" style={styles.clear}>
            <ThemedText type="body" themeColor="accent">
              Clear Recents
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
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  empty: {
    paddingTop: Spacing.six,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    gap: Spacing.three,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  clear: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
});
