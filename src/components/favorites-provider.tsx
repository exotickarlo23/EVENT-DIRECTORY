"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { trackEvent } from "@/lib/actions/public";

const FAVORITES_KEY = "festko:favorites";
const COMPARE_KEY = "festko:compare";
export const COMPARE_LIMIT = 4;

interface FavoritesContextValue {
  favorites: number[];
  compare: number[];
  ready: boolean;
  toggleFavorite: (id: number) => void;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readIds(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((n): n is number => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sinkronizacija s localStorage (vanjski sustav) — mora ići kroz effect
    // jer localStorage ne postoji tijekom SSR-a.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(readIds(FAVORITES_KEY));
    setCompare(readIds(COMPARE_KEY));
    setReady(true);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      if (!prev.includes(id)) void trackEvent("favorite_added", id);
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id: number) => {
    setCompare((prev) => {
      let next: number[];
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else if (prev.length >= COMPARE_LIMIT) {
        return prev;
      } else {
        next = [...prev, id];
        void trackEvent("compare_added", id);
      }
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompare([]);
    localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, compare, ready, toggleFavorite, toggleCompare, clearCompare }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites mora biti unutar FavoritesProvider");
  return ctx;
}
