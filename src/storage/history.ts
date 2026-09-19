import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AnalysisResult, Species } from '@/analysis/types';

const STORAGE_KEY = 'snappet.history.v1';
const MAX_ITEMS = 50;

export interface HistoryItem {
  id: string;
  createdAt: string;
  imageUri: string;
  imageKey: string;
  species: Species;
  result: AnalysisResult;
}

export function createHistoryId(): string {
  return `snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveHistoryItem(
  item: Omit<HistoryItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): Promise<HistoryItem> {
  const record: HistoryItem = {
    id: item.id ?? createHistoryId(),
    createdAt: item.createdAt ?? new Date().toISOString(),
    imageUri: item.imageUri,
    imageKey: item.imageKey,
    species: item.species,
    result: item.result,
  };
  const existing = await loadHistory();
  const next = [record, ...existing.filter((entry) => entry.id !== record.id)].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}

export async function getHistoryItem(id: string): Promise<HistoryItem | null> {
  const items = await loadHistory();
  return items.find((item) => item.id === id) ?? null;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
