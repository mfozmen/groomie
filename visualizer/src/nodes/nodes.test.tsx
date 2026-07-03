import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import type { ReactNode } from 'react'
import { EpicNode } from './EpicNode'
import { StoryNode } from './StoryNode'
import { TaskNode } from './TaskNode'
import { BugNode } from './BugNode'

// Story/Task/Bug render <Handle>, which needs a ReactFlow store from the provider.
const wrap = (ui: ReactNode) => render(<ReactFlowProvider>{ui}</ReactFlowProvider>)
// NodeProps is large; the nodes only read data.groom + selected, so a partial prop is enough.
const p = (groom: unknown, selected = false) => ({ data: { groom }, selected }) as never

describe('node components', () => {
  it('EpicNode shows the key and title', () => {
    wrap(<EpicNode {...p({ id: 'E1', kind: 'epic', title: 'Dark Mode' })} />)
    expect(screen.getByText('E1')).toBeInTheDocument()
    expect(screen.getByText(/Dark Mode/)).toBeInTheDocument()
  })

  it('StoryNode shows the key and title', () => {
    wrap(<StoryNode {...p({ id: 'S1', kind: 'story', epicId: 'E1', title: 'a story' })} />)
    expect(screen.getByText('S1')).toBeInTheDocument()
    expect(screen.getByText('a story')).toBeInTheDocument()
  })

  it('TaskNode shows discipline + estimate badges (and selected style)', () => {
    const { container } = wrap(
      <TaskNode {...p({ id: 'T1', kind: 'task', epicId: 'E1', title: 't', discipline: 'Backend', estimate: 5 }, true)} />,
    )
    expect(screen.getByText('T1')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(container.querySelector('.gnode.task.selected')).not.toBeNull()
  })

  it('TaskNode without discipline/estimate renders no badges', () => {
    const { container } = wrap(<TaskNode {...p({ id: 'T2', kind: 'task', epicId: 'E1', title: 't' })} />)
    expect(container.querySelectorAll('.badge')).toHaveLength(0)
  })

  it('BugNode shows the key and title', () => {
    wrap(<BugNode {...p({ id: 'B1', kind: 'bug', epicId: 'E1', title: 'a bug' })} />)
    expect(screen.getByText('B1')).toBeInTheDocument()
    expect(screen.getByText('a bug')).toBeInTheDocument()
  })
})
