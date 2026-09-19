import type { Species } from '@/analysis/types';

export interface PendingSnap {
  imageUri: string;
  imageKey: string;
  species: Species;
}

let pending: PendingSnap | null = null;

export function setPendingSnap(snap: PendingSnap): void {
  pending = snap;
}

export function takePendingSnap(): PendingSnap | null {
  const value = pending;
  pending = null;
  return value;
}

export function peekPendingSnap(): PendingSnap | null {
  return pending;
}
