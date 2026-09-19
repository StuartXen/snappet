import { hashString, unitFromHash } from './demoExtractor';
import { speciesLabel } from './features';
import type { Species, SpeciesGuess } from './types';

const CAT_TOKENS = ['cat', 'kitten', 'kitty', 'feline', 'tabby', 'calico', 'tomcat'];
const DOG_TOKENS = ['dog', 'puppy', 'pup', 'canine', 'retriever', 'terrier', 'hound', 'beagle'];
const OTHER_TOKENS = ['rabbit', 'bunny', 'bird', 'hamster', 'horse', 'guinea', 'ferret', 'unknown'];

function hasToken(value: string, tokens: string[]): boolean {
  return tokens.some((token) => value.includes(token));
}

/**
 * MVP species guess from the photo key (filename, demo URI, or cloud label).
 * Never asks the user to declare the animal first.
 */
export function detectSpecies(imageKey: string): SpeciesGuess {
  const lowered = imageKey.toLowerCase();

  if (hasToken(lowered, CAT_TOKENS)) {
    return {
      species: 'cat',
      confidence: 0.86,
      evidence: 'Photo key matches common cat cues (name, album, or sample).',
      source: 'heuristic',
    };
  }
  if (hasToken(lowered, DOG_TOKENS)) {
    return {
      species: 'dog',
      confidence: 0.84,
      evidence: 'Photo key matches common dog cues (name, album, or sample).',
      source: 'heuristic',
    };
  }
  if (hasToken(lowered, OTHER_TOKENS)) {
    return {
      species: 'other',
      confidence: 0.7,
      evidence: 'Photo key suggests a pet that is not clearly a cat or dog.',
      source: 'heuristic',
    };
  }

  const unit = unitFromHash(hashString(imageKey), 17);
  if (unit < 0.48) {
    return {
      species: 'cat',
      confidence: 0.56,
      evidence: 'No clear species token — tentative cat guess from a deterministic photo hash.',
      source: 'heuristic',
    };
  }
  if (unit < 0.88) {
    return {
      species: 'dog',
      confidence: 0.54,
      evidence: 'No clear species token — tentative dog guess from a deterministic photo hash.',
      source: 'heuristic',
    };
  }
  return {
    species: 'other',
    confidence: 0.38,
    evidence: 'No clear species token — falling back to shared mammalian features.',
    source: 'heuristic',
  };
}

export function describeSpecies(guess: Pick<SpeciesGuess, 'species' | 'confidence'>): string {
  if (guess.species === 'other') {
    return 'Not clearly a cat or dog';
  }
  return speciesLabel(guess.species);
}

export { speciesLabel };
