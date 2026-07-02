import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../graph/toFlow'
import type { EpicGroomNode } from '../types'

export const EpicNode = memo(({ data }: NodeProps<FlowNode>) => {
  const epic = data.groom as EpicGroomNode
  return (
    <div className="epic-node">
      <div className="epic-header">
        <span className="epic-key">{epic.id}</span> Epic: {epic.title}
      </div>
    </div>
  )
})
