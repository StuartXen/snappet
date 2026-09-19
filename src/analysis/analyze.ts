import { extractCloudObservations, isCloudVisionConfigured } from './cloudVision';
import { extractDemoObservations } from './demoExtractor';
import { buildAnalysisResult } from './scoring';
import { detectSpecies } from './species';
import type { AnalysisMode, AnalysisResult, AnalyzeInput, SpeciesGuess } from './types';

function guessFromInput(input: AnalyzeInput): SpeciesGuess {
  if (input.species) {
    return {
      species: input.species,
      confidence: input.speciesConfidence ?? 0.95,
      evidence: 'Species supplied by the caller (tests or an override).',
      source: 'override',
    };
  }
  return detectSpecies(input.imageKey);
}

export function analyzePetSync(input: AnalyzeInput): AnalysisResult {
  const analysisMode: AnalysisMode = input.analysisMode ?? 'demo';
  const guess = guessFromInput(input);
  const observations = input.observations ?? extractDemoObservations(input.imageKey, guess.species);

  return buildAnalysisResult({
    imageKey: input.imageKey,
    guess,
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
      imageUri: input.imageUri,
    });
    if (cloud) {
      return analyzePetSync({
        ...input,
        species: cloud.species ?? input.species,
        speciesConfidence: cloud.speciesConfidence ?? input.speciesConfidence,
        observations: cloud.features,
        analysisMode: 'cloud',
      });
    }
  }

  return analyzePetSync({ ...input, analysisMode: 'demo' });
}

export const SAMPLE_SNAPS = [
  { imageKey: 'demo://cat-relaxed', title: 'Sunbeam', glyph: '🐱' },
  { imageKey: 'demo://cat-uncomfortable', title: 'Tucked in', glyph: '🐱' },
  { imageKey: 'demo://dog-alert', title: 'Ready', glyph: '🐶' },
  { imageKey: 'demo://dog-pain', title: 'Low key', glyph: '🐶' },
];
