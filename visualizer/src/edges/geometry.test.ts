import { describe, expect, it } from 'vitest'
import { pathThrough, pointAlong, roundedPath } from './geometry'

describe('pathThrough', () => {
  it('renders an SVG polyline: move to the first point, line to the rest', () => {
    expect(pathThrough([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 20 }])).toBe('M0,0 L10,0 L10,20')
  })
})

describe('roundedPath', () => {
  it('falls back to a plain polyline for a straight 2-point path', () => {
    expect(roundedPath([{ x: 0, y: 0 }, { x: 10, y: 10 }])).toBe('M0,0 L10,10')
  })

  it('rounds an interior corner with a quadratic whose control point is the vertex', () => {
    // right 100 then down 100: the corner at (100,0) is cut back by the radius on each side.
    const d = roundedPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }], 8)
    expect(d).toBe('M0,0 L92,0 Q100,0 100,8 L100,100')
  })

  it('clamps the radius to half the shorter adjacent segment', () => {
    // segments of length 4 then 100: radius clamps to 2, not 8.
    const d = roundedPath([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 100 }], 8)
    expect(d).toBe('M0,0 L2,0 Q4,0 4,2 L4,100')
  })

  it('leaves a zero-length segment un-rounded (no divide-by-zero)', () => {
    const d = roundedPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 8)
    expect(d).toContain('L10,0')
    expect(d.startsWith('M0,0')).toBe(true)
    expect(d.endsWith('L10,10')).toBe(true)
  })
})

describe('pointAlong', () => {
  // An L-shaped route: right 100, then down 100 → total arc length 200.
  const L = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]

  it('t=0 → the source end', () => {
    expect(pointAlong(L, 0)).toEqual({ x: 0, y: 0 })
  })

  it('t=0.5 → the corner (halfway by arc length)', () => {
    expect(pointAlong(L, 0.5)).toEqual({ x: 100, y: 0 })
  })

  it('t=0.75 → partway down the second segment', () => {
    expect(pointAlong(L, 0.75)).toEqual({ x: 100, y: 50 })
  })

  it('t=1 → the target end', () => {
    expect(pointAlong(L, 1)).toEqual({ x: 100, y: 100 })
  })

  it('clamps t below 0 and above 1 to the endpoints', () => {
    expect(pointAlong(L, -1)).toEqual({ x: 0, y: 0 })
    expect(pointAlong(L, 2)).toEqual({ x: 100, y: 100 })
  })

  it('returns the first point when the polyline has zero total length', () => {
    expect(pointAlong([{ x: 5, y: 5 }, { x: 5, y: 5 }], 0.5)).toEqual({ x: 5, y: 5 })
  })

  it('skips zero-length segments without dividing by zero', () => {
    // duplicate middle point → a zero-length segment in the middle of a real route
    const dup = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }]
    expect(pointAlong(dup, 0.5)).toEqual({ x: 10, y: 0 })
  })
})
