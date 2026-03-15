/**
 * Standardized chart tooltip and axis styles.
 * Replaces hardcoded rgba(15, 23, 42, 0.9) across all chart components.
 */
export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
};

export const CHART_AXIS_STROKE = 'hsl(var(--muted-foreground) / 0.4)';
export const CHART_GRID_STROKE = 'hsl(var(--border) / 0.3)';
