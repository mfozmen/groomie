import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import type { GroomedGraph } from './types'

// Force the ELK layout to reject so App.loadGraph's catch branch runs.
vi.mock('./layout/elk', () => ({
  layout: vi.fn().mockRejectedValue(new Error('elk boom')),
}))

const graph: GroomedGraph = { nodes: [{ id: 'E1', kind: 'epic', title: 'e' }], edges: [] }

afterEach(() => {
  delete globalThis.__GROOMIE_GRAPH__
})

describe('App error handling', () => {
  it('surfaces a layout failure via the loader error state', async () => {
    globalThis.__GROOMIE_GRAPH__ = graph
    render(<App />)
    expect(await screen.findByText(/Could not render this graph/i)).toBeInTheDocument()
  })
})
