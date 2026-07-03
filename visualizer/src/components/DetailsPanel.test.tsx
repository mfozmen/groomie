import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DetailsPanel } from './DetailsPanel'
import type { GroomNode } from '../types'

describe('DetailsPanel', () => {
  it('shows the issue key and a placeholder when nothing is selected', () => {
    render(<DetailsPanel node={null} issueKey="PROJ-1" onLoadNew={() => {}} />)
    expect(screen.getByText('PROJ-1')).toBeInTheDocument()
    expect(screen.getByText(/click a node/i)).toBeInTheDocument()
  })

  it('falls back to "Groomie" without an issue key', () => {
    render(<DetailsPanel node={null} onLoadNew={() => {}} />)
    expect(screen.getByText('Groomie')).toBeInTheDocument()
  })

  it('fires onLoadNew when the button is clicked', () => {
    const onLoadNew = vi.fn()
    render(<DetailsPanel node={null} onLoadNew={onLoadNew} />)
    fireEvent.click(screen.getByRole('button', { name: /load another/i }))
    expect(onLoadNew).toHaveBeenCalledOnce()
  })

  it('renders epic details incl. business value and design', () => {
    const node: GroomNode = {
      id: 'E1',
      kind: 'epic',
      title: 'Dark Mode',
      description: 'the desc',
      businessValue: 'the value',
      design: 'figma link',
    }
    const { container } = render(<DetailsPanel node={node} onLoadNew={() => {}} />)
    expect(screen.getByText(/E1 · Epic/)).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    expect(screen.getByText('the desc')).toBeInTheDocument()
    expect(container.textContent).toContain('the value')
    expect(container.textContent).toContain('figma link')
  })

  it('renders story details with AC / test-case / link lists', () => {
    const node: GroomNode = {
      id: 'S1',
      kind: 'story',
      epicId: 'E1',
      title: 'As a user, I want X',
      acceptanceCriteria: ['AC one'],
      testCases: ['TC one'],
      links: ['LINK one'],
    }
    render(<DetailsPanel node={node} onLoadNew={() => {}} />)
    expect(screen.getByText(/S1 · Story/)).toBeInTheDocument()
    expect(screen.getByText('Acceptance Criteria')).toBeInTheDocument()
    expect(screen.getByText('AC one')).toBeInTheDocument()
    expect(screen.getByText('TC one')).toBeInTheDocument()
    expect(screen.getByText('LINK one')).toBeInTheDocument()
  })

  it('omits empty lists', () => {
    const node: GroomNode = { id: 'S2', kind: 'story', epicId: 'E1', title: 't', acceptanceCriteria: [] }
    render(<DetailsPanel node={node} onLoadNew={() => {}} />)
    expect(screen.queryByText('Acceptance Criteria')).toBeNull()
  })

  it('renders task details with discipline and estimate badges', () => {
    const node: GroomNode = {
      id: 'T1',
      kind: 'task',
      epicId: 'E1',
      title: 'Do the thing',
      discipline: 'Backend',
      implementation: ['step one'],
      doneWhen: ['it works'],
      estimate: 5,
    }
    render(<DetailsPanel node={node} onLoadNew={() => {}} />)
    expect(screen.getByText(/T1 · Task/)).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('step one')).toBeInTheDocument()
  })

  it('renders bug details', () => {
    const node: GroomNode = {
      id: 'B1',
      kind: 'bug',
      epicId: 'E1',
      title: 'Charts stay light',
      repro: 'switch to dark',
      expected: 'recolor',
      actual: 'stays light',
    }
    const { container } = render(<DetailsPanel node={node} onLoadNew={() => {}} />)
    expect(screen.getByText(/B1 · Bug/)).toBeInTheDocument()
    expect(container.textContent).toContain('switch to dark')
    expect(container.textContent).toContain('recolor')
    expect(container.textContent).toContain('stays light')
  })
})
