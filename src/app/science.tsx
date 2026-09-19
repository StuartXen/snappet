import { ScrollView, StyleSheet, View } from 'react-native';

import { CITATIONS, DISCLAIMER } from '@/analysis/citations';
import { FEATURES } from '@/analysis/features';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function ScienceScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText themeColor="textSecondary">
          Snappet maps a still face to published grimace-scale cues. It does not read minds and
          it is not a veterinary diagnosis.
        </ThemedText>

        <ThemedText type="title2">What we score</ThemedText>
        <ThemedText>
          Each snap becomes feature scores from 0–2, then a discomfort index. Comfort, calm,
          energy, and social ease are estimated from those same facial cues. The witty line is
          just a caption.
        </ThemedText>

        <ThemedText type="title2">Cats</ThemedText>
        <ThemedText>
          The Feline Grimace Scale (Evangelista et al., 2019) uses five action units:
        </ThemedText>
        {FEATURES.filter((feature) => feature.species.includes('cat')).map((feature) => (
          <View key={feature.id} style={styles.block}>
            <ThemedText type="smallBold">{feature.label}</ThemedText>
            <ThemedText type="footnote" themeColor="textSecondary">
              {feature.description}
            </ThemedText>
          </View>
        ))}

        <ThemedText type="title2">Dogs</ThemedText>
        <ThemedText>
          Dog facial scales are less standardized. We use cues from Holden et al. and the
          Glasgow “pain face” item: orbital tightening, ear carriage, muzzle and commissure
          tension, eye aperture. Confidence stays lower.
        </ThemedText>

        <ThemedText type="title2">Other pets</ThemedText>
        <ThemedText>
          Shared mammalian grimace features, with a clear “not sure” species guess and lower
          confidence.
        </ThemedText>

        <ThemedText type="title2">Sources</ThemedText>
        {CITATIONS.map((citation) => (
          <View key={citation.id} style={styles.block}>
            <ThemedText type="smallBold">{citation.title}</ThemedText>
            <ThemedText type="footnote" themeColor="textSecondary">
              {citation.authors} ({citation.year}). {citation.source}
            </ThemedText>
            <ThemedText type="caption" themeColor="accent">
              {citation.url}
            </ThemedText>
          </View>
        ))}

        <ThemedText type="title2">Disclaimer</ThemedText>
        <ThemedText>{DISCLAIMER}</ThemedText>
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
  block: {
    gap: 4,
  },
});
