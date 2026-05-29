export const CHART_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#e11d48', '#0ea5e9',
  '#a855f7', '#84cc16', '#f97316', '#06b6d4', '#ec4899',
  '#22c55e', '#eab308', '#3b82f6', '#d946ef', '#14b8a6',
  '#ef4444', '#8b5cf6', '#64748b', '#2dd4bf', '#f43f5e',
];

const COLOR_ORDER = [0, 5, 10, 15, 1, 6, 11, 16, 2, 7, 12, 17, 3, 8, 13, 18, 4, 9, 14, 19];

export function getChartColor(index: number): string {
  return CHART_COLORS[COLOR_ORDER[index % COLOR_ORDER.length]];
}