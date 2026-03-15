import { BaseCard, StatCardData } from "../types";

export const convertStatToCard = (stat: StatCardData): BaseCard => ({
  id: stat.id,
  title: stat.title,
  value: stat.value,
  icon: stat.icon,
  trend: stat.trend
    ? {
        direction: stat.trend.direction,
        value: stat.trend.value,
        directionLabel: stat.trend.label || stat.trend.direction,
      }
    : undefined,
  color: stat.color,
});

export const convertCardToStat = (card: BaseCard): StatCardData => ({
  id: card.id,
  title: card.title,
  value: card.value,
  icon: card.icon,
  trend: card.trend
    ? {
        direction: card.trend.direction,
        value: card.trend.value,
        label: card.trend.directionLabel,
      }
    : undefined,
  color: card.color,
});
