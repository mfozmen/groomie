import type { GroomNode } from '../types'

export function DetailsPanel({
  node,
  issueKey,
  onLoadNew,
}: Readonly<{
  node: GroomNode | null
  issueKey?: string
  onLoadNew: () => void
}>) {
  return (
    <aside className="panel">
      <div className="panel-head">
        <strong>{issueKey ?? 'Groomie'}</strong>
        <button onClick={onLoadNew}>Load another</button>
      </div>
      {node ? (
        <NodeDetails node={node} />
      ) : (
        <p className="muted">Click a node to see its details.</p>
      )}
    </aside>
  )
}

function NodeDetails({ node }: Readonly<{ node: GroomNode }>) {
  switch (node.kind) {
    case 'epic':
      return (
        <div>
          <h2>{node.id} · Epic</h2>
          <h3>{node.title}</h3>
          {node.description && <p>{node.description}</p>}
          {node.businessValue && (
            <p>
              <em>Business value:</em> {node.businessValue}
            </p>
          )}
          {node.design && (
            <p>
              <em>Design:</em> {node.design}
            </p>
          )}
        </div>
      )
    case 'story':
      return (
        <div>
          <h2>{node.id} · Story</h2>
          <h3>{node.title}</h3>
          {node.description && <p>{node.description}</p>}
          <List title="Acceptance Criteria" items={node.acceptanceCriteria} />
          <List title="Test Cases" items={node.testCases} />
          <List title="Links" items={node.links} />
        </div>
      )
    case 'task':
      return (
        <div>
          <h2>
            {node.id} · Task{' '}
            {node.discipline && <span className="badge">{node.discipline}</span>}{' '}
            {typeof node.estimate === 'number' && <span className="badge est">{node.estimate}</span>}
          </h2>
          <h3>{node.title}</h3>
          <List title="Implementation" items={node.implementation} />
          <List title="Done when" items={node.doneWhen} />
        </div>
      )
    case 'bug':
      return (
        <div>
          <h2>{node.id} · Bug</h2>
          <h3>{node.title}</h3>
          {node.repro && (
            <p>
              <em>Repro:</em> {node.repro}
            </p>
          )}
          {node.expected && (
            <p>
              <em>Expected:</em> {node.expected}
            </p>
          )}
          {node.actual && (
            <p>
              <em>Actual:</em> {node.actual}
            </p>
          )}
        </div>
      )
  }
}

function List({ title, items }: Readonly<{ title: string; items?: string[] }>) {
  if (!items?.length) return null
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {items.map((it, i) => (
          // Content+index: list items are user-authored and may repeat, so content alone
          // isn't a unique key; the index keeps it unique without being a pure-index key.
          <li key={`${it}-${i}`}>{it}</li>
        ))}
      </ul>
    </div>
  )
}
