export type Species = 'cat' | 'dog' | 'other';

export type FeatureId =
  | 'earPosition'
  | 'orbitalTightening'
  | 'muzzleTension'
  | 'whiskerChange'
  | 'headPosition'
  | 'commissureTension'
  | 'eyeAperture';

export type ComfortLevel = 'low' | 'medium' | 'high';

export type AnalysisMode = 'demo' | 'cloud';

export type SpeciesSource = 'heuristic' | 'cloud' | 'override';

export type MoodId = 'ease' | 'play' | 'guarded' | 'quiet';

export type SignalId = 'comfort' | 'calm' | 'energy' | 'social';

export interface FeatureObservation {
  id: FeatureId;
  /** Classic grimace-scale intensity: 0 = not present, 2 = markedly present. */
  rawScore: number;
  evidence: string;
}

export interface FeatureDefinition {
  id: FeatureId;
  label: string;
  description: string;
  scaleSource: string;
  species: Species[];
}

export interface FeatureScore extends FeatureObservation {
  label: string;
  description: string;
  normalized: number;
  scaleSource: string;
}

export interface MoodSummary {
  id: MoodId;
  label: string;
  detail: string;
  /** Always true — vibe is interpretive, not a clinical score. */
  playful: true;
}

export interface BiometricSignal {
  id: SignalId;
  label: string;
  value: number;
  cue: string;
}

export interface SpeciesGuess {
  species: Species;
  confidence: number;
  evidence: string;
  source: SpeciesSource;
}

export interface Citation {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  url: string;
  notes: string;
}

export interface ComfortReading {
  level: ComfortLevel;
  /** Weighted 0–1 discomfort index mapped from grimace-scale features. */
  index: number;
  grimaceTotal: number | null;
  grimaceMax: number | null;
  summary: string;
}

export interface ConfidenceReading {
  overall: number;
  percent: number;
  reasons: string[];
}

export interface AnalysisResult {
  species: Species;
  speciesLabel: string;
  speciesConfidence: number;
  speciesEvidence: string;
  speciesSource: SpeciesSource;
  isFallbackSpecies: boolean;
  mood: MoodSummary;
  caption: string;
  signals: BiometricSignal[];
  comfort: ComfortReading;
  features: FeatureScore[];
  confidence: ConfidenceReading;
  citations: Citation[];
  disclaimer: string;
  vetSuggestion: string | null;
  analysisMode: AnalysisMode;
  imageKey: string;
}

export interface AnalyzeInput {
  imageKey: string;
  /** Optional. When omitted, species is detected from the image key / vision. */
  species?: Species;
  speciesConfidence?: number;
  observations?: FeatureObservation[];
  analysisMode?: AnalysisMode;
}

export interface CloudVisionResponse {
  features?: FeatureObservation[];
  species?: Species;
  speciesConfidence?: number;
}

export interface CloudVisionParse {
  features: FeatureObservation[];
  species?: Species;
  speciesConfidence?: number;
}
