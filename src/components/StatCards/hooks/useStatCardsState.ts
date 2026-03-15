import { useState, useEffect, useCallback } from "react";
import { BaseCard, StatCardData } from "../types";
import { convertCardToStat } from "../utils";

export function useStatCardsState(
  data: StatCardData[],
  onReorder?: (newOrder: StatCardData[]) => void
) {
  const [stats, setStats] = useState<StatCardData[]>(data);

  useEffect(() => { setStats(data); }, [data]);

  const handleReorder = useCallback(
    (newOrder: BaseCard[]) => {
      const updatedStats = newOrder.map(convertCardToStat);
      setStats(updatedStats);
      if (onReorder) onReorder(updatedStats);
    },
    [onReorder]
  );

  return { stats, handleReorder };
}
