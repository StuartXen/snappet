import { DISCLAIMER, HIGH_PAIN_VET_SUGGESTION, citationsForSpecies } from './citations';
import {
  FEATURE_IDS_BY_SPECIES,
  FEATURE_WEIGHTS,
  featureDefinition,
  speciesLabel,
} from './features';
import type { SpeciesGuess } from './types';
import type {
  AnalysisMode,
  AnalysisResult,
  BiometricSignal,
  ComfortLevel,
  ComfortReading,
  ConfidenceReading,
  FeatureId,
  FeatureObservation,
  FeatureScore,
  MoodId,
  MoodSummary,
  SignalId,
  Species,
} from './types';

export const COMFORT_MEDIUM_THRESHOLD = 0.34;
export const COMFORT_HIGH_THRESHOLD = 0.67;
export const FGS_CLINICAL_DISCUSSION_CUTOFF = 4;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampFeatureScore(rawScore: number): number {
  return clamp(rawScore, 0, 2);
}

export function comfortLevelFromIndex(index: number): ComfortLevel {
  if (index >= COMFORT_HIGH_THRESHOLD) return 'high';
  if (index >= COMFORT_MEDIUM_THRESHOLD) return 'medium';
  return 'low';
}

export function weightedDiscomfortIndex(
  observations: FeatureObservation[],
  species: Species,
): number {
  const weights = FEATURE_WEIGHTS[species];
  let weighted = 0;
  let totalWeight = 0;

  for (const [featureId, weight] of Object.entries(weights)) {
    if (weight == null) continue;
    const observation = observations.find((item) => item.id === featureId);
    if (!observation) continue;
    weighted += (clampFeatureScore(observation.rawScore) / 2) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return clamp(weighted / totalWeight, 0, 1);
}

export function grimaceTotal(observations: FeatureObservation[], species: Species): number | null {
  const ids = FEATURE_IDS_BY_SPECIES[species];
  const present = ids
    .map((id) => observations.find((item) => item.id === id))
    .filter((item): item is FeatureObservation => item != null);

  if (present.length !== ids.length) return null;
  return present.reduce((sum, item) => sum + clampFeatureScore(item.rawScore), 0);
}

function featureNorm(observations: FeatureObservation[], id: FeatureId): number {
  const observation = observations.find((item) => item.id === id);
  return clampFeatureScore(observation?.rawScore ?? 0) / 2;
}

export function estimateSignals(
  observations: FeatureObservation[],
  discomfortIndex: number,
): BiometricSignal[] {
  const ears = featureNorm(observations, 'earPosition');
  const orbital = featureNorm(observations, 'orbitalTightening');
  const muzzle = featureNorm(observations, 'muzzleTension');
  const tightness = clamp(orbital * 0.5 + muzzle * 0.35 + ears * 0.15, 0, 1);
  const loaf = (1 - orbital) * (1 - ears) * (1 - muzzle) * (1 - discomfortIndex);

  const comfort = clamp(1 - discomfortIndex, 0, 1);
  const calm = clamp(1 - tightness, 0, 1);
  const energy = clamp((1 - discomfortIndex) * 0.38 + (1 - loaf) * 0.42 - tightness * 0.28, 0, 1);
  const social = clamp(1 - (discomfortIndex * 0.48 + ears * 0.3 + muzzle * 0.22), 0, 1);

  const rows: { id: SignalId; label: string; value: number; cue: string }[] = [
    {
      id: 'comfort',
      label: 'Comfort',
      value: comfort,
      cue: 'Inverse of grimace-scale tightness (ears, eyes, muzzle).',
    },
    {
      id: 'calm',
      label: 'Calm',
      value: calm,
      cue: 'Softer orbital area, muzzle, and ear carriage.',
    },
    {
      id: 'energy',
      label: 'Energy',
      value: energy,
      cue: 'Awake-but-soft face versus a loaf or a pain face.',
    },
    {
      id: 'social',
      label: 'Social ease',
      value: social,
      cue: 'Forward ears and a loose muzzle, without a high discomfort index.',
    },
  ];

  return rows.map((row) => ({
    ...row,
    value: Math.round(row.value * 100) / 100,
  }));
}

export function signalValue(signals: BiometricSignal[], id: SignalId): number {
  return signals.find((item) => item.id === id)?.value ?? 0;
}

function comfortSummary(level: ComfortLevel, species: Species, grimaceTotalValue: number | null): string {
  const scaleName =
    species === 'cat'
      ? 'the Feline Grimace Scale'
      : species === 'dog'
        ? 'published dog facial-discomfort cues'
        : 'shared mammalian grimace features';

  if (level === 'low') {
    return `Signals are consistent with a lower-discomfort pattern on ${scaleName}. The face looks relatively soft.`;
  }
  if (level === 'medium') {
    return `Signals are consistent with a mixed or moderate discomfort pattern on ${scaleName}. Some features are tightened.`;
  }
  const fgsNote =
    species === 'cat' && grimaceTotalValue != null
      ? ` Combined FGS-style total is ${grimaceTotalValue.toFixed(1)} / 10 (literature often discusses ~${FGS_CLINICAL_DISCUSSION_CUTOFF}/10 as clinically interesting).`
      : '';
  return `Signals are consistent with a higher-discomfort pattern on ${scaleName}.${fgsNote}`;
}

export function interpretMood(index: number, signals: BiometricSignal[]): MoodSummary {
  const energy = signalValue(signals, 'energy');
  const calm = signalValue(signals, 'calm');

  if (index >= COMFORT_HIGH_THRESHOLD) {
    return {
      id: 'quiet',
      label: 'Wants quiet',
      detail: 'The face looks held in. A low-demand corner is the kindest read — not a diagnosis.',
      playful: true,
    };
  }
  if (index >= COMFORT_MEDIUM_THRESHOLD) {
    return {
      id: 'guarded',
      label: 'A little guarded',
      detail: 'Some tightness is showing. They may want a slower hello.',
      playful: true,
    };
  }
  if (energy > calm + 0.08) {
    return {
      id: 'play',
      label: 'Bright-eyed',
      detail: 'Soft face, a bit of spark. They look ready for something small and fun.',
      playful: true,
    };
  }
  return {
    id: 'ease',
    label: 'Soft and settled',
    detail: 'The face looks easy. Comfort cues are on the quiet, loaf-ish side.',
    playful: true,
  };
}

const CAPTIONS: Record<Species, Record<MoodId, string>> = {
  cat: {
    ease: 'Has already decided the couch is a nature preserve.',
    play: 'Plotting a heist. The treat jar should be nervous.',
    guarded: 'Considering your request. Please hold all sudden movements.',
    quiet: 'Would like the lights lower and the plot quieter.',
  },
  dog: {
    ease: 'Off-duty. Belly remains a limited-time offer.',
    play: 'Has notes. They are all about the ball.',
    guarded: 'Loyal, but currently buffering.',
    quiet: 'Would like a quiet walk and zero surprises.',
  },
  other: {
    ease: 'Doing a flawless impression of a tiny woodland prince.',
    play: 'Has ideas. Most of them involve snacks.',
    guarded: 'Politely declined the group chat.',
    quiet: 'Requesting a dim room and excellent manners.',
  },
};

export function funnyCaption(species: Species, moodId: MoodId): string {
  return CAPTIONS[species][moodId];
}

export function scoreFeatures(observations: FeatureObservation[], species: Species): FeatureScore[] {
  const ids = FEATURE_IDS_BY_SPECIES[species];
  return ids.map((id) => {
    const definition = featureDefinition(id);
    const observation = observations.find((item) => item.id === id);
    const rawScore = clampFeatureScore(observation?.rawScore ?? 0);
    return {
      id,
      rawScore,
      evidence: observation?.evidence ?? 'Feature was not observed; treated as 0.',
      label: definition.label,
      description: definition.description,
      normalized: rawScore / 2,
      scaleSource: definition.scaleSource,
    };
  });
}

export function confidenceFor(input: {
  species: Species;
  speciesConfidence: number;
  analysisMode: AnalysisMode;
  observations: FeatureObservation[];
  index: number;
}): ConfidenceReading {
  const required = FEATURE_IDS_BY_SPECIES[input.species];
  const observedCount = required.filter((id) =>
    input.observations.some((item) => item.id === id),
  ).length;
  const coverage = observedCount / required.length;

  let overall =
    input.species === 'cat' ? 0.72 : input.species === 'dog' ? 0.6 : 0.38;

  if (input.analysisMode === 'demo') {
    overall -= 0.14;
  } else {
    overall += 0.06;
  }

  overall *= 0.7 + 0.3 * coverage;
  overall *= 0.82 + 0.18 * clamp(input.speciesConfidence, 0, 1);

  if (input.index >= COMFORT_HIGH_THRESHOLD || input.index <= 0.12) {
    overall -= 0.04;
  }

  overall = clamp(overall, 0.16, 0.9);

  const reasons = [
    input.species === 'cat'
      ? 'Cat scoring uses the five published Feline Grimace Scale action units.'
      : input.species === 'dog'
        ? 'Dog scoring uses facial cues from literature; there is no single FGS-equivalent standard.'
        : 'Other/unknown species uses overlapping mammalian grimace features with a graceful fallback.',
    input.analysisMode === 'demo'
      ? 'Offline demo mode estimated features deterministically from the photo key — not a live landmark model.'
      : 'Cloud vision supplied structured feature scores. Landmark quality still depends on the photo.',
    'A still photo cannot capture movement, posture over time, appetite, or your knowledge of this animal.',
    `Observed ${observedCount} of ${required.length} expected features for this species.`,
  ];

  return {
    overall,
    percent: Math.round(overall * 100),
    reasons,
  };
}

export function buildAnalysisResult(input: {
  imageKey: string;
  guess: SpeciesGuess;
  observations: FeatureObservation[];
  analysisMode: AnalysisMode;
}): AnalysisResult {
  const species = input.guess.species;
  const features = scoreFeatures(input.observations, species);
  const index = weightedDiscomfortIndex(input.observations, species);
  const level = comfortLevelFromIndex(index);
  const total = grimaceTotal(input.observations, species);
  const grimaceMax = FEATURE_IDS_BY_SPECIES[species].length * 2;
  const signals = estimateSignals(input.observations, index);
  const mood = interpretMood(index, signals);
  const comfort: ComfortReading = {
    level,
    index,
    grimaceTotal: total,
    grimaceMax,
    summary: comfortSummary(level, species, total),
  };

  return {
    species,
    speciesLabel: speciesLabel(species),
    speciesConfidence: input.guess.confidence,
    speciesEvidence: input.guess.evidence,
    speciesSource: input.guess.source,
    isFallbackSpecies: species === 'other',
    mood,
    caption: funnyCaption(species, mood.id),
    signals,
    comfort,
    features,
    confidence: confidenceFor({
      species,
      speciesConfidence: input.guess.confidence,
      analysisMode: input.analysisMode,
      observations: input.observations,
      index,
    }),
    citations: citationsForSpecies(species),
    disclaimer: DISCLAIMER,
    vetSuggestion: level === 'high' ? HIGH_PAIN_VET_SUGGESTION : null,
    analysisMode: input.analysisMode,
    imageKey: input.imageKey,
  };
}
