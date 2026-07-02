import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNode } from '../graph/toFlow'
import type { TaskGroomNode } from '../types'

export const TaskNode = memo(({ data, selected }: NodeProps<FlowNode>) => {
  const t = data.groom as TaskGroomNode
  return (
    <div className={`gnode task${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="gnode-row">
        <span className="gnode-key">{t.id}</span>
        {t.discipline && <span className="badge">{t.discipline}</span>}
        {typeof t.estimate === 'number' && <span className="badge est">{t.estimate}</span>}
      </div>
      <div className="gnode-title">{t.title}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
