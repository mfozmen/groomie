import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'
import { LABEL_T_BASE, type EdgeData } from '../graph/toFlow'
import { pathThrough, pointAlong } from './geometry'

// Draws the edge along ELK's routed bend points when it has to steer around intervening nodes
// (`data.points`, set by layout), falling back to a bezier for straight adjacent-layer edges.
// Places the relationship label ("blocks"/"affects") along the edge toward the TARGET end — in the
// gap approaching the node it points into — instead of at the geometric midpoint. React Flow's
// default edge label sits at the midpoint, which for an edge that skips a layer lands on top of an
// unrelated node in the middle. `labelT` (from toFlow, default LABEL_T_BASE) is how far along the
// edge (0 = source, 1 = target) the label sits, staggered per incoming edge so converging labels
// don't stack on the target.
export const LabeledEdge = memo(function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
  data,
}: EdgeProps) {
  const meta = (data ?? {}) as Partial<EdgeData>
  const t = meta.labelT ?? LABEL_T_BASE
  const routed = meta.points

  let path: string
  let x: number
  let y: number
  if (routed && routed.length > 0) {
    // Endpoints stay glued to the handles; ELK's bend points steer the middle around the boxes.
    const full = [{ x: sourceX, y: sourceY }, ...routed, { x: targetX, y: targetY }]
    path = pathThrough(full)
    const at = pointAlong(full, t)
    x = at.x
    y = at.y
  } else {
    ;[path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
    x = sourceX + (targetX - sourceX) * t
    y = sourceY + (targetY - sourceY) * t
  }

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="edge-label"
          style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, color: meta.labelColor }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})
