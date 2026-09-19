import { ScrollView, StyleSheet, View } from 'react-native';

import { CITATIONS, DISCLAIMER } from '@/analysis/citations';
import { FEATURES } from '@/analysis/features';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function ScienceScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText themeColor="textSecondary">
          Snappet is a comfort-signal reader grounded in published pet facial-expression science.
          It does not claim to know what a pet is thinking.
        </ThemedText>

        <Card>
          <ThemedText type="subtitle">What we score</ThemedText>
          <ThemedText>
            Each snap is turned into structured feature scores (0–2), then a weighted discomfort
            index. Labels are written as “signals consistent with…”, never as a diagnosis.
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">Cats — Feline Grimace Scale</ThemedText>
          <ThemedText>
            Evangelista and colleagues (2019) validated five action units for cats, each scored
            0 (absent), 1 (moderate), or 2 (marked):
          </ThemedText>
          {FEATURES.filter((feature) => feature.species.includes('cat')).map((feature) => (
            <View key={feature.id} style={styles.block}>
              <ThemedText type="smallBold">{feature.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {feature.description}
              </ThemedText>
            </View>
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            Combined totals run 0–10. Papers often discuss values around 4/10 as clinically
            interesting. Snappet reports that total and our low/medium/high bands, and tells you
            this is not a substitute for a vet exam.
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">Dogs — facial discomfort cues</ThemedText>
          <ThemedText>
            Dog facial scales are less standardized than the feline grimace scale. Snappet uses
            cues reported in Holden et al. and the facial “pain face” item of the Glasgow
            Composite Measure Pain Scale: orbital tightening, ear carriage, muzzle tension, lip
            commissure tension, and narrowed eye aperture.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Confidence is intentionally lower for dogs because those instruments also rely on
            behavior, movement, and clinical context that a still photo cannot provide.
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">Other / unknown</ThemedText>
          <ThemedText>
            For rabbits, small mammals, or unclear photos we fall back to overlapping mammalian
            grimace features (ears, orbital tightening, muzzle, head position) with a clear
            fallback flag and reduced confidence.
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">Two layers, kept apart</ThemedText>
          <ThemedText>
            The science panel is the grimace-scale feature breakdown, comfort band, confidence,
            and citations. The playful mood line (“looks settled”) is optional color — labeled as
            such — so it cannot be mistaken for a clinical score.
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">How demo mode works</ThemedText>
          <ThemedText>
            Offline demo mode is always available. It derives deterministic feature estimates
            from the photo key (and optional sample tokens such as “relaxed” or “pain”). That
            keeps the feature→score pipeline honest and testable without a vision backend.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            If EXPO_PUBLIC_VISION_ENDPOINT is set, Snappet will POST the snap and expect
            structured feature scores. No secrets belong in the repo. If the call fails, demo
            mode takes over.
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">Sources</ThemedText>
          {CITATIONS.map((citation) => (
            <View key={citation.id} style={styles.block}>
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
          ))}
        </Card>

        <Card>
          <ThemedText type="subtitle">Disclaimer</ThemedText>
          <ThemedText>{DISCLAIMER}</ThemedText>
        </Card>
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
    gap: Spacing.four,
    paddingBottom: Spacing.six,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  block: {
    gap: 4,
  },
});
