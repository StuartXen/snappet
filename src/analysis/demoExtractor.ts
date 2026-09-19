import { FEATURE_IDS_BY_SPECIES } from './features';
import type { FeatureId, FeatureObservation, Species } from './types';

const HINTS: { tokens: string[]; latent: number }[] = [
  { tokens: ['relaxed', 'content', 'settled', 'soft'], latent: 0.12 },
  { tokens: ['alert', 'curious', 'watchful'], latent: 0.28 },
  { tokens: ['guarded', 'uneasy', 'medium'], latent: 0.48 },
  { tokens: ['pain', 'grimace', 'uncomfortable', 'high', 'distress'], latent: 0.82 },
];

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function unitFromHash(hash: number, salt: number): number {
  const mixed = Math.imul(hash ^ (salt * 0x9e3779b9), 0x85ebca6b) >>> 0;
  return mixed / 0xffffffff;
}

export function latentFromImageKey(imageKey: string): number {
  const lowered = imageKey.toLowerCase();
  for (const hint of HINTS) {
    if (hint.tokens.some((token) => lowered.includes(token))) {
      return hint.latent;
    }
  }
  return 0.16 + unitFromHash(hashString(imageKey), 11) * 0.62;
}

const FEATURE_BIAS: Record<FeatureId, number> = {
  earPosition: 0.02,
  orbitalTightening: 0.06,
  muzzleTension: 0.0,
  whiskerChange: -0.04,
  headPosition: -0.06,
  commissureTension: 0.03,
  eyeAperture: 0.05,
};

function evidenceFor(id: FeatureId, rawScore: number): string {
  const band = rawScore < 0.67 ? 'low' : rawScore < 1.34 ? 'moderate' : 'marked';
  const labels: Record<FeatureId, string> = {
    earPosition: 'ear carriage',
    orbitalTightening: 'orbital tightening',
    muzzleTension: 'muzzle tension',
    whiskerChange: 'whisker set',
    headPosition: 'head carriage',
    commissureTension: 'lip commissure tension',
    eyeAperture: 'eye aperture',
  };
  return `Demo observation: ${labels[id]} looks ${band} from a deterministic photo-key estimate (not a landmark model).`;
}

/**
 * Offline, deterministic stand-in for a vision model.
 * Same image key + species always yields the same feature scores.
 */
export function extractDemoObservations(
  imageKey: string,
  species: Species,
): FeatureObservation[] {
  const hash = hashString(`${species}:${imageKey}`);
  const latent = latentFromImageKey(imageKey);

  return FEATURE_IDS_BY_SPECIES[species].map((id, index) => {
    const noise = (unitFromHash(hash, index + 3) - 0.5) * 0.28;
    const normalized = Math.min(1, Math.max(0, latent + FEATURE_BIAS[id] + noise));
    const rawScore = Math.round(normalized * 2 * 10) / 10;
    return {
      id,
      rawScore,
      evidence: evidenceFor(id, rawScore),
    };
  });
}
