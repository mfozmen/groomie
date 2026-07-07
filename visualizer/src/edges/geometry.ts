export type Pt = { x: number; y: number }

// SVG path for a polyline through the given points. ELK's orthogonal router returns the bend
// points that steer a layer-skipping edge around the nodes between its endpoints; drawing straight
// segments through them reproduces that route (right-angle turns) instead of a bezier that cuts
// through the intervening box.
export function pathThrough(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
}

// Point at fraction t (0..1) of the polyline's arc length. Used to sit the relationship label on
// the routed path (near the target, staggered) rather than the straight source→target midpoint,
// which for a routed edge no longer matches where the line actually runs. Zero-length segments are
// skipped (t never lands "inside" one), so duplicate bend points can't divide by zero.
export function pointAlong(points: Pt[], t: number): Pt {
  const clamped = Math.max(0, Math.min(1, t))
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    seg.push(d)
    total += d
  }
  if (total === 0) return points[0]
  let dist = clamped * total
  for (let i = 0; i < seg.length; i++) {
    if (dist < seg[i]) {
      const f = dist / seg[i]
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * f,
        y: points[i].y + (points[i + 1].y - points[i].y) * f,
      }
    }
    dist -= seg[i]
  }
  return points[points.length - 1]
}
