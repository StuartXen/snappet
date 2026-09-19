import type { FeatureDefinition, FeatureId, Species } from './types';

export const FEATURES: FeatureDefinition[] = [
  {
    id: 'earPosition',
    label: 'Ear position',
    description:
      'Forward, relaxed ears score low. Flattened, rotated, or tightly pinned ears score higher on grimace scales.',
    scaleSource: 'Feline Grimace Scale; dog facial-discomfort cues',
    species: ['cat', 'dog', 'other'],
  },
  {
    id: 'orbitalTightening',
    label: 'Orbital tightening',
    description:
      'Open, soft eyes score low. Squinting or a squeezed orbital area is a core pain-face cue in cats and dogs.',
    scaleSource: 'Feline Grimace Scale; Holden et al. dog facial cues',
    species: ['cat', 'dog', 'other'],
  },
  {
    id: 'muzzleTension',
    label: 'Muzzle tension',
    description:
      'A loose, rounded muzzle scores low. A tight, flattened, or elliptical muzzle scores higher.',
    scaleSource: 'Feline Grimace Scale; dog muzzle/commissure tension',
    species: ['cat', 'dog', 'other'],
  },
  {
    id: 'whiskerChange',
    label: 'Whisker change',
    description:
      'Loose, naturally curved whiskers score low. Straight, forward, or stiff whiskers are an FGS action unit.',
    scaleSource: 'Feline Grimace Scale',
    species: ['cat'],
  },
  {
    id: 'headPosition',
    label: 'Head position',
    description:
      'A head held level or above the shoulder line scores low. A lowered or tilted-down head is the fifth FGS unit.',
    scaleSource: 'Feline Grimace Scale',
    species: ['cat', 'other'],
  },
  {
    id: 'commissureTension',
    label: 'Commissure / lip tension',
    description:
      'A soft mouth corner scores low. Drawn-back or tight lip commissures are reported in dog discomfort faces.',
    scaleSource: 'Dog facial-expression literature; Glasgow “pain face” item',
    species: ['dog'],
  },
  {
    id: 'eyeAperture',
    label: 'Eye aperture',
    description:
      'A naturally open aperture scores low. A narrowed opening overlaps orbital tightening and is listed separately for dogs.',
    scaleSource: 'Dog facial-discomfort cues',
    species: ['dog'],
  },
];

export const CAT_FEATURE_IDS: FeatureId[] = [
  'earPosition',
  'orbitalTightening',
  'muzzleTension',
  'whiskerChange',
  'headPosition',
];

export const DOG_FEATURE_IDS: FeatureId[] = [
  'earPosition',
  'orbitalTightening',
  'muzzleTension',
  'commissureTension',
  'eyeAperture',
];

export const OTHER_FEATURE_IDS: FeatureId[] = [
  'earPosition',
  'orbitalTightening',
  'muzzleTension',
  'headPosition',
];

export const FEATURE_IDS_BY_SPECIES: Record<Species, FeatureId[]> = {
  cat: CAT_FEATURE_IDS,
  dog: DOG_FEATURE_IDS,
  other: OTHER_FEATURE_IDS,
};

export const FEATURE_WEIGHTS: Record<Species, Partial<Record<FeatureId, number>>> = {
  cat: {
    earPosition: 0.2,
    orbitalTightening: 0.2,
    muzzleTension: 0.2,
    whiskerChange: 0.2,
    headPosition: 0.2,
  },
  dog: {
    earPosition: 0.22,
    orbitalTightening: 0.28,
    muzzleTension: 0.2,
    commissureTension: 0.18,
    eyeAperture: 0.12,
  },
  other: {
    earPosition: 0.25,
    orbitalTightening: 0.35,
    muzzleTension: 0.25,
    headPosition: 0.15,
  },
};

export function featureDefinition(id: FeatureId): FeatureDefinition {
  const match = FEATURES.find((feature) => feature.id === id);
  if (!match) {
    throw new Error(`Unknown feature: ${id}`);
  }
  return match;
}

export function speciesLabel(species: Species): string {
  if (species === 'cat') return 'Cat';
  if (species === 'dog') return 'Dog';
  return 'Other / unknown';
}
