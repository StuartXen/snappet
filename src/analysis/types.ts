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
  label: string;
  detail: string;
  /** Always true — mood is an optional interpretive layer, not a clinical score. */
  playful: true;
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
  /** Sum of 0–2 feature scores when the species scale is complete. */
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
  isFallbackSpecies: boolean;
  mood: MoodSummary;
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
  species: Species;
  observations?: FeatureObservation[];
  analysisMode?: AnalysisMode;
}

export interface CloudVisionResponse {
  features?: FeatureObservation[];
  species?: Species;
}
