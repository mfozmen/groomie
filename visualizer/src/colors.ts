// Single source of truth for the kind palette on the JS side (React Flow minimap + edge
// strokes). Kept in sync with the CSS custom properties in index.css (--story/--task/--bug).
export const KIND_COLOR: Record<string, string> = {
  story: '#3b82f6',
  task: '#22c55e',
  bug: '#ef4444',
}
export const EPIC_COLOR = '#cbd5e1'
export const EDGE_BLOCKS = '#64748b'
export const EDGE_AFFECTS = '#ef4444'
