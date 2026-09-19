import { extractCloudObservations, isCloudVisionConfigured } from './cloudVision';
import { extractDemoObservations } from './demoExtractor';
import { buildAnalysisResult } from './scoring';
import type { AnalysisMode, AnalysisResult, AnalyzeInput } from './types';

export function analyzePetSync(input: AnalyzeInput): AnalysisResult {
  const analysisMode: AnalysisMode = input.analysisMode ?? 'demo';
  const observations = input.observations ?? extractDemoObservations(input.imageKey, input.species);

  return buildAnalysisResult({
    imageKey: input.imageKey,
    species: input.species,
    observations,
    analysisMode,
  });
}

export async function analyzePet(
  input: AnalyzeInput & { imageUri?: string },
): Promise<AnalysisResult> {
  if (input.observations) {
    return analyzePetSync(input);
  }

  if (isCloudVisionConfigured()) {
    const cloud = await extractCloudObservations({
      imageKey: input.imageKey,
      species: input.species,
      imageUri: input.imageUri,
    });
    if (cloud) {
      return analyzePetSync({
        ...input,
        observations: cloud,
        analysisMode: 'cloud',
      });
    }
  }

  return analyzePetSync({ ...input, analysisMode: 'demo' });
}

export const SAMPLE_SNAPS = [
  {
    imageKey: 'demo://cat-relaxed',
    species: 'cat' as const,
    title: 'Relaxed cat',
    blurb: 'Soft face — low grimace cues',
  },
  {
    imageKey: 'demo://cat-uncomfortable',
    species: 'cat' as const,
    title: 'Uncomfortable cat',
    blurb: 'Tight face — higher FGS cues',
  },
  {
    imageKey: 'demo://dog-alert',
    species: 'dog' as const,
    title: 'Alert dog',
    blurb: 'Awake, not a pain face',
  },
  {
    imageKey: 'demo://dog-pain',
    species: 'dog' as const,
    title: 'Discomfort-cue dog',
    blurb: 'Higher dog facial-discomfort cues',
  },
];
