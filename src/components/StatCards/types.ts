import { ReactNode } from "react";

export type TrendDirection = "up" | "down" | "stable";

export interface StatTrend {
  direction: TrendDirection;
  value: string;
  label?: string;
}

export interface CardTrend {
  direction: TrendDirection;
  value: string;
  directionLabel?: string;
}

export interface BaseCard {
  id: string;
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: CardTrend;
  color?: string;
}

export interface CardTranslations {
  dragHandle: string;
  trends: {
    ariaLabel: string;
  };
}

export interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: StatTrend;
  color?: string;
  description?: string;
}

interface BaseStatCardsProps {
  data: StatCardData[];
  enableDnd?: boolean;
  onReorder?: (newOrder: StatCardData[]) => void;
  gridCols?: string;
  gap?: string;
  className?: string;
  enableNoise?: boolean;
  enableLighting?: boolean;
  loading?: boolean;
  translations?: {
    dragHandle?: string;
    trends?: {
      ariaLabel?: string;
    };
  };
}

interface StatCardsPropsWithSaveOrder extends BaseStatCardsProps {
  saveOrder: true;
  storageKey: string;
}

interface StatCardsPropsWithoutSaveOrder extends BaseStatCardsProps {
  saveOrder?: false;
  storageKey?: never;
}

export type StatCardsProps = StatCardsPropsWithSaveOrder | StatCardsPropsWithoutSaveOrder;
