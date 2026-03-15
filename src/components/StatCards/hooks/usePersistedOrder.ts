import { useCallback, useEffect, useState } from "react";

export default function usePersistedOrder<T extends { id: string }>(
  cards: T[],
  storageKey?: string
) {
  const applyStoredOrder = useCallback(
    (cardsToOrder: T[]) => {
      if (!storageKey) return cardsToOrder;
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return cardsToOrder;
        const storedIds: string[] = JSON.parse(stored);
        if (!Array.isArray(storedIds)) return cardsToOrder;
        const cardMap = new Map(cardsToOrder.map((c) => [c.id, c] as const));
        const ordered: T[] = [];
        for (const id of storedIds) {
          const card = cardMap.get(id);
          if (card) { ordered.push(card); cardMap.delete(id); }
        }
        for (const card of cardsToOrder) {
          if (cardMap.has(card.id)) { ordered.push(card); cardMap.delete(card.id); }
        }
        return ordered;
      } catch {
        return cardsToOrder;
      }
    },
    [storageKey]
  );

  const [orderedCards, setOrderedCards] = useState<T[]>(() => applyStoredOrder(cards));

  useEffect(() => {
    setOrderedCards(applyStoredOrder(cards));
  }, [cards, applyStoredOrder]);

  const persistOrder = useCallback(
    (newOrder: T[]) => {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(newOrder.map((c) => c.id)));
      } catch {}
    },
    [storageKey]
  );

  return { orderedCards, setOrderedCards, persistOrder } as const;
}
