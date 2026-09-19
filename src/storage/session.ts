export interface PendingSnap {
  imageUri: string;
  imageKey: string;
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
