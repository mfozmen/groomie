import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

// Places the relationship label ("blocks"/"affects") along the edge toward the TARGET end — in the
// gap approaching the node it points into — instead of at the geometric midpoint. React Flow's
// default edge label sits at the midpoint, which for an edge that skips a layer lands on top of an
// unrelated node in the middle. `labelT` (from toFlow, default 0.82) is how far along the edge
// (0 = source, 1 = target) the label sits, staggered per incoming edge so converging labels don't
// stack on the target.
const DEFAULT_LABEL_T = 0.82

export function LabeledEdge({
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
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
  const meta = (data ?? {}) as { color?: string; labelT?: number }
  const t = meta.labelT ?? DEFAULT_LABEL_T
  const x = sourceX + (targetX - sourceX) * t
  const y = sourceY + (targetY - sourceY) * t
  const color = meta.color

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="edge-label"
          style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, color }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
