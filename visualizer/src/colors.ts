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

// Edge *label text* ink. Needs >=4.5:1 on the near-white label chip (REVIEW.md §5). The blocks
// slate passes as-is; the red stroke (#ef4444 ≈ 3.8:1) is too light for text, so its label uses a
// darkened red — same move as .gnode.bug using #7f1d1d text rather than the --bug stroke.
export const EDGE_BLOCKS_INK = EDGE_BLOCKS // #64748b ≈ 4.8:1 on white
export const EDGE_AFFECTS_INK = '#b91c1c' // red-700 ≈ 5.9:1 on white
