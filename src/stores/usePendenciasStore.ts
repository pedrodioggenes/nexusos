import { useState, useCallback, useEffect } from "react";
import type { Pendencia } from "@/data/dominio/types";
import { PENDENCIAS } from "@/data/dominio/mock-data";

const STORAGE_KEY = "dominio_pendencias";

function loadFromStorage(): Pendencia[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return PENDENCIAS;
}

function saveToStorage(data: Pendencia[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// Singleton state so all consumers share the same list
let globalPendencias: Pendencia[] = loadFromStorage();
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function usePendenciasStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const pendencias = globalPendencias;

  const addPendencia = useCallback((p: Omit<Pendencia, "id" | "created_at">) => {
    const newP: Pendencia = {
      ...p,
      id: `p${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    globalPendencias = [newP, ...globalPendencias];
    saveToStorage(globalPendencias);
    notify();
    return newP;
  }, []);

  const updatePendencia = useCallback((id: string, updates: Partial<Pendencia>) => {
    globalPendencias = globalPendencias.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    saveToStorage(globalPendencias);
    notify();
  }, []);

  const updateStatus = useCallback((id: string, status: Pendencia["status"]) => {
    globalPendencias = globalPendencias.map((p) =>
      p.id === id
        ? { ...p, status, resolved_at: status === "resolved" ? new Date().toISOString() : p.resolved_at }
        : p
    );
    saveToStorage(globalPendencias);
    notify();
  }, []);

  const deletePendencia = useCallback((id: string) => {
    globalPendencias = globalPendencias.filter((p) => p.id !== id);
    saveToStorage(globalPendencias);
    notify();
  }, []);

  return { pendencias, addPendencia, updatePendencia, updateStatus, deletePendencia };
}
