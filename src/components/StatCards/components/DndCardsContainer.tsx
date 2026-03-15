import React, { useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableCard from "./SortableCard";
import StatCard from "./StatCard";
import { BaseCard, CardTranslations } from "../types";
import { useLockXScroll, usePersistedOrder } from "../hooks";

interface BaseDndCardsProps {
  cards: BaseCard[];
  enableDnd?: boolean;
  onReorder?: (newOrder: BaseCard[]) => void;
  gridCols?: string;
  gap?: string;
  className?: string;
  translations?: CardTranslations;
  enableNoise?: boolean;
  enableLighting?: boolean;
}

interface DndCardsPropsWithSaveOrder extends BaseDndCardsProps {
  saveOrder: true;
  storageKey: string;
}

interface DndCardsPropsWithoutSaveOrder extends BaseDndCardsProps {
  saveOrder?: false;
  storageKey?: never;
}

export type DndCardsProps = DndCardsPropsWithSaveOrder | DndCardsPropsWithoutSaveOrder;

export default function DndCardsContainer({
  cards = [],
  enableDnd = false,
  onReorder,
  saveOrder,
  storageKey,
  gridCols = "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  gap = "gap-3 sm:gap-4",
  className = "",
  translations,
  enableNoise = false,
  enableLighting = false,
}: DndCardsProps) {
  const { orderedCards: internalCards, setOrderedCards: setInternalCards, persistOrder } =
    usePersistedOrder<BaseCard>(cards, saveOrder ? storageKey : undefined);

  const typedCards = internalCards as BaseCard[];

  const { lock: lockXScroll, unlock: unlockXScroll } = useLockXScroll();

  React.useEffect(() => {
    return () => { unlockXScroll(); };
  }, [unlockXScroll]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      unlockXScroll();
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = typedCards.findIndex((c) => c.id === active.id);
        const newIndex = typedCards.findIndex((c) => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(typedCards, oldIndex, newIndex);
          setInternalCards(newOrder);
          persistOrder(newOrder);
          onReorder?.(newOrder);
        }
      }
    },
    [typedCards, onReorder, unlockXScroll, persistOrder, setInternalCards]
  );

  const handleDragStart = useCallback(() => { lockXScroll(); }, [lockXScroll]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const cardIds = useMemo(() => typedCards.map((c) => c.id), [typedCards]);

  const isFlexLayout = gridCols?.includes("flex");
  const containerClassName = isFlexLayout
    ? `${gridCols} ${gap} ${className} overflow-hidden`
    : `grid ${gridCols} ${gap} ${className} overflow-hidden`;

  if (!enableDnd) {
    return (
      <div className={containerClassName}>
        {typedCards.map((card) => (
          <StatCard
            key={card.id}
            {...card}
            translations={translations}
            enableDragHandle={false}
            enableNoise={enableNoise}
            enableLighting={enableLighting}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { unlockXScroll(); }}
    >
      <SortableContext items={cardIds} strategy={rectSortingStrategy}>
        <div className={containerClassName}>
          {typedCards.map((card) => (
            <SortableCard
              key={card.id}
              {...card}
              translations={translations}
              enableNoise={enableNoise}
              enableLighting={enableLighting}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
