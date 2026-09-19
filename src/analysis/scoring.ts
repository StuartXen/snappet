import { DISCLAIMER, HIGH_PAIN_VET_SUGGESTION, citationsForSpecies } from './citations';
import {
  FEATURE_IDS_BY_SPECIES,
  FEATURE_WEIGHTS,
  featureDefinition,
  speciesLabel,
} from './features';
import type {
  AnalysisMode,
  AnalysisResult,
  ComfortLevel,
  ComfortReading,
  ConfidenceReading,
  FeatureObservation,
  FeatureScore,
  MoodSummary,
  Species,
} from './types';

export const COMFORT_MEDIUM_THRESHOLD = 0.34;
export const COMFORT_HIGH_THRESHOLD = 0.67;

/** Published FGS discussion often treats ~4/10 as a clinically interesting cutoff. */
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

export function interpretMood(index: number, species: Species): MoodSummary {
  const pet = species === 'cat' ? 'cat' : species === 'dog' ? 'dog' : 'pet';

  if (index >= COMFORT_HIGH_THRESHOLD) {
    return {
      label: 'Looks withdrawn',
      detail: `A playful read only: this ${pet} may want a quiet, low-demand corner. Not a diagnosis.`,
      playful: true,
    };
  }
  if (index >= COMFORT_MEDIUM_THRESHOLD) {
    return {
      label: 'Looks guarded',
      detail: `A playful read only: this ${pet} may be a little watchful or not in a social mood.`,
      playful: true,
    };
  }
  if (index < 0.18) {
    return {
      label: 'Looks settled',
      detail: `A playful read only: the face looks soft, which people often read as content. Still not mind-reading.`,
      playful: true,
    };
  }
  return {
    label: 'Looks alert',
    detail: `A playful read only: this ${pet} looks awake and engaged more than tightened.`,
    playful: true,
  };
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

  // Extreme scores from a single still photo are inherently less certain.
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
  species: Species;
  observations: FeatureObservation[];
  analysisMode: AnalysisMode;
}): AnalysisResult {
  const features = scoreFeatures(input.observations, input.species);
  const index = weightedDiscomfortIndex(input.observations, input.species);
  const level = comfortLevelFromIndex(index);
  const total = grimaceTotal(input.observations, input.species);
  const grimaceMax = FEATURE_IDS_BY_SPECIES[input.species].length * 2;
  const comfort: ComfortReading = {
    level,
    index,
    grimaceTotal: total,
    grimaceMax,
    summary: comfortSummary(level, input.species, total),
  };

  return {
    species: input.species,
    speciesLabel: speciesLabel(input.species),
    isFallbackSpecies: input.species === 'other',
    mood: interpretMood(index, input.species),
    comfort,
    features,
    confidence: confidenceFor({
      species: input.species,
      analysisMode: input.analysisMode,
      observations: input.observations,
      index,
    }),
    citations: citationsForSpecies(input.species),
    disclaimer: DISCLAIMER,
    vetSuggestion: level === 'high' ? HIGH_PAIN_VET_SUGGESTION : null,
    analysisMode: input.analysisMode,
    imageKey: input.imageKey,
  };
}
