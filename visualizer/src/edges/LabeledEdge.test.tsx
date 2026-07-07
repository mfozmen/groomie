import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { EdgeProps } from '@xyflow/react'
import { EDGE_BLOCKS_INK } from '../colors'

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
  data: { kind: 'blocks', labelColor: EDGE_BLOCKS_INK, labelT: 0.82 },
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

  it('draws the routed path (rounded, not a bezier) when the edge carries bend points', () => {
    const routed = {
      ...props,
      data: { kind: 'blocks', labelColor: EDGE_BLOCKS_INK, labelT: 0.82, points: [{ x: 150, y: 100 }] },
    } as unknown as EdgeProps
    render(<LabeledEdge {...routed} />)
    // source (0,0) → bend (150,100) → target (100,200): the path starts at the source, rounds the
    // bend with a quadratic whose control point is the bend, ends at the target — and the mocked
    // getBezierPath fixture ('M0,0') is NOT used.
    const d = screen.getByTestId('base').getAttribute('d')!
    expect(d.startsWith('M0,0')).toBe(true)
    expect(d).toContain('Q150,100')
    expect(d.endsWith('L100,200')).toBe(true)
    expect(screen.getByText('blocks')).toBeInTheDocument()
  })
})
