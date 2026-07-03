import { describe, expect, it, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import type { GroomedGraph } from './types'

const sample: GroomedGraph = {
  issueKey: 'DEMO-1',
  nodes: [
    { id: 'E1', kind: 'epic', title: 'Dark Mode' },
    { id: 'S1', kind: 'story', epicId: 'E1', title: 'a story' },
    { id: 'T1', kind: 'task', epicId: 'E1', title: 'a task' },
    { id: 'B1', kind: 'bug', epicId: 'E1', title: 'a bug' },
  ],
  edges: [
    { source: 'T1', target: 'S1', kind: 'blocks' },
    { source: 'B1', target: 'S1', kind: 'affects' },
  ],
}

afterEach(() => {
  delete globalThis.__GROOMIE_GRAPH__
})

describe('App', () => {
  it('shows the loader when no graph is injected', () => {
    render(<App />)
    expect(screen.getByText(/Breakdown Graph/i)).toBeInTheDocument()
  })

  it('loads an injected graph and renders its nodes', async () => {
    globalThis.__GROOMIE_GRAPH__ = sample
    render(<App />)
    // The epic title is rendered by EpicNode once ELK layout resolves.
    expect(await screen.findByText(/Dark Mode/)).toBeInTheDocument()
  })
})
