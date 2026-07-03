// Single source of truth for the kind palette on the JS side (React Flow minimap + edge
// strokes). Kept in sync with the CSS custom properties in index.css (--story/--task/--bug).
// Jira-default kinds: story green, task blue, bug red, epic purple.
export const KIND_COLOR: Record<string, string> = {
  story: '#22c55e',
  task: '#3b82f6',
  bug: '#ef4444',
}
export const EPIC_COLOR = '#8b5cf6'
export const EDGE_BLOCKS = '#64748b'
export const EDGE_AFFECTS = '#ef4444'
