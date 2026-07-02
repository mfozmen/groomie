import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNode } from '../graph/toFlow'
import type { BugGroomNode } from '../types'

export const BugNode = memo(({ data, selected }: NodeProps<FlowNode>) => {
  const b = data.groom as BugGroomNode
  return (
    <div className={`gnode bug${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="gnode-key">{b.id}</div>
      <div className="gnode-title">{b.title}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
