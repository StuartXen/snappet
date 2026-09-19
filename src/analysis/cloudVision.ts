import type { CloudVisionResponse, FeatureObservation, Species } from './types';

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

export function parseCloudVisionResponse(payload: unknown): FeatureObservation[] | null {
  if (typeof payload !== 'object' || payload == null) return null;
  const record = payload as CloudVisionResponse;
  if (!Array.isArray(record.features) || record.features.length === 0) return null;
  const features = record.features.filter(isFeatureObservation);
  return features.length > 0 ? features : null;
}

/**
 * Optional structured-vision hook. Never throws to the UI — callers fall back to demo mode.
 * Expected POST JSON: { imageKey, species }
 * Expected response JSON: { features: [{ id, rawScore, evidence }] }
 */
export async function extractCloudObservations(input: {
  imageKey: string;
  species: Species;
  imageUri?: string;
}): Promise<FeatureObservation[] | null> {
  const endpoint = visionEndpoint();
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageKey: input.imageKey,
        species: input.species,
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
