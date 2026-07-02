import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { GroomedGraph } from './types'
import { toFlow } from './graph/toFlow'
import { layout } from './layout/elk'
import { EpicNode } from './nodes/EpicNode'
import { StoryNode } from './nodes/StoryNode'
import { TaskNode } from './nodes/TaskNode'
import { BugNode } from './nodes/BugNode'
import { DetailsPanel } from './components/DetailsPanel'
import { Loader } from './components/Loader'
import { EPIC_COLOR, KIND_COLOR } from './colors'

const nodeTypes = { epic: EpicNode, story: StoryNode, task: TaskNode, bug: BugNode }

const nodeColor = (n: Node) => KIND_COLOR[n.type ?? ''] ?? EPIC_COLOR

// A single-file HTML export injects the graph here before the bundle runs.
declare global {
  interface Window {
    __GROOMIE_GRAPH__?: GroomedGraph
  }
}

export function App() {
  const [graph, setGraph] = useState<GroomedGraph | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadGraph = useCallback(async (g: GroomedGraph) => {
    try {
      const flow = toFlow(g)
      const laidOut = await layout(flow.nodes, flow.edges)
      setGraph(g)
      setNodes(laidOut)
      setEdges(flow.edges)
      setSelectedId(null)
      setError(null)
    } catch (e) {
      setError(`Could not render this graph: ${(e as Error).message}`)
    }
  }, [])

  useEffect(() => {
    if (window.__GROOMIE_GRAPH__) void loadGraph(window.__GROOMIE_GRAPH__)
  }, [loadGraph])

  const selected = useMemo(
    () => graph?.nodes.find((n) => n.id === selectedId) ?? null,
    [graph, selectedId],
  )

  if (!graph) return <Loader onLoad={loadGraph} error={error} />

  return (
    <ReactFlowProvider>
      <div className="app">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable nodeColor={nodeColor} />
        </ReactFlow>
        <DetailsPanel node={selected} issueKey={graph.issueKey} onLoadNew={() => setGraph(null)} />
      </div>
    </ReactFlowProvider>
  )
}
