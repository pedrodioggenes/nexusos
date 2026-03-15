import { createContext, useContext } from "react";

interface WidgetActions {
  onNavigateToChat?: (userId: string) => void;
}

export const WidgetActionsContext = createContext<WidgetActions>({});

export function useWidgetActions() {
  return useContext(WidgetActionsContext);
}
