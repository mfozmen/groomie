export type Pt = { x: number; y: number }

// SVG path for a polyline through the given points. ELK's orthogonal router returns the bend
// points that steer a layer-skipping edge around the nodes between its endpoints; drawing straight
// segments through them reproduces that route (right-angle turns) instead of a bezier that cuts
// through the intervening box.
export function pathThrough(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
}

// Corner radius for roundedPath — the arc that softens each routed bend.
export const CORNER_R = 8

// Like pathThrough, but rounds each interior corner with a short quadratic arc (radius r, clamped
// to half the shorter adjacent segment) so a routed edge reads as a smooth bend instead of a hard
// right-angle "jag". Falls back to a plain polyline for a 2-point (straight) path. A zero-length
// segment at a vertex is left un-rounded rather than dividing by zero.
export function roundedPath(points: Pt[], r = CORNER_R): string {
  if (points.length < 3) return pathThrough(points)
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const next = points[i + 1]
    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y)
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y)
    if (inLen === 0 || outLen === 0) {
      d += ` L${cur.x},${cur.y}`
      continue
    }
    const ri = Math.min(r, inLen / 2, outLen / 2)
    const p1 = { x: cur.x - ((cur.x - prev.x) / inLen) * ri, y: cur.y - ((cur.y - prev.y) / inLen) * ri }
    const p2 = { x: cur.x + ((next.x - cur.x) / outLen) * ri, y: cur.y + ((next.y - cur.y) / outLen) * ri }
    d += ` L${p1.x},${p1.y} Q${cur.x},${cur.y} ${p2.x},${p2.y}`
  }
  const last = points[points.length - 1]
  return `${d} L${last.x},${last.y}`
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
