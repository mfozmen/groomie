// Mirrors the `<ISSUE-KEY>-groomed.json` contract documented in the plugin's
// breakdown-guide.md ("JSON graph output"). Keys are unique across the whole document.

export type NodeKind = 'epic' | 'story' | 'task' | 'bug'
export type EdgeKind = 'blocks' | 'affects'

export interface EpicGroomNode {
  id: string
  kind: 'epic'
  title: string
  description?: string
  businessValue?: string
  design?: string | null
}

export interface StoryGroomNode {
  id: string
  kind: 'story'
  epicId: string
  title: string
  description?: string
  links?: string[]
  acceptanceCriteria?: string[]
  testCases?: string[]
}

export interface TaskGroomNode {
  id: string
  kind: 'task'
  epicId: string
  title: string
  discipline?: string
  implementation?: string[]
  doneWhen?: string[]
  estimate?: number
}

export interface BugGroomNode {
  id: string
  kind: 'bug'
  epicId: string
  title: string
  repro?: string
  expected?: string
  actual?: string
}

export type GroomNode = EpicGroomNode | StoryGroomNode | TaskGroomNode | BugGroomNode

export interface GroomEdge {
  source: string
  target: string
  kind: EdgeKind
}

export interface GroomedGraph {
  issueKey?: string
  mode?: string
  nodes: GroomNode[]
  edges: GroomEdge[]
}
