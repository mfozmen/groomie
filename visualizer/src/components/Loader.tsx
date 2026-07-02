import { useCallback, useState } from 'react'
import type { GroomedGraph } from '../types'

export function Loader({ onLoad }: { onLoad: (g: GroomedGraph) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [over, setOver] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      file
        .text()
        .then((text) => {
          const g = JSON.parse(text) as GroomedGraph
          if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) {
            throw new Error('not a Groomie graph (missing nodes/edges arrays)')
          }
          setError(null)
          onLoad(g)
        })
        .catch((e: unknown) => setError(`Could not load: ${(e as Error).message}`))
    },
    [onLoad],
  )

  return (
    <div
      className={`loader${over ? ' over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
      }}
    >
      <div className="loader-card">
        <h1>Groomie — Breakdown Graph</h1>
        <p>
          Drop a <code>&lt;ISSUE-KEY&gt;-groomed.json</code> here, or pick a file.
        </p>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
