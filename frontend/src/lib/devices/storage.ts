import { useSyncExternalStore } from 'react';

const PUSH_DEVICE_TOKEN_KEY = 'lmj:push-device-token';
const PUSH_DEVICE_ID_KEY = 'lmj:push-device-id';
const PUSH_DEVICE_SYNC_KEY = 'lmj:push-device-sync';

type PushDeviceSyncRecord = {
  userId: string;
  token: string;
};

type Listener = () => void;

const listeners = new Set<Listener>();

function notifyDeviceListeners() {
  listeners.forEach((listener) => listener());
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readPushDeviceToken(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(PUSH_DEVICE_TOKEN_KEY);
  const value = raw?.trim();
  return value ? value : null;
}

export function setPushDeviceToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  const normalized = token?.trim() || '';
  if (!normalized) {
    window.localStorage.removeItem(PUSH_DEVICE_TOKEN_KEY);
    notifyDeviceListeners();
    return;
  }
  window.localStorage.setItem(PUSH_DEVICE_TOKEN_KEY, normalized);
  notifyDeviceListeners();
}

export function readPushDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(PUSH_DEVICE_ID_KEY)?.trim();
  return raw || null;
}

export function ensurePushDeviceId(): string {
  const existing = readPushDeviceId();
  if (existing) return existing;
  const created = randomId();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PUSH_DEVICE_ID_KEY, created);
  }
  return created;
}

export function readPushDeviceSyncRecord(): PushDeviceSyncRecord | null {
  if (typeof window === 'undefined') return null;
  const parsed = safeParseJson<PushDeviceSyncRecord>(
    window.localStorage.getItem(PUSH_DEVICE_SYNC_KEY),
  );
  if (!parsed?.userId || !parsed?.token) return null;
  return parsed;
}

export function writePushDeviceSyncRecord(record: PushDeviceSyncRecord | null): void {
  if (typeof window === 'undefined') return;
  if (!record) {
    window.localStorage.removeItem(PUSH_DEVICE_SYNC_KEY);
    notifyDeviceListeners();
    return;
  }
  window.localStorage.setItem(PUSH_DEVICE_SYNC_KEY, JSON.stringify(record));
  notifyDeviceListeners();
}

export function clearPushDeviceSyncRecord(): void {
  writePushDeviceSyncRecord(null);
}

export function subscribePushDeviceStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePushDeviceToken(): string | null {
  return useSyncExternalStore(
    subscribePushDeviceStore,
    readPushDeviceToken,
    readPushDeviceToken,
  );
}
