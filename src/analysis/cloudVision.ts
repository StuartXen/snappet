import { clamp } from './scoring';
import type { CloudVisionParse, CloudVisionResponse, FeatureObservation, Species } from './types';

export function visionEndpoint(): string | undefined {
  const value = process.env.EXPO_PUBLIC_VISION_ENDPOINT?.trim();
  return value ? value : undefined;
}

export function isCloudVisionConfigured(): boolean {
  return visionEndpoint() != null;
}

function isFeatureObservation(value: unknown): value is FeatureObservation {
  if (typeof value !== 'object' || value == null) return false;
  const record = value as Partial<FeatureObservation>;
  return (
    typeof record.id === 'string' &&
    typeof record.rawScore === 'number' &&
    Number.isFinite(record.rawScore) &&
    typeof record.evidence === 'string'
  );
}

function parseSpecies(value: unknown): Species | undefined {
  if (value === 'cat' || value === 'dog' || value === 'other') return value;
  return undefined;
}

export function parseCloudVisionResponse(payload: unknown): CloudVisionParse | null {
  if (typeof payload !== 'object' || payload == null) return null;
  const record = payload as CloudVisionResponse;
  if (!Array.isArray(record.features) || record.features.length === 0) return null;
  const features = record.features.filter(isFeatureObservation);
  if (features.length === 0) return null;

  const parsed: CloudVisionParse = { features };
  const species = parseSpecies(record.species);
  if (species) parsed.species = species;
  if (typeof record.speciesConfidence === 'number' && Number.isFinite(record.speciesConfidence)) {
    parsed.speciesConfidence = clamp(record.speciesConfidence, 0, 1);
  }
  return parsed;
}

/**
 * Optional structured-vision hook. Never throws to the UI — callers fall back to demo mode.
 * POST JSON: { imageKey, imageUri? }
 * Response JSON: { features: [...], species?: "cat"|"dog"|"other", speciesConfidence?: number }
 */
export async function extractCloudObservations(input: {
  imageKey: string;
  imageUri?: string;
}): Promise<CloudVisionParse | null> {
  const endpoint = visionEndpoint();
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageKey: input.imageKey,
        imageUri: input.imageUri,
      }),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    return parseCloudVisionResponse(payload);
  } catch {
    return null;
  }
}
