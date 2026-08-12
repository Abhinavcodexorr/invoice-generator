import type { InvoiceDocument } from "./types";

const DRAFT_KEY = "invoice-generator:draft";
const HISTORY_KEY = "invoice-generator:local-history";

export function loadDraft(): InvoiceDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as InvoiceDocument) : null;
  } catch {
    return null;
  }
}

export function saveDraft(doc: InvoiceDocument) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(doc));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function loadLocalHistory(): InvoiceDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as InvoiceDocument[]) : [];
  } catch {
    return [];
  }
}

export function upsertLocalHistory(doc: InvoiceDocument): InvoiceDocument {
  const list = loadLocalHistory();
  const id = doc.id ?? crypto.randomUUID();
  const next: InvoiceDocument = {
    ...doc,
    id,
    updated_at: new Date().toISOString(),
    created_at: doc.created_at ?? new Date().toISOString(),
  };
  const idx = list.findIndex((d) => d.id === id);
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return next;
}

export function deleteLocalHistory(id: string) {
  const list = loadLocalHistory().filter((d) => d.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function getLocalHistoryItem(id: string): InvoiceDocument | null {
  return loadLocalHistory().find((d) => d.id === id) ?? null;
}
