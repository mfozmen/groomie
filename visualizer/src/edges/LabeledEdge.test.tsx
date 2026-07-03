import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { EdgeProps } from '@xyflow/react'

// React Flow doesn't render edges in jsdom (it needs measured nodes), so stub the three edge
// primitives to plain DOM and unit-test LabeledEdge's own logic: the label text and its
// near-the-target position (LABEL_T = 0.82 of the way from source to target).
vi.mock('@xyflow/react', () => ({
  BaseEdge: (p: { path: string }) => <path data-testid="base" d={p.path} />,
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  getBezierPath: () => ['M0,0', 0, 0],
}))

import { LabeledEdge } from './LabeledEdge'

const props = {
  id: 'e0',
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 200,
  label: 'blocks',
  data: { kind: 'blocks', color: '#64748b' },
} as unknown as EdgeProps

describe('LabeledEdge', () => {
  it('renders the relationship label near the target end, in the edge color', () => {
    render(<LabeledEdge {...props} />)
    const label = screen.getByText('blocks')
    // 0.82 of the way: x = 82, y = 164
    expect(label.style.transform).toContain('82px')
    expect(label.style.transform).toContain('164px')
    expect(label.style.color).toBe('rgb(100, 116, 139)')
    expect(screen.getByTestId('base')).toBeInTheDocument()
  })

  it('falls back to the default position when the edge has no data (defensive)', () => {
    render(<LabeledEdge {...({ ...props, label: 'affects', data: undefined } as unknown as EdgeProps)} />)
    // default LABEL_T = 0.82 → x = 82, y = 164; no color set
    const label = screen.getByText('affects')
    expect(label.style.transform).toContain('82px')
    expect(label.style.color).toBe('')
  })
})
