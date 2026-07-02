import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNode } from '../graph/toFlow'
import type { StoryGroomNode } from '../types'

export const StoryNode = memo(({ data, selected }: NodeProps<FlowNode>) => {
  const s = data.groom as StoryGroomNode
  return (
    <div className={`gnode story${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="gnode-key">{s.id}</div>
      <div className="gnode-title">{s.title}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
