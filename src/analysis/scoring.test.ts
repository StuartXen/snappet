import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { analyzePetSync } from './analyze';
import { parseCloudVisionResponse } from './cloudVision';
import { extractDemoObservations, hashString, latentFromImageKey } from './demoExtractor';
import { CAT_FEATURE_IDS, DOG_FEATURE_IDS, OTHER_FEATURE_IDS } from './features';
import {
  COMFORT_HIGH_THRESHOLD,
  clampFeatureScore,
  comfortLevelFromIndex,
  grimaceTotal,
  interpretMood,
  scoreFeatures,
  weightedDiscomfortIndex,
} from './scoring';
import type { FeatureObservation } from './types';

function obs(id: FeatureObservation['id'], rawScore: number): FeatureObservation {
  return { id, rawScore, evidence: 'test' };
}

const relaxedCat: FeatureObservation[] = [
  obs('earPosition', 0),
  obs('orbitalTightening', 0.2),
  obs('muzzleTension', 0.1),
  obs('whiskerChange', 0),
  obs('headPosition', 0.2),
];

const painfulCat: FeatureObservation[] = [
  obs('earPosition', 2),
  obs('orbitalTightening', 1.8),
  obs('muzzleTension', 2),
  obs('whiskerChange', 1.6),
  obs('headPosition', 1.8),
];

describe('grimace scoring heuristics', () => {
  it('clamps feature scores onto the 0–2 grimace range', () => {
    assert.equal(clampFeatureScore(-1), 0);
    assert.equal(clampFeatureScore(3), 2);
    assert.equal(clampFeatureScore(1.2), 1.2);
  });

  it('maps the weighted index onto low / medium / high comfort bands', () => {
    assert.equal(comfortLevelFromIndex(0.1), 'low');
    assert.equal(comfortLevelFromIndex(0.34), 'medium');
    assert.equal(comfortLevelFromIndex(0.66), 'medium');
    assert.equal(comfortLevelFromIndex(0.67), 'high');
  });

  it('scores a relaxed cat face as low discomfort with a complete FGS total', () => {
    const index = weightedDiscomfortIndex(relaxedCat, 'cat');
    const total = grimaceTotal(relaxedCat, 'cat');
    assert.ok(index < 0.2);
    assert.equal(comfortLevelFromIndex(index), 'low');
    assert.notEqual(total, null);
    assert.ok((total ?? 99) < 2);
    assert.equal(scoreFeatures(relaxedCat, 'cat').length, 5);
  });

  it('scores a marked cat grimace as high and suggests a vet check', () => {
    const result = analyzePetSync({
      imageKey: 'test://painful-cat',
      species: 'cat',
      observations: painfulCat,
      analysisMode: 'demo',
    });
    assert.equal(result.comfort.level, 'high');
    assert.ok(result.comfort.index >= COMFORT_HIGH_THRESHOLD);
    assert.ok(result.comfort.grimaceTotal != null && result.comfort.grimaceTotal >= 8);
    assert.ok(result.vetSuggestion);
    assert.match(result.comfort.summary, /higher-discomfort/i);
    assert.match(result.disclaimer, /not a veterinary diagnosis/i);
  });

  it('uses equal FGS weights so each cat unit contributes 20%', () => {
    const onlyEars: FeatureObservation[] = [
      obs('earPosition', 2),
      obs('orbitalTightening', 0),
      obs('muzzleTension', 0),
      obs('whiskerChange', 0),
      obs('headPosition', 0),
    ];
    const index = weightedDiscomfortIndex(onlyEars, 'cat');
    assert.ok(Math.abs(index - 0.2) < 1e-9);
  });

  it('weights dog orbital tightening more heavily than ear position', () => {
    const orbital: FeatureObservation[] = [
      obs('orbitalTightening', 2),
      obs('earPosition', 0),
      obs('muzzleTension', 0),
      obs('commissureTension', 0),
      obs('eyeAperture', 0),
    ];
    const ears: FeatureObservation[] = [
      obs('orbitalTightening', 0),
      obs('earPosition', 2),
      obs('muzzleTension', 0),
      obs('commissureTension', 0),
      obs('eyeAperture', 0),
    ];
    assert.ok(weightedDiscomfortIndex(orbital, 'dog') > weightedDiscomfortIndex(ears, 'dog'));
  });

  it('keeps other-species scoring on the shared mammalian subset', () => {
    const observations: FeatureObservation[] = [
      obs('earPosition', 1),
      obs('orbitalTightening', 1),
      obs('muzzleTension', 1),
      obs('headPosition', 1),
    ];
    const result = analyzePetSync({
      imageKey: 'test://rabbit',
      species: 'other',
      observations,
    });
    assert.equal(result.isFallbackSpecies, true);
    assert.equal(result.features.length, OTHER_FEATURE_IDS.length);
    assert.equal(result.comfort.level, 'medium');
    assert.ok(result.confidence.overall < 0.5);
    assert.ok(result.features.every((feature) => OTHER_FEATURE_IDS.includes(feature.id)));
  });

  it('labels mood as a playful layer and keeps it separate from comfort', () => {
    const settled = interpretMood(0.1, 'cat');
    const withdrawn = interpretMood(0.8, 'dog');
    assert.equal(settled.playful, true);
    assert.equal(settled.label, 'Looks settled');
    assert.equal(withdrawn.label, 'Looks withdrawn');
    assert.match(withdrawn.detail, /not a diagnosis/i);
  });

  it('lowers confidence for demo mode and unknown species versus scored cats', () => {
    const cat = analyzePetSync({
      imageKey: 'test://a',
      species: 'cat',
      observations: relaxedCat,
      analysisMode: 'cloud',
    });
    const demoCat = analyzePetSync({
      imageKey: 'test://a',
      species: 'cat',
      observations: relaxedCat,
      analysisMode: 'demo',
    });
    const other = analyzePetSync({
      imageKey: 'test://a',
      species: 'other',
      observations: [
        obs('earPosition', 0.2),
        obs('orbitalTightening', 0.2),
        obs('muzzleTension', 0.2),
        obs('headPosition', 0.2),
      ],
      analysisMode: 'demo',
    });
    assert.ok(cat.confidence.overall > demoCat.confidence.overall);
    assert.ok(demoCat.confidence.overall > other.confidence.overall);
  });

  it('attaches species-appropriate citations', () => {
    const cat = analyzePetSync({ imageKey: 'demo://cat-relaxed', species: 'cat' });
    const dog = analyzePetSync({ imageKey: 'demo://dog-alert', species: 'dog' });
    assert.ok(cat.citations.some((item) => item.id === 'evangelista-2019'));
    assert.ok(dog.citations.some((item) => item.id === 'holden-2014'));
    assert.ok(!dog.citations.some((item) => item.id === 'evangelista-2019'));
  });
});

describe('offline demo extractor', () => {
  it('is deterministic for the same image key and species', () => {
    const first = extractDemoObservations('file://photos/milo.jpg', 'cat');
    const second = extractDemoObservations('file://photos/milo.jpg', 'cat');
    assert.deepEqual(first, second);
    assert.equal(first.length, CAT_FEATURE_IDS.length);
  });

  it('changes when the photo key changes', () => {
    const a = extractDemoObservations('file://photos/milo.jpg', 'cat');
    const b = extractDemoObservations('file://photos/luna.jpg', 'cat');
    assert.notDeepEqual(a, b);
  });

  it('honors relaxed and pain tokens so samples stay predictable', () => {
    const relaxed = analyzePetSync({ imageKey: 'demo://cat-relaxed', species: 'cat' });
    const painful = analyzePetSync({ imageKey: 'demo://cat-uncomfortable', species: 'cat' });
    const dogPain = analyzePetSync({ imageKey: 'demo://dog-pain', species: 'dog' });
    assert.equal(relaxed.comfort.level, 'low');
    assert.equal(painful.comfort.level, 'high');
    assert.equal(dogPain.comfort.level, 'high');
    assert.equal(dogPain.features.length, DOG_FEATURE_IDS.length);
    assert.ok(latentFromImageKey('demo://cat-relaxed') < latentFromImageKey('demo://dog-pain'));
  });

  it('uses a stable string hash', () => {
    assert.equal(hashString('snappet'), hashString('snappet'));
    assert.notEqual(hashString('snappet'), hashString('snappeT'));
  });
});

describe('optional cloud vision parser', () => {
  it('accepts a well-formed feature payload and rejects empty ones', () => {
    const parsed = parseCloudVisionResponse({
      features: [{ id: 'earPosition', rawScore: 1, evidence: 'ears slightly rotated' }],
    });
    assert.equal(parsed?.length, 1);
    assert.equal(parseCloudVisionResponse({ features: [] }), null);
    assert.equal(parseCloudVisionResponse({}), null);
    assert.equal(parseCloudVisionResponse(null), null);
  });
});
